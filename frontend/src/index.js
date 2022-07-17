import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import TWEEN from "@tweenjs/tween.js";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    // <React.StrictMode>
        <App/>
    // </React.StrictMode>
);

function tick(time) {
    requestAnimationFrame(tick)
    TWEEN.update(time)
}

requestAnimationFrame(tick)