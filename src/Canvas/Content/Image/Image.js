import './Image.sass'
import {forwardRef, memo} from "react";
import {useEffect, useState} from "react";

export default memo(function Image(props) {

    const [width, setWidth] = useState(props.w)

    useEffect(() => {
        let w

        switch (props.delta.corner) {
            case "br":
                w = width + props.delta.dx
                break

            case "tr":
                w = width - props.delta.dy
                break

            case "tl":
                w = width - props.delta.dx
                break

            case "bl":
                w = width - props.delta.dx
                break
            default:
                w = props.w
        }

        setWidth(w)
        props.change({w})



    }, [props.delta])


    return (
        <img src={props.src} className="image" unselectable="true" style={{
            width: width + 'px'
        }} />
    )
})