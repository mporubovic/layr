import {configureStore} from "@reduxjs/toolkit";
import inputManager from "./inputManager";
import resizerSlice from "./resizer";
import canvasSlice from "./canvas";
import conceptSlice from "./concept";
import consoleSlice from "./console";
import conceptsSlice from "./concepts";
import menuSlice from "./menu";

export const state = configureStore({
    reducer: {
        inputManager: inputManager.reducer,
        resizer: resizerSlice.reducer,
        canvas: canvasSlice.reducer,
        concept: conceptSlice.reducer,
        console: consoleSlice.reducer,
        concepts: conceptsSlice.reducer,
        menu: menuSlice.reducer
    }
})