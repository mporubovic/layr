import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    mouseInContentId: null,
    x: 0,
    y: 0,
    scale: 0
}

const canvasSlice = createSlice({
    name: 'canvasSlice',
    initialState,
    reducers: {
        setMouseInContentId: (state, action) => {
            state.mouseInContentId = action.payload
        },
        setDimensions: (state, action) => {
            let { x, y, scale } = action.payload
            if (x) state.x = x
            if (y) state.y = y
            if (scale) state.scale = scale
        }
    }
})

export default canvasSlice