import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

window.apiURL = "http://127.0.0.1:2001/"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    // <React.StrictMode>
        <App/>
    // </React.StrictMode>
);
