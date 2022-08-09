import {createSlice} from "@reduxjs/toolkit";


const initialState = {
    show: false,
    commands: [],
    title: ''
}

const consoleSlice = createSlice({
    name: 'consoleSlice',
    initialState,
    reducers: {
        setShow: (state, action) => {
            state.show = action.payload
        }
    }
})

export default consoleSlice