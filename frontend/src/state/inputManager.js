import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    key: {
        Meta: {
            down: false
        }
    },
    mouse: {
        down: false,
        x: 0,
        y: 0
    }
}

const inputManager = createSlice({
    name: 'inputManager',
    initialState,
    reducers: {
        setMetaDown: (state, action) => {
            state.key.Meta.down = action.payload
        },
        setMouseDown: (state, action) => {
            let { down } = action.payload
            state.mouse.down = down
        },
        setMousePosition: (state, action) => {
            let { x, y, canvas } = action.payload
            state.mouse.x = x
            state.mouse.y = y
            state.mouse.canvas = canvas
        }
    }
})

export default inputManager