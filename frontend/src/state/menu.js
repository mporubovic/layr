import {createSlice} from "@reduxjs/toolkit";


const initialState = {
    menuId: null
}

const menuSlice = createSlice({
    name: 'menuSlice',
    initialState,
    reducers: {
        setMenuId: (state, action) => {
            state.menuId = action.payload
        },
    }
})

export default menuSlice