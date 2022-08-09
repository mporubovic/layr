import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    mouseInContentId: null,
    x: 0,
    y: 0,
    scale: 0,
    placeholders: []
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
        },
        addPlaceholder: (state, action) => {
            state.placeholders.push(action.payload)
        },
        removePlaceholder: (state, action) => {
            let idx = state.placeholders.findIndex(p => p.id === action.payload)
            state.placeholders.splice(idx, 1)
        }
    }
})

export default canvasSlice