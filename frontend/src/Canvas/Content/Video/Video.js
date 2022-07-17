import './Video.sass'
import {forwardRef} from "react";

export default forwardRef((props, ref) => {



    return (
        <video controls loop
               onMouseEnter={(e) => e.target.play()}
               onMouseOut={(e) => e.target.pause()}
               ref={ref}
               className="video"
               src={window.apiURL + props.src}
               style={{
                   ...props.style
               }}
        />
    )
})
