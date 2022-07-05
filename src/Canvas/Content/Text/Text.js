import './Text.sass'
import {forwardRef} from "react";

export default forwardRef((props, ref) => {

    const font = 20

    return (
        <div className="text" ref={ref}
         style={{
            fontSize: font + "px",
            ...props.style
        }}>
            {props.text}
        </div>
    )
})