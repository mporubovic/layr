import {createSlice} from "@reduxjs/toolkit";
import _ from "lodash";
import Frontend from "../frontend";
import * as Backend from "../../../backend/config";
import contentTypes, {getIcon, getProcessFunction} from "../Canvas/Content/contentTypes";
import {v4 as uuidv4} from "uuid";
import canvasSlice from "./canvas";
// import {state} from "./state";


const initialState = {
    // id: null,
    // name: null,
    // user_id: null,
    // content: null,
    // metadata: null,
    // created_at: null,
    // updated_at: null
}

const timeout = 1000
let contentTimeout, conceptTimeout

const conceptSlice = createSlice({
    name: 'conceptSlice',
    initialState,
    reducers: {
        setConcept: (state, action) => {
            return { ...action.payload }
        },
        updateConceptMetaData: (state, action) => {
            if (conceptTimeout) clearTimeout(conceptTimeout)
            const id = state.id

            conceptTimeout = setTimeout(() => {
                Frontend.request(
                    Backend.Endpoint.CONCEPTS,
                    Backend.Operation.UPDATE,
                    {
                        concept: {
                            id,
                            metadata: JSON.stringify(action.payload)
                        }
                    })
            }, timeout)

            state.metadata = action.payload
        },
        updateContent: (state, action) => {
            let id = action.payload.id
            let data = action.payload.data

            return {
                ...state,
                content: state.content.map(c => { // TODO: is this the best way?
                    if (c.local.id === id) return { ...c, ...data }
                    else return c
                })
            }

        },
        addContent: (state, action) => {
            state.content.push(action.payload)
            Frontend.request(
                    Backend.Endpoint.CONCEPTS,
                    Backend.Operation.UPDATE,
                {concept: { id: state.id, content: JSON.stringify(state.content) }})
        },
        deleteContent: (state, action) => {
            let idx = state.content.findIndex(c => c.local.id === action.payload)

            if ([contentTypes.IMAGE, contentTypes.VIDEO].includes(state.content[idx].type)) {
                Frontend.request(Backend.Endpoint.CONTENT, Backend.Operation.DELETE, { content: {src: state.content[idx].src} })
            }

            state.content.splice(idx, 1)

            Frontend.request(
                Backend.Endpoint.CONCEPTS,
                Backend.Operation.UPDATE,
                {concept: { id: state.id, content: JSON.stringify(state.content) }})
        }

    }
})

export const updateContent = ({ id, data, local = false }) => {
    return function updateContentThunk(dispatch, getState) {
        dispatch(conceptSlice.actions.updateContent({ id, data }))
        if (local) return

        if (contentTimeout) clearTimeout(contentTimeout)
        contentTimeout = setTimeout(() => {
            let state = getState()
            let c = _.cloneDeep(state.concept)

            c.content.forEach(__c => {
                delete __c.local
            })

            c.metadata = {
                canvas: {
                    x: state.canvas.x,
                    y: state.canvas.y,
                    scale: state.canvas.scale
                }
            }

            c.content = JSON.stringify(c.content)
            c.metadata = JSON.stringify(c.metadata)
            Frontend.request(Backend.Endpoint.CONCEPTS, Backend.Operation.UPDATE, { concept: c })
        }, timeout)
    }

}



function _createContent(type, data, position) {
    return {
        type,
        ...data,

        x: position.x,
        y: position.y,
        scale: data?.scale ?? 1,

        local: {
            id: uuidv4(),
        },

    }
}

export const createContent = ({ type, data }) => {
    return function createContentThunk(dispatch, getState) {
        let position = getState().inputManager.mouse.canvas

        let asyncContent = [contentTypes.IMAGE, contentTypes.VIDEO, contentTypes.LINK]

        if (asyncContent.includes(type)) {

            let placeholder = {
                ...position,
                icon: getIcon(type),
                id: uuidv4()
            }

            dispatch(canvasSlice.actions.addPlaceholder(placeholder))

            getProcessFunction(type)(data, (_data) => {
                dispatch(canvasSlice.actions.removePlaceholder(placeholder.id))
                dispatch(conceptSlice.actions.addContent(_createContent(type, _data, position)))

            })
        }
        else {
            getProcessFunction(type)(data, (_data) => {
                let ctnt = _createContent(type, _data, position)
                dispatch(conceptSlice.actions.addContent(ctnt))

                return (__data) => {
                    dispatch(updateContent({ id: ctnt.local.id, data: __data }))
                    // onContentUpdate(ctnt.local.id, __data)
                }
            })
        }
    }
}

export default conceptSlice
