import './Content.sass'

import {useEffect, useRef, useState, memo} from "react";

import Resizer from "./Resizer/Resizer";

import useStateRef from "react-usestateref";
import boards from '../demo.js'

import Video from "./Video/Video";
import Image from "./Image/Image";
import Text from "./Text/Text";

const components = {
    "image": Image,
    "video": Video,
    "text": Text,
}

export default memo(function Content(props) {

    const content = props.content

    const contentDiv = useRef()
    const contentWrapperDiv = useRef()

    const [metaDown, setMetaDown] = useState(false)

    const resizing = useRef(false)
    const [mouseIn, setMouseIn] = useState(false)
    const resizeActive = ((metaDown && mouseIn) || resizing.current) && !props.lock

    const [x, setX, xRef] = useStateRef(content.x)
    const [y, setY, yRef] = useStateRef(content.y)
    const [delta, setDelta, deltaRef] = useStateRef({})

    function onKeydown(e) {
        if (e.key === "Meta") setMetaDown(true)
    }

    function onKeyup(e) {
        if (e.key === "Meta") setMetaDown(false)
    }

    function onPointerDown() {
        if (!resizing.current) {
            resizing.current = true
            props.startResize()
        }
    }

    function onPointerMove(movementX, movementY, corner) {

        if (!resizing.current) return

        let x = xRef.current
        let y = yRef.current
        let dx = (movementX/props.canvasScale)
        let dy = (movementY/props.canvasScale)
        
        setDelta({
            dx,
            dy,
            corner
        })

        let rect = contentDiv.current.getBoundingClientRect()
        let aspect = rect.width/rect.height

        switch (corner) {
            case "br":
                break

            case "tr":
                setY(y + dy/aspect)
                break

            case "tl":
                setX(x + dx)
                setY(y + dx/aspect)
                break

            case "bl":
                setX(x + dx)
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

    function onPointerUp() {
        if (resizing.current) {
            resizing.current = false
            props.stopResize()

            let c = boards[0].content.find(c => c.id === content.id)
            c.x = xRef.current
            c.y = yRef.current

            localStorage.setItem("boards", JSON.stringify(boards))
        }
    }

    function updateContentProperties(props) {
        let c = boards[0].content.findIndex(c => c.id === content.id)
        boards[0].content[c] = {...boards[0].content[c], ...props}
    }

    useEffect(() => {
        window.addEventListener("keydown", onKeydown)
        window.addEventListener("keyup", onKeyup)

        return () => {
            window.removeEventListener("keydown", onKeydown)
            window.removeEventListener("keyup", onKeyup)
        }
    })

    const Component = components[content.type]

    return (
        <div className="content" ref={contentWrapperDiv}
             style={{
                 transform: `translate(${x}px, ${y}px)`,
             }}
             onMouseEnter={() => setMouseIn(true)}
             onMouseLeave={() => setMouseIn(false)}
        >
            {
                <Component ref={contentDiv} {...content} delta={delta} change={updateContentProperties}
                     style={{...(props.lock || resizeActive) && { pointerEvents: "none", userSelect: "none"}}}
                />
            }

            {
                resizeActive &&
                (<Resizer
                          scale={props.canvasScale}
                          pointerMove={onPointerMove}
                          pointerUp={onPointerUp}
                          pointerDown={onPointerDown}
                />)
            }


        </div>




    )
})