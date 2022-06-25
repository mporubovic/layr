import './Content.sass'
import Image from "./Image/Image";
import Text from "./Text/Text";
import {useEffect, useRef, useState, memo} from "react";
import Video from "./Video/Video";
import Resizer from "./Resizer/Resizer";

import useStateRef from "react-usestateref";

import boards from '../demo.js'


export default memo(function Content(props) {

    const content = props.content

    const contentDiv = useRef()
    const contentWrapperDiv = useRef()

    const [metaDown, setMetaDown, metaDownRef] = useStateRef(false)
    const [mouseIn, setMouseIn, mouseInRef] = useStateRef(false)

    const [pointerdown, setPointerdown, pointerdownRef] = useStateRef(false)

    const resizing = useRef(false)
    const resizeActive = ((metaDownRef.current && mouseInRef.current) || resizing.current) && !props.lock
    const resizeCorner = useRef(null)


    const [x, setX, xRef] = useStateRef(content.x)
    const [y, setY, yRef] = useStateRef(content.y)
    const [delta, setDelta, deltaRef] = useStateRef({})
    // const [w, setW, wRef] = useStateRef(content.w)
    // const [fontsize, setFontsize, fontsizeRef] = useStateRef(content.fontSize)

    function onKeydown(e) {
        if (e.key === "Meta") setMetaDown(true)
    }

    function onKeyup(e) {
        if (e.key === "Meta") setMetaDown(false)
    }

    function onPointermove(e) {

        if (pointerdownRef.current && metaDownRef.current && !resizing.current) {
            resizing.current = true
            props.startResize()
        }

        if (!resizing.current) return

        // console.log(resizeCorner.current)

        let x = xRef.current
        let y = yRef.current
        // let w = wRef.current
        // let fontsize = fontsizeRef.current
        let dx = (e.movementX/props.canvasScale)
        let dy = (e.movementY/props.canvasScale)
        
        setDelta({
            dx,
            dy,
            corner: resizeCorner.current
        })

        let rect = contentWrapperDiv.current.getBoundingClientRect()
        let aspect = rect.width/rect.height

        switch (resizeCorner.current) {
            case "br":
                // if (wRef.current) setW(w + dx)
                // if (fontsizeRef.current) setFontsize(fontsize + dx/aspect)
                break

            case "tr":
                setY(y + dy/aspect)
                // if (wRef.current) setW(w - dy)
                // if (fontsizeRef.current) setFontsize(fontsize - dy/aspect)
                break

            case "tl":
                setX(x + dx)
                setY(y + dx/aspect)
                // if (wRef.current) setW(w - dx)
                // if (fontsizeRef.current) setFontsize(fontsize - dx/aspect)
                break

            case "bl":
                setX(x + dx)
                // if (wRef.current) setW(w - dx)
                // if (fontsizeRef.current) setFontsize(fontsize - dx/aspect)
                break

            default:
                setX(x + dx)
                setY(y + dy)
        }


    }

    function onPointerdown() {
        setPointerdown(true)
    }

    function onPointerup() {
        setPointerdown(false)
        if (resizing.current) {
            resizing.current = false
            resizeCorner.current = null
            props.stopResize()

            let c = boards[0].content.find(c => c.id === content.id)
            c.x = xRef.current
            c.y = yRef.current
            // if (wRef.current) c.w = wRef.current
            // if (fontsizeRef.current) c.fontSize = fontsizeRef.current

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
        window.addEventListener("pointermove", onPointermove)
        contentDiv.current.addEventListener("pointerdown", onPointerdown)
        window.addEventListener("pointerup", onPointerup)

        return () => {
            window.removeEventListener("keydown", onKeydown)
            window.removeEventListener("keyup", onKeyup)
            window.removeEventListener("pointermove", onPointermove)
            contentDiv.current.removeEventListener("pointerdown", onPointerdown)
            window.removeEventListener("pointerup", onPointerup)
        }
    }, [props.canvasScale])

    return (
        <div className="content" ref={contentDiv}
             style={{
                 transform: `translate(${x}px, ${y}px)`,
                 // width: w && w + "px",
                 // fontSize: fontsize && fontsize + "px"
             }}
             onMouseEnter={() => setMouseIn(true)}
             onMouseLeave={() => setMouseIn(false)}

        >
            <div ref={contentWrapperDiv} style={(props.lock || resizeActive) ? {
                pointerEvents: "none",
                userSelect: "none"
            } : null}>
                {
                    (() => {
                        switch (content.type) {
                            case "image":
                                return (<Image {...content} lock={resizeActive} delta={delta} change={updateContentProperties} />)

                            case "text":
                                return (<Text {...content} lock={resizeActive} delta={delta} change={updateContentProperties} />)

                            case "video":
                                return (<Video {...content} lock={resizeActive} delta={delta} change={updateContentProperties} />)

                            default:
                                console.error("Invalid content type", content.type)
                                break
                        }
                    })()
                }
            </div>

            { resizeActive &&
                (<Resizer
                    corner={(c) => resizeCorner.current = c}
                />)
            }
        </div>
    )
})