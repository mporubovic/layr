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
    }
}

const inputManager = createSlice({
    name: 'inputManager',
    initialState,
    reducers: {
        setMetaDown: (state, action) => {
            state.key.Meta.down = action.payload
        },
        setMouse: (state, action) => {
            // let { down } = action.payload
            // state.mouse.down = down
            state.mouse = {
                ...state.mouse,
                ...action.payload
            }
        }
    }
})

export default inputManager
export { INPUT }