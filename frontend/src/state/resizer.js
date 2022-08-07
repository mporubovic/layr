import {createSlice} from "@reduxjs/toolkit";


const initialState = {
    // contentId: null,
    // show: false,
    resizing: false
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