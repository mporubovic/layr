import {createSlice} from "@reduxjs/toolkit";

const INPUT = {
    KEY: {
        META: 'Meta'
    },

}

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
            let { x, y } = action.payload
            state.mouse.x = x
            state.mouse.y = y
        }
    }
})

export default inputManager
export { INPUT }