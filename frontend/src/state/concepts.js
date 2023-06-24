import {createSlice} from "@reduxjs/toolkit";
import Frontend from "../frontend";
import * as Backend from "../config";
import conceptSlice from "./concept";
import _ from "lodash";
import {v4 as uuidv4} from "uuid";
import canvasSlice from "./canvas";
import demo from "../demo.json";

const initialState = []

const conceptsSlice = createSlice( {
    name: 'conceptsSlice',
    initialState,
    reducers: {
        receiveConcepts: (state, action) => {
            return action.payload
        },
        newConcept: (state, action) => {
            state.push(action.payload)
        }
    }
})

export default conceptsSlice


export const fetchConcepts = () => {
    return function fetchConceptsThunk(dispatch, getState) {
        Frontend.request(Backend.Endpoint.CONCEPTS, Backend.Operation.LIST).then((r) => {
            let concepts = r.data.data
            let commands = []

            concepts.sort((a, b) => new Date(a['updated_at']) > new Date(b['updated_at']) ? -1 : 1)
            concepts.forEach(c => c.metadata = JSON.parse(c.metadata))

            dispatch(conceptsSlice.actions.receiveConcepts(concepts))

            return commands

        }).catch(console.error)
    }
}

export const createConcept = (data) => {
    return function createConceptThunk(dispatch, getState) {
        let c = {
            name: data.name ?? "New concept",
            content: JSON.stringify([])
        }

        Frontend.request(Backend.Endpoint.CONCEPTS, Backend.Operation.CREATE, {concept: c}).then((r) => {
            let newConcept = r.data.data
            newConcept.content = JSON.parse(newConcept.content)

            dispatch(conceptSlice.actions.setConcept(newConcept))

            let _newConcept = _.cloneDeep(newConcept)
            delete _newConcept.content

            dispatch(conceptsSlice.actions.newConcept(_newConcept))
        })
    }
}

export const openConcept = (id) => {
    return function openConceptThunk(dispatch, getState) {
            let _concept = demo
            _concept.content = JSON.parse(_concept.content)
            _concept.metadata = JSON.parse(_concept.metadata)
            _concept.content.forEach(c => {
                c.local = {
                    id: uuidv4(),
                }
            })

            if (_concept.metadata) {
                dispatch(canvasSlice.actions.setDimensions({
                    x: _concept.metadata.canvas.x,
                    y: _concept.metadata.canvas.y,
                    scale: _concept.metadata.canvas.scale
                }))
            }

            dispatch(conceptSlice.actions.setConcept(_concept))
        }
}