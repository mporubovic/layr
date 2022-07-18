import './Canvas.sass'
import {useEffect, useRef, useState} from "react";
import Content from "./Content/Content";
import useStateRef from "react-usestateref";
import Resizer from "./Content/Resizer/Resizer";
import Console from "./Console/Console";
import contentTypes from "./Content/contentTypes";
import {v4 as uuidv4} from "uuid"

import _ from "lodash"
import TWEEN from "@tweenjs/tween.js";
import Frontend from "../frontend";
import * as Backend from "../../../backend/config.js";

export default function Canvas() {

    const scaleMax = 10
    const scaleMin = 0.1
    const zoomStep = 1 / 100 // the higher the zoom step, the faster it zooms

    const div = useRef(null)

    const [x, setX, xRef] = useStateRef(0)
    const [y, setY, yRef] = useStateRef(0)
    const [scale, setScale, scaleRef] = useStateRef(1)

    const [currentResizingContentId, setCurrentResizingContentId, currentResizingContentIdRef] = useStateRef(null)
    const [metaDown, setMetaDown, metaDownRef] = useStateRef(false)
    const [mouseIn, setMouseIn, mouseInRef] = useStateRef(null)
    const [resizeDelta, setResizeDelta] = useState(null)
    const showResizerRef = useRef(false)
    showResizerRef.current = (metaDown && (mouseIn || currentResizingContentId))

    const [showConsole, setShowConsole, showConsoleRef] = useStateRef(true)
    const mousePosition = useRef({x: window.innerWidth/2, y: window.innerHeight/2})

    const [concept, setConcept, conceptRef] = useStateRef(null)
    const backendTimeout = useRef(null)

    const backspaceCounter = useRef(0)
    const clickTimeStamp = useRef(0)

    const onKeyDown = (e) => {
        e.key === "Meta" && setMetaDown(true)
        if (e.key === "/" && !showConsoleRef.current) {
            setShowConsole(true)
        }
        else if (e.key === "Backspace" && showResizerRef.current) {
            backspaceCounter.current++
            if (backspaceCounter.current === 2) {
                deleteContent(currentResizingContentIdRef.current || mouseInRef.current)
            }
        }
        else {
            backspaceCounter.current = 0
        }
        // e.key === "Escape" && showConsoleRef && setShowConsole(false)
    }

    const onKeyUp = (e) => {
        if (e.key === "Meta") setMetaDown(false)
        else backspaceCounter.current = 0
    }


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

    const onMouseEnter = (c) => setMouseIn(c.local.id)
    const onMouseLeave = () => {
        if (metaDownRef.current && (mouseInRef.current || currentResizingContentIdRef.current)) return
        setMouseIn(null)
    }

    const onMouseMove = (e) => {
        mousePosition.current = {x: e.clientX, y: e.clientY}
        backspaceCounter.current = 0
    }

    const mouseToCanvasPosition = (x, y) => {
        return {
            x: -(window.innerWidth/2 - x + xRef.current)/scaleRef.current,
            y: -(window.innerHeight/2 - y + yRef.current)/scaleRef.current
        }
    }

    const centerContentOnScreen = (c) => {
        const animationTime = 300

        let rect = c.local.ref.getBoundingClientRect()

        let windowAspect = window.innerWidth / window.innerHeight
        let contentAspect = rect.width / rect.height

        let dScale = contentAspect > windowAspect ? (0.8 * window.innerWidth) / rect.width : (0.8 * window.innerHeight) / rect.height

        let nextScale = scaleRef.current * dScale

        let nextx = (window.innerWidth/2 + xRef.current - (rect.x + rect.width/2))*dScale
        let nexty = (window.innerHeight/2 + yRef.current - (rect.y + rect.height/2))*dScale

        const dimensions = {x: xRef.current, y: yRef.current, scale: scaleRef.current}

        let tween = new TWEEN.Tween(dimensions)
                                .to({x: nextx, y: nexty, scale: nextScale}, animationTime)
                                .easing(TWEEN.Easing.Quadratic.Out)
                                .onUpdate(() => {
                                    setX(dimensions.x)
                                    setY(dimensions.y)
                                    setScale(dimensions.scale)
                                })
        tween.start()
    }

    const onClick = (e) => {
        let delta = e.timeStamp - clickTimeStamp.current

        if (delta < 200) { // double-click
            let first = e.composedPath()[0]
            let c = conceptRef.current.content.find(c => c.local.ref === first)
            if (c) centerContentOnScreen(c)
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

                        const formData = new FormData()
                        formData.append("file", file)

                        let reader = new FileReader()

                        Frontend.fileRequest(Backend.Endpoint.CONTENT, Backend.Operation.CREATE, formData)
                            .then((r) => {
                                if (r.data.status === Backend.Status.ERROR) return console.warn(r.data.error)
                                let url = r.data.data

                                reader.onload = (data) => {

                                    if (file.type.includes("image")) {
                                        let img = new Image()
                                        img.src = data.target.result

                                        img.onload = () => {
                                            let scale = window.innerWidth / (5 * img.width)
                                            createContent(contentTypes.Image, {src: url, scale})

                                            img.onload = null
                                            img = null
                                        }
                                    }
                                    else if (file.type.includes("video")) {
                                        let vid = document.createElement("video")
                                        vid.src = data.target.result

                                        vid.onloadedmetadata = () => {
                                            let scale = window.innerWidth / (5 * vid.videoWidth)

                                            createContent(contentTypes.Video, {src: url, scale})

                                            vid.onloadedmetadata = null
                                            vid = null
                                        }

                                        vid.load()

                                    }



                                }

                                reader.readAsDataURL(file)




                            })
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
        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)
        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("drop", onDrop)
        window.addEventListener("dragover", onDragOver)
        window.addEventListener("click", onClick)

        concept && concept.content.forEach(c => {
            c.local.ref?.addEventListener("mouseenter", () => onMouseEnter(c))
            c.local.ref?.addEventListener("mouseleave", onMouseLeave)
        })

        return () => {
            window.removeEventListener("wheel", onWheel)
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("drop", onDrop)
            window.removeEventListener("dragover", onDragOver)
            window.removeEventListener("click", onClick)


            concept && concept.content.forEach(c => {
                c.local.ref?.removeEventListener("mouseenter", () => onMouseEnter(c))
                c.local.ref?.removeEventListener("mouseleave", onMouseLeave)
            })
        }
    }, [concept])


    function startResize() {
        setCurrentResizingContentId(mouseInRef.current)
    }

    function onResize(dx, dy, corner) {
        setResizeDelta({dx, dy, corner})
    }

    function stopResize() {
        setCurrentResizingContentId(null)
        setResizeDelta(null)
    }


    function createContent(type, data) {

        let relativePosition = mouseToCanvasPosition(mousePosition.current.x, mousePosition.current.y)

        let content = {
            x: relativePosition.x,
            y: relativePosition.y,
            local: {
                ref: null,
                id: uuidv4(),
            }
        }

        switch (type) {
            case contentTypes.Text:
                content = {
                    ...content,
                    type: "Text",
                    text: "LOREM IPSUM",
                    scale: 1,
                }
                break

            case contentTypes.Image:
                content = {
                    ...content,
                    type: "Image",
                    src: data.src,
                    scale: data.scale
                }

                break

            case contentTypes.Video:
                content = {
                    ...content,
                    type: "Video",
                    src: data.src,
                    scale: data.scale
                }

        }

        let c = _.cloneDeep(conceptRef.current)
        c.content.push(content)

        postUpdatedConcept(c)
        setConcept(c)
        setShowConsole(false)
    }

    function deleteContent(id) {
        let c = _.cloneDeep(conceptRef.current)
        let idx = conceptRef.current.content.findIndex(c => c.local.id === id)

        if (["Image", "Video"].indexOf(c.content[idx].type) !== -1) {
            Frontend.request(Backend.Endpoint.CONTENT, Backend.Operation.DELETE, { content: {src: c.content[idx].src} })
        }

        c.content.splice(idx, 1)

        setCurrentResizingContentId(null)
        setResizeDelta(null)
        setMouseIn(false)
        setConcept(c)

        postUpdatedConcept(c)
    }

    function postUpdatedConcept(c) {
        let _c = _.cloneDeep(c)

        _c.content.forEach(__c => {
            delete __c.local
        })


        sendToBackend(_c)
    }

    function sendToBackend(data) {
        if (backendTimeout.current) clearTimeout(backendTimeout.current)

        backendTimeout.current = setTimeout(() => {
            console.log("Posting to backend")
            data.content = JSON.stringify(data.content)
            Frontend.request(Backend.Endpoint.CONCEPTS, Backend.Operation.UPDATE, {concept: data}).then((r) => {
                if (r.data.status === Backend.Status.ERROR) console.warn(r.data.error)
            })
        }, 1000)
    }

    function openConcept(id) {
        setShowConsole(false)
        Frontend.request(Backend.Endpoint.CONCEPTS, Backend.Operation.ONE, {concept: {id}}).then((r) => {
            let _concept = r.data.data
            _concept.content = JSON.parse(_concept.content)
            _concept.content.forEach(c => {
                c.local = {
                    id: uuidv4(),
                    ref: null,
                }
            })

            setConcept(_concept)
        })
    }

    function onContentUpdate(id, data) {
        let idx = conceptRef.current.content.findIndex(c => c.local.id === id)
        conceptRef.current.content[idx] = {...conceptRef.current.content[idx], ...data}
        postUpdatedConcept(conceptRef.current)
    }

    function createConcept(name) {
        let c = {
            name: name ?? "New concept",
            content: JSON.stringify([])
        }

        Frontend.request(Backend.Endpoint.CONCEPTS, Backend.Operation.CREATE, {concept: c}).then((r) => {
            r.data.data.content = JSON.parse(r.data.data.content)
            setConcept(r.data.data)
            setShowConsole(false)
        })

    }

    return (
        <div className="container">
            {
                concept && (<div className="title">{ concept.name }</div>)
            }
            <div className="canvas" ref={div} style={{
                transform: `translate(${x}px, ${y}px) scale(${scale})`
            }}>

                {
                    concept && concept.content.map((c) => (
                        <Content key={c.local.id} ref={(r) => c.local.ref = r}
                                 content={c}
                                 lock={currentResizingContentId && currentResizingContentId !== c.local.id}
                                 canvasScale={scale}
                                 resizeDelta={currentResizingContentId === c.local.id && resizeDelta}
                                 update={(data) => onContentUpdate(c.local.id, data)}
                        />
                        )
                    )
                }

            </div>

            {
                showResizerRef.current &&
                (<Resizer
                    content={concept.content.find(c => c.local.id === (mouseIn || currentResizingContentId))}
                    onMouseLeave={() => setMouseIn(null)}
                    canvas={{x, y, scale}}
                    pointerMove={onResize}
                    pointerUp={stopResize}
                    pointerDown={startResize}
                />)
            }


            {
                showConsole &&
                (<Console
                    mousePosition={mousePosition.current}
                    close={() => setShowConsole(false)}
                    createContent={createContent}
                    createConcept={createConcept}
                    openConcept={openConcept}
                />)
            }
        </div>
    )
}