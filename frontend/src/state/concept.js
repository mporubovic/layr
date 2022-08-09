import {createSlice} from "@reduxjs/toolkit";
import _ from "lodash";
import Frontend from "../frontend";
import * as Backend from "../../../backend/config";


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
            Frontend.request(Backend.Endpoint.CONCEPTS, Backend.Operation.UPDATE, {concept: c})
        }, timeout)
    }

}

export default conceptSlice