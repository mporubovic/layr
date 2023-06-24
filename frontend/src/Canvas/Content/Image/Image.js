import './Image.sass'
import * as Backend from "../../../config"

export default function Image(props) {

    const src = (props.src.includes("data") ? "" : Backend.Server.EXTERNAL_CONTENT_URL + "/") + props.src

    return (
        <img src={src} className="image" unselectable="true" draggable="false"
             style={{
                ...props.style
             }}
        />
    )
}