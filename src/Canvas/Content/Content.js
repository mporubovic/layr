import './Content.sass'

import {useEffect, useRef, memo, forwardRef, useImperativeHandle} from "react";

import useStateRef from "react-usestateref";
import Video from "./Video/Video";
import Image from "./Image/Image";
import Text from "./Text/Text";

const components = {
    image: Image,
    video: Video,
    text: Text,
}

export default memo(forwardRef((props, inRef) => {

    const contentRef = useRef()
    useImperativeHandle(inRef, () => contentRef.current, [contentRef])
    // https://stackoverflow.com/questions/57278120/using-react-callback-ref-with-forwarded-ref

    const content = props.content

    const contentWrapperDiv = useRef()

    const [x, setX, xRef] = useStateRef(content.x)
    const [y, setY, yRef] = useStateRef(content.y)
    const [scale, setScale, scaleRef] = useStateRef(content.scale)

    function resize() {
        if (!props.resizeDelta) return

        let x = xRef.current
        let y = yRef.current
        let dx = (props.resizeDelta.dx/props.canvasScale)
        let dy = (props.resizeDelta.dy/props.canvasScale)

        let rect = contentRef.current.getBoundingClientRect()
        let aspect = rect.width/rect.height

        switch (props.resizeDelta.corner) {
            case "br":
                setScale(scaleRef.current + (props.resizeDelta.dy)*scaleRef.current/rect.height)
                break

            case "tr":
                setScale(scaleRef.current - (props.resizeDelta.dy)*scaleRef.current/rect.height)
                // setScale(scaleRef.current - dy*scaleRef.current/rect.height)
                setY(y + dy)
                // console.log(dy, scaleRef.current, rect.height, dy*scaleRef.current)
                // setY(y - dy*scaleRef.current/rect.height)
                break

            case "tl":
                setX(x + dy)
                setY(y + dy)
                // setScale(scaleRef.current - )

                break

            case "bl":
                console.log()
                setScale(scaleRef.current + (props.resizeDelta.dy)*scaleRef.current/rect.height)
                setX(x - ((props.resizeDelta.dy)*scaleRef.current/rect.height)*rect.width)
                break

            case "t":
            case "l":
            case "r":
            case "b":
                break

            default:
                setX(x + dx)
                setY(y + dy)
        }
    }

    useEffect(() => {
        resize()
    }, [props.resizeDelta])

    const Component = components[content.type]

    return (
        <div className="content" ref={contentWrapperDiv}
             style={{
                 transform: `translate(${x}px, ${y}px) scale(${scale})`,
             }}
        >
            {
                <Component ref={contentRef} {...content}
                     style={{...(props.lock) && { pointerEvents: "none", userSelect: "none"}}}
                />
            }


        </div>




    )
}))