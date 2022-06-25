import './Video.sass'
import {memo, useEffect, useState} from "react";

export default function Video(props) {

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
        <video autoPlay controls loop muted
               className="video" src={props.src}
               style={{
                   width: width + "px"
               }}
        />
    )
}




//