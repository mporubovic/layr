import {createSlice} from "@reduxjs/toolkit";


const initialState = {
    resizingContentIds: []
}

const resizerSlice = createSlice({
    name: 'resizerSlice',
    initialState,
    reducers: {
        setResizingContentIds: (state, action) => {
            state.resizingContentIds = action.payload
        }
    }
})

export default resizerSlice