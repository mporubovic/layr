import './Canvas.sass'
import {useEffect, useRef, useState} from "react";
import Content from "./Content/Content";
// import defaultBoards from './demo.js'
import useStateRef from "react-usestateref";
import Resizer from "./Content/Resizer/Resizer";
import Console from "./Console/Console";
import contentTypes from "./Content/contentTypes";
import {v4 as uuidv4} from "uuid"
import axios from "axios";

import _ from "lodash"
import Video from "./Content/Video/Video";

// const _boards = JSON.parse(localStorage.getItem("boards")) ?? defaultBoards
// defaultBoards[0] = _concept

// _concept.content.forEach(c => {
//     c.local = {
//         ref: null,
//         mouseIn: false
//     }
// })

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
    const apiTimeout = useRef(null)

    const backspaceCounter = useRef(0)

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

    const onDrop = (e) => {
        e.preventDefault()

        if (e.dataTransfer.items) {
            mousePosition.current = {x: e.clientX, y: e.clientY}
            for (let i of e.dataTransfer.items) {
                if (i.kind === "file") {
                    let file = i.getAsFile()
                    console.log(file)
                    if (file.type.match(/(image|video)/i)) {

                        const formData = new FormData()
                        formData.append("file", file)

                        let reader = new FileReader()

                        axios.post(window.apiURL + 'content', formData, {headers: {"Content-Type": "multipart/form-data"}})
                            .then((r) => {
                                let url = r.data

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
                                        console.log(data)

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
            axios.delete(window.apiURL + "content/" + c.content[idx].src)
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


        sendToApi(_c)
    }

    function sendToApi(data) {
        if (apiTimeout.current) clearTimeout(apiTimeout.current)

        apiTimeout.current = setTimeout(() => {
            console.log("Posting to backend")
            axios.post(window.apiURL + "concepts", {
                concept: data
            })
        }, 1000)
    }

    function openConcept(id) {
        setShowConsole(false)
        axios.get(window.apiURL + `concept/${id}`).then((r) => {
            let _concept = r.data
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

    function createConcept() {

    }

    return (
        <div className="container">
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