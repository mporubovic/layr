import './Image.sass'
import {forwardRef} from "react";
import * as Backend from "../../../../../backend/config.js"

export default forwardRef((props, ref) => {

    const src = (props.src.includes("data") ? "" : Backend.Server.EXTERNAL_CONTENT_URL + "/") + props.src

    return (
        <img src={src} ref={ref} className="image" unselectable="true" draggable="false"
             style={{
                ...props.style
             }}
        />
    )
})