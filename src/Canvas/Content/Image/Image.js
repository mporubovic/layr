import './Image.sass'
import {forwardRef} from "react";

export default forwardRef((props, ref) => {

    const src = (props.src.includes("data") ? "" : window.apiURL) + props.src

    return (
        <img src={src} ref={ref} className="image" unselectable="true" draggable="false"
             style={{
                ...props.style
             }}
        />
    )
})