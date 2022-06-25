import './Canvas.sass'
import {useEffect, useRef, useState} from "react";
import Content from "./Content/Content";
import _boards from './demo.js'
import useStateRef from "react-usestateref";

const boards = JSON.parse(localStorage.getItem("boards")) ?? _boards
_boards[0] = boards[0]

export default function Canvas() {

    const scaleMax = 10
    const scaleMin = 0.1
    const zoomStep = 1 / 100 // the higher the zoom step, the faster it zooms

    const div = useRef(null)

    const [x, setX, xRef] = useStateRef(0)
    const [y, setY, yRef] = useStateRef(0)

    const [scale, setScale, scaleRef] = useStateRef(1)

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

    useEffect(() => {
        window.addEventListener("wheel", onWheel, {passive: false})

        return () => {
            window.removeEventListener("wheel", onWheel)
        }
    }, [])




    const [currentResizingContentId, setCurrentResizingContentId] = useState(false)


    return (
        <div className="container">
            <div className="canvas" ref={div} style={{
                transform: `translate(${x}px, ${y}px) scale(${scale})`
            }}>

                {
                    boards[0].content.map(c => (
                            <Content key={c.id}
                                     content={c}
                                     startResize={() => setCurrentResizingContentId(c.id)}
                                     stopResize={() => setCurrentResizingContentId(false)}
                                     lock={currentResizingContentId && currentResizingContentId !== c.id}
                                     canvasScale={scale}
                            />
                        )
                    )
                }

            </div>
        </div>
    )
}