import './Video.sass'
import {forwardRef} from "react";
import * as Backend from "../../../../../backend/config.js"

export default forwardRef((props, ref) => {

    return (
        <video controls loop
               onMouseEnter={(e) => e.target.play()}
               onMouseOut={(e) => e.target.pause()}
               ref={ref}
               className="video"
               src={Backend.Server.EXTERNAL_CONTENT_URL + "/" + props.src}
               style={{
                   ...props.style
               }}
        />
    )
})
