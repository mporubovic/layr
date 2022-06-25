import './Text.sass'
import {memo} from "react";
import {useEffect, useState} from "react";

export default memo(function Text(props) {

    const [font, setFont] = useState(props.fontSize)

    useEffect(() => {
        let f

        switch (props.delta.corner) {
            case "br":
                f = font + props.delta.dx / 10
                break

            case "tr":
                f = font - props.delta.dy / 10
                break

            case "tl":
                f = font - props.delta.dx / 10
                break

            case "bl":
                f = font - props.delta.dx / 10
                break
            default:
                f = props.fontSize
        }

        setFont(f)
        props.change({fontSize: f})



    }, [props.delta])

    return (
        <div className="text" style={{
            fontSize: font + "px"
        }}>
            {props.text}
        </div>
    )
})