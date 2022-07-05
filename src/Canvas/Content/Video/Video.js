import './Video.sass'
import {forwardRef} from "react";

export default forwardRef((props, ref) => {
    return (
        <video autoPlay controls loop muted
               ref={ref}
               className="video" src={props.src}
               style={{
                   ...props.style
               }}
        />
    )
})
