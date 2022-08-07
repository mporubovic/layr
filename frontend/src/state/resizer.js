import {createSlice} from "@reduxjs/toolkit";


const initialState = {
    resizingContentId: null
}

const resizerSlice = createSlice({
    name: 'resizerSlice',
    initialState,
    reducers: {
        setResizingContentId: (state, action) => {
            state.resizingContentId = action.payload
        }
    }
})

export default resizerSlice