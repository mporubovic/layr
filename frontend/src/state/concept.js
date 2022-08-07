import {createSlice} from "@reduxjs/toolkit";


const initialState = {
    id: null,
    name: null,
    user_id: null,
    content: null,
    metadata: null,
    created_at: null,
    updated_at: null
}

const conceptSlice = createSlice({
    name: 'conceptSlice',
    initialState,
    reducers: {
        setConcept: (state, action) => {
            return { ...action.payload }
        },
        updateContent: (state, action) => {
            let id = action.payload.id
            let data = action.payload.data

            // console.log(id, data)

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

export default conceptSlice