import {createSlice} from "@reduxjs/toolkit";
import Frontend from "../frontend";
import * as Backend from "../../../backend/config";

const initialState = []

const conceptsSlice = createSlice( {
    name: 'conceptsSlice',
    initialState,
    reducers: {
        receiveConcepts: (state, action) => {
            return action.payload
        }
    }
})


export const fetchConcepts = () => {
    return function fetchConceptsThunk(dispatch, getState) {
        Frontend.request(Backend.Endpoint.CONCEPTS, Backend.Operation.LIST).then((r) => {
            let concepts = r.data.data
            let commands = []

            concepts.sort((a, b) => new Date(a['updated_at']) > new Date(b['updated_at']) ? -1 : 1)

            dispatch(conceptsSlice.actions.receiveConcepts(concepts))

            // concepts.forEach(c => {
            //     commands.push({
            //         name: c.name,
            //         displayName: c.name,
            //         icon: require('./icons/cloud.svg').default,
            //         callback: () => openConcept(c.id),
            //         prefix: '\\'
            //     })
            // })

            return commands

        }).catch(console.error)
    }
}