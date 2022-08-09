import {configureStore} from "@reduxjs/toolkit";
import inputManager from "./inputManager";
import resizerSlice from "./resizer";
import canvasSlice from "./canvas";
import conceptSlice from "./concept";
import consoleSlice from "./console";

export const state = configureStore({
    reducer: {
        inputManager: inputManager.reducer,
        resizer: resizerSlice.reducer,
        canvas: canvasSlice.reducer,
        concept: conceptSlice.reducer,
        console: consoleSlice.reducer,
        concepts: conceptSlice.reducer
    }
})