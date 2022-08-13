import './Canvas.sass'
import {useEffect, useRef, useState} from "react";
import Content from "./Content/Content";
import Resizer from "./Resizer/Resizer";
import Console from "./Console/Console";
import contentTypes from "./Content/contentTypes";
import TWEEN from "@tweenjs/tween.js";
import Placeholder from "./Content/Placeholder/Placeholder";
import Menu from "./Menu/Menu";
import {useDispatch, useSelector} from "react-redux";
import inputManager from "../state/inputManager";
import conceptSlice, {createContent} from "../state/concept";
import canvasSlice from "../state/canvas";
import {openConcept} from "../state/concepts";


export default function Canvas() {

    const scaleMax = 10
    const scaleMin = 0.1
    const zoomStep = 1 / 100 // the higher the zoom step, the faster it zooms
    const cursorColor = useSelector(state => state.canvas.cursorColor)

    const div = useRef(null)

    const x = useSelector(state => state.canvas.x)
    const y = useSelector(state => state.canvas.y)
    const scale = useSelector(state => state.canvas.scale)

    const mousePosition = useRef({x: window.innerWidth/2, y: window.innerHeight/2})
    const mouseInContentId = useSelector(state => state.canvas.mouseInContentId)

    const concept = useSelector(state => state.concept)

    const clickTimeStamp = useRef(0)

    const placeholders = useSelector(state => state.canvas.placeholders)

    const [program, setProgram] = useState(null)
    const Program = program && program.component

    const onKeyDown = (e) => {
        if (e.key === "Meta") dispatch(inputManager.actions.setMetaDown(true))
    }

    const onKeyUp = (e) => {
        if (e.key === "Meta") dispatch(inputManager.actions.setMetaDown(false))
    }

    function onWheel(e) {
        e.preventDefault()

        let gesture = e.ctrlKey ? 'zoom' : 'pan'

        if (gesture === "zoom") onZoom(e)
        else if (gesture === "pan") onPan(e)

        dispatch(conceptSlice.actions.updateConceptMetaData({ canvas: { x, y, scale } }))
    }

    function onZoom(e) {
        let delta = -e.deltaY * (zoomStep)
        let zoomDirection = delta < 0 ? 'out' : 'in'

        if (scale + delta > scaleMax) delta = scaleMax - scale
        else if (scale + delta < scaleMin) delta = scaleMin - scale

        let rect = div.current.getBoundingClientRect()
        let dx = ((rect.x + rect.width / 2 - e.clientX) / scale) * delta
        let dy = ((rect.y + rect.height / 2 - e.clientY) / scale) * delta

        modifyScale(delta)
        modifyXY(dx, dy)
    }

    function onPan(e) {
        modifyXY(-e.deltaX, -e.deltaY)
    }

    function modifyScale(delta) {
        dispatch(canvasSlice.actions.setDimensions({ scale: scale + delta }))
    }

    function modifyXY(dx, dy) {
        dispatch(canvasSlice.actions.setDimensions({ x: x + dx, y: y + dy }))
    }

    const onMouseMove = (e) => {
        mousePosition.current = {x: e.clientX, y: e.clientY}
        dispatch(inputManager.actions.setMousePosition({ x: e.clientX, y: e.clientY, canvas: mouseToCanvasPosition(e.clientX, e.clientY) }))
    }

    const mouseToCanvasPosition = (mx, my) => {
        return {
            x: -(window.innerWidth/2 - mx + x)/scale,
            y: -(window.innerHeight/2 - my + y)/scale
        }
    }

    const centerContentOnScreen = (c) => {
        const animationTime = 300
        const sizeMultiplier = 0.8

        let rect = c.local.rect

        let windowAspect = window.innerWidth / window.innerHeight
        let contentAspect = rect.width / rect.height

        let dScale = contentAspect > windowAspect
                        ? (sizeMultiplier * window.innerWidth) / rect.width
                        : (sizeMultiplier * window.innerHeight) / rect.height

        let nextScale = scale * dScale

        let nextx = (window.innerWidth/2 + x - (rect.x + rect.width/2))*dScale
        let nexty = (window.innerHeight/2 + y - (rect.y + rect.height/2))*dScale

        const dimensions = { x, y, scale }

        let tween = new TWEEN.Tween(dimensions)
                                .to({x: nextx, y: nexty, scale: nextScale}, animationTime)
                                .easing(TWEEN.Easing.Quadratic.Out)
                                .onUpdate(() => {
                                    dispatch(canvasSlice.actions.setDimensions({
                                        x: dimensions.x,
                                        y: dimensions.y,
                                        scale: dimensions.scale
                                    }))
                                    dispatch(conceptSlice.actions.updateConceptMetaData({ canvas: { x, y, scale } })) // TODO: move to canvas state
                                })
        tween.start()
    }

    const onClick = (e) => {
        let delta = e.timeStamp - clickTimeStamp.current

        if (delta < 200) { // double-click
            let contentDiv = e.composedPath().find(el => el.className === 'content')
            if (contentDiv) {
                let c = concept.content.find(c => c.local.id === mouseInContentId)
                if (c) centerContentOnScreen(c)
            }
        }

        clickTimeStamp.current = e.timeStamp
    }

    const onDrop = (e) => {
        e.preventDefault()

        if (e.dataTransfer.items) {
            mousePosition.current = {x: e.clientX, y: e.clientY}
            for (let i of e.dataTransfer.items) {
                if (i.kind === "file") {
                    let file = i.getAsFile()
                    if (file.type.match(/(image|video)/i)) {
                        let reader = new FileReader()
                        let contentType
                        if (file.type.includes("image")) contentType = contentTypes.IMAGE
                        else if (file.type.includes("video")) contentType = contentTypes.VIDEO

                        reader.readAsDataURL(file)
                        reader.onload = (data) => {
                            dispatch(createContent({ type: contentType, data: { file, data: data.target.result }, async: false }))
                        }
                    }
                }
            }
        }
    }

    const onDragOver = (e) => {
        e.preventDefault()
    }

    useEffect(() => {
        window.addEventListener("wheel", onWheel, {passive: false})

        return () => {
            window.removeEventListener("wheel", onWheel)
        }
    }, [x, y, scale])

    useEffect(() => { // TODO: this gets fired every time mouseInContentId changes
        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)
        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("drop", onDrop)
        window.addEventListener("dragover", onDragOver)
        window.addEventListener("click", onClick)

        return () => {
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("drop", onDrop)
            window.removeEventListener("dragover", onDragOver)
            window.removeEventListener("click", onClick)
        }
    }, [concept])

    useEffect(() => {
        dispatch(openConcept(3))
    }, [])

    return (
        <div className="container">
            {
                concept && (<div className="title">{ concept.name }</div>)
            }
            <div className="canvas" ref={div} style={{
                transform: `translate(${x}px, ${y}px) scale(${scale})`
            }}>

                {
                    concept.content && concept.content.map((c) => (
                        <Content key={c.local.id}
                                 contentId={c.local.id}
                            // registerCommands={(cmds) => c.local.commands = cmds}
                                 registerCommands={() => null}
                        />
                        )
                    )
                }

                {
                    placeholders[0] && placeholders.map((p, id) => (
                        <Placeholder key={id}
                                     x={p.x}
                                     y={p.y}
                                     icon={p.icon}
                        />
                    ))
                }

            </div>

            <Resizer />

            <Console />

            <Menu />

            {
                program &&
                (
                    <Program
                        mousePosition={mousePosition.current}
                        close={() => setProgram(null)}
                    />
                )
            }

        </div>
    )
}