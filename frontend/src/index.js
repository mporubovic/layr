import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import TWEEN from "@tweenjs/tween.js";
import {state} from "./state/state";
import {Provider} from "react-redux";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    // <React.StrictMode>
    <Provider store={state} >
        <App/>
    </Provider>
    // </React.StrictMode>
);

function tick(time) {
    requestAnimationFrame(tick)
    TWEEN.update(time)
}

requestAnimationFrame(tick)