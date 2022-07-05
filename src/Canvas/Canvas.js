import './Canvas.sass'
import {useEffect, useRef, useState} from "react";
import Content from "./Content/Content";
import _boards from './demo.js'
import useStateRef from "react-usestateref";
import Resizer from "./Content/Resizer/Resizer";

const boards = JSON.parse(localStorage.getItem("boards")) ?? _boards
_boards[0] = boards[0]

boards[0].content.forEach(c => {
    c.local = {
        ref: null,
        mouseIn: false
    }
})

export default function Canvas() {

    const scaleMax = 10
    const scaleMin = 0.1
    const zoomStep = 1 / 100 // the higher the zoom step, the faster it zooms

    const div = useRef(null)

    const [x, setX, xRef] = useStateRef(0)
    const [y, setY, yRef] = useStateRef(0)
    const [scale, setScale, scaleRef] = useStateRef(1)

    const [currentResizingContentId, setCurrentResizingContentId] = useState(false)

    const [metaDown, setMetaDown] = useState(false)
    const [mouseIn, setMouseIn, mouseInRef] = useStateRef(null)

    const onKeyDown = (e) => e.key === "Meta" && setMetaDown(true)
    const onKeyUp = (e) => e.key === "Meta" && setMetaDown(false)

    const showResizer = (metaDown && (mouseIn || currentResizingContentId))

    const [resizeDelta, setResizeDelta] = useState(null)

    function onWheel(e) {
        e.preventDefault()

        let gesture = e.ctrlKey ? 'zoom' : 'pan'

        if (gesture === "zoom") onZoom(e)
        else if (gesture === "pan") onPan(e)
    }

    function onZoom(e) {
        let delta = -e.deltaY * (zoomStep)
        let zoomDirection = delta < 0 ? 'out' : 'in'

        if (scaleRef.current + delta > scaleMax) delta = scaleMax - scaleRef.current
        else if (scaleRef.current + delta < scaleMin) delta = scaleMin - scaleRef.current

        let rect = div.current.getBoundingClientRect()
        let dx = ((rect.x + rect.width / 2 - e.clientX) / scaleRef.current) * delta
        let dy = ((rect.y + rect.height / 2 - e.clientY) / scaleRef.current) * delta

        modifyScale(delta)
        modifyXY(dx, dy)
    }

    function onPan(e) {
        modifyXY(-e.deltaX, -e.deltaY)
    }

    function modifyScale(delta) {
        setScale(scaleRef.current + delta)
    }

    function modifyXY(x, y) {
        setX(xRef.current + x)
        setY(yRef.current + y)
    }

    const onMouseEnter = (c) => setMouseIn(c.id)
    const onMouseLeave = () => setMouseIn(null)

    useEffect(() => {
        window.addEventListener("wheel", onWheel, {passive: false})
        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)

        boards[0].content.forEach(c => {
            c.local.ref.addEventListener("mouseenter", () => onMouseEnter(c))
            // c.local.ref.addEventListener("mouseleave", onMouseLeave)
        })

        return () => {
            window.removeEventListener("wheel", onWheel)
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)

            boards[0].content.forEach(c => {
                c.local.ref.removeEventListener("mouseenter", () => onMouseEnter(c))
                // c.local.ref.removeEventListener("mouseleave", onMouseLeave)
            })
        }
    }, [])


    function startResize() {
        setCurrentResizingContentId(mouseInRef.current)
    }

    function onResize(dx, dy, corner) {
        setResizeDelta({dx, dy, corner})
    }

    function stopResize() {
        setCurrentResizingContentId(null)
        setResizeDelta(null)

        // save

        //     if (resizing.current) {
        //         resizing.current = false
        //         props.stopResize()
        //
        //         let c = boards[0].content.find(c => c.id === content.id)
        //         c.x = xRef.current
        //         c.y = yRef.current
        //         c.scale = scaleRef.current
        //
        //         localStorage.setItem("boards", JSON.stringify(boards))
        //     }
    }

    return (
        <div className="container">
            <div className="canvas" ref={div} style={{
                transform: `translate(${x}px, ${y}px) scale(${scale})`
            }}>

                {

                    boards[0].content.map(c => (
                            <Content key={c.id} ref={(r) => c.local.ref = r}
                                     content={c}
                                     lock={currentResizingContentId && currentResizingContentId !== c.id}
                                     canvasScale={scale}
                                     resizeDelta={currentResizingContentId === c.id && resizeDelta}
                            />
                        )
                    )
                }

            </div>

            {
                showResizer &&
                (<Resizer
                    contentId={mouseIn || currentResizingContentId}
                    onMouseLeave={onMouseLeave}
                    canvas={{x, y, scale}}
                    pointerMove={onResize}
                    pointerUp={stopResize}
                    pointerDown={startResize}
                />)
            }
        </div>
    )
}