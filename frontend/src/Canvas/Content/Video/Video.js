import './Video.sass'
import * as Backend from "../../../config"

export default function Video(props) {
    return (
        <video controls loop
               onMouseEnter={(e) => e.target.play()}
               onMouseOut={(e) => e.target.pause()}
               className="video"
               src={Backend.Server.EXTERNAL_CONTENT_URL + "/" + props.src}
               style={props.style}
        />
    )
}