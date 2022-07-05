import './Image.sass'
import {forwardRef} from "react";

export default forwardRef((props, ref) => {

    return (
        <img src={props.src} ref={ref} className="image" unselectable="true" draggable="false"
             style={{
                ...props.style
             }}
        />
    )
})