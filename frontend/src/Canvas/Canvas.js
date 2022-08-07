import './Canvas.sass'
import {useEffect, useRef, useState} from "react";
import Content from "./Content/Content";
import useStateRef from "react-usestateref";
import Resizer from "./Resizer/Resizer";
import Console from "./Console/Console";
import contentTypes, {getProcessFunction, getIcon} from "./Content/contentTypes";
import {v4 as uuidv4} from "uuid"

import _ from "lodash"
import TWEEN from "@tweenjs/tween.js";
import Frontend from "../frontend";
import * as Backend from "../../../backend/config.js";
import Placeholder from "./Content/Placeholder/Placeholder";
import {register as registerCanvasCommands, reset as resetCanvasCommands, canvasCommands} from "./canvasCommands";
import Menu from "./Menu/Menu";
import {useDispatch, useSelector} from "react-redux";
import inputManager from "../state/inputManager";
import conceptSlice from "../state/concept";
import canvasSlice from "../state/canvas";


export default function Canvas() {

    const scaleMax = 10
    const scaleMin = 0.1
    const zoomStep = 1 / 100 // the higher the zoom step, the faster it zooms

    const dispatch = useDispatch()

    const div = useRef(null)

    const [x, setX, xRef] = useStateRef(0)
    const [y, setY, yRef] = useStateRef(0)
    const [scale, setScale, scaleRef] = useStateRef(1)


    const currentContentIsFocusedRef = useRef(false)

    const metaDown = useSelector(state => state.inputManager.key.Meta.down)

    const [mouseIn, setMouseIn, mouseInRef] = useStateRef(null)

    const [showConsole, setShowConsole, showConsoleRef] = useStateRef(false)
    const [consolePrefix, setConsolePrefix] = useState()
    const [consoleCommands, setConsoleCommands] = useState([])
    const mousePosition = useRef({x: window.innerWidth/2, y: window.innerHeight/2})

    const [concept, setConcept, conceptRef] = useStateRef(null)
    const backendTimeout = useRef(null)

    const clickTimeStamp = useRef(0)

    const [placeholders, setPlaceholders] = useState([])
    // const [placeholders, setPlaceholders] = useState([{x: 0, y: 0, icon: getIcon(contentTypes.LINK)}])

    const [menuItems, setMenuItems] = useState(null)

    const [program, setProgram] = useState(null)
    const Program = program && program.component

    const onKeyDown = (e) => {
        if (e.key === "Meta") dispatch(inputManager.actions.setMetaDown(true))

        if ((e.key === "/" || e.key === "\\") && !showConsoleRef.current && !currentContentIsFocusedRef.current) {
            e.preventDefault()
            if (e.key === "/") {
                let content = conceptRef.current?.content.find(c => c.local.id === mouseInRef.current)

                if (content && content.local.commands) setConsoleCommands(content.local.commands)
                else setConsoleCommands(canvasCommands)

                setConsolePrefix(e.key)
                setShowConsole(true)
            }
            else {
                retrieveConcepts().then(c => {
                    setConsoleCommands(c)
                    setConsolePrefix(e.key)
                    setShowConsole(true)
                })
            }


        }

    }

    const onKeyUp = (e) => {
        if (e.key === "Meta") dispatch(inputManager.actions.setMetaDown(false))
    }

    function contentFromRef(ref) {
        return conceptRef.current.content.find(c => c.local.ref === ref)
    }

    function onWheel(e) {
        e.preventDefault()

        let gesture = e.ctrlKey ? 'zoom' : 'pan'

        if (gesture === "zoom") onZoom(e)
        else if (gesture === "pan") onPan(e)

        postUpdatedConcept()
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
        dispatch(canvasSlice.actions.setDimensions({ scale: scaleRef.current + delta }))
    }

    function modifyXY(x, y) {
        setX(xRef.current + x)
        setY(yRef.current + y)
        dispatch(canvasSlice.actions.setDimensions({ x: xRef.current + x, y: yRef.current + y }))
    }

    const onMouseMove = (e) => {
        mousePosition.current = {x: e.clientX, y: e.clientY}
        // backspaceCounter.current = 0
    }

    const mouseToCanvasPosition = (x, y) => {
        return {
            x: -(window.innerWidth/2 - x + xRef.current)/scaleRef.current,
            y: -(window.innerHeight/2 - y + yRef.current)/scaleRef.current
        }
    }

    const centerContentOnScreen = (c) => {
        const animationTime = 300
        const sizeMultiplier = 0.8

        let rect = c.local.ref.getBoundingClientRect()

        let windowAspect = window.innerWidth / window.innerHeight
        let contentAspect = rect.width / rect.height

        let dScale = contentAspect > windowAspect
                        ? (sizeMultiplier * window.innerWidth) / rect.width
                        : (sizeMultiplier * window.innerHeight) / rect.height

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
            let contentDiv = e.composedPath().find(el => el.className === 'content')
            if (contentDiv) {
                let c = conceptRef.current.content.find(c => c.local.ref === contentDiv)
                if (c) centerContentOnScreen(c)
            }
        }

        clickTimeStamp.current = e.timeStamp
    }

    const onContentFocus = (id) => {
        currentContentIsFocusedRef.current = true
    }

    const onContentBlur = (id) => {
        currentContentIsFocusedRef.current = false
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
                            getProcessFunction(contentType)(file, data.target.result, (_data) => createContent(contentType, _data))
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
        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)
        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("drop", onDrop)
        window.addEventListener("dragover", onDragOver)
        window.addEventListener("click", onClick)


        return () => {
            window.removeEventListener("wheel", onWheel)
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("drop", onDrop)
            window.removeEventListener("dragover", onDragOver)
            window.removeEventListener("click", onClick)


        }
    }, [concept])

    const openProgram = (p) => {
        setProgram(p)
    }

    useEffect(() => {
        registerCanvasCommands({
            createContent: requestContentCreation,
            createConcept,
            openProgram: openProgram
        })

        retrieveConcepts().then(c => {
            // setConsolePrefix("\\")
            // setConsoleCommands(c)
            // setConsolePrefix("/")
            // setConsoleCommands(canvasCommands)
            //
            // setShowConsole(true)
        })

        openConcept(3)

        return () => {
            resetCanvasCommands()
        }
    }, [])


    function requestContentCreation(type, data) {
        setShowConsole(false)

        let asyncContent = [contentTypes.IMAGE, contentTypes.VIDEO, contentTypes.LINK]

        if (asyncContent.includes(type)) {
            let relativePosition = mouseToCanvasPosition(mousePosition.current.x, mousePosition.current.y)

            setPlaceholders((pl) => [
                ...pl,
                {...relativePosition, icon: getIcon(type)}
            ])

            getProcessFunction(type)(data, (_data) => {
                setPlaceholders(ps => ps.slice(0, ps.length-1))
                createContent(type, _data, relativePosition)

            })
        }
        else {
            getProcessFunction(type)(data, (_data) => {
                let ctnt = createContent(type, _data)

                return (__data) => {
                    onContentUpdate(ctnt.local.id, __data)
                }
            })
        }
    }

    function retrieveConcepts() {
        return Frontend.request(Backend.Endpoint.CONCEPTS, Backend.Operation.LIST).then((r) => {
            let concepts = r.data.data
            let commands = []

            concepts.sort((a, b) => new Date(a['updated_at']) > new Date(b['updated_at']) ? -1 : 1)

            concepts.forEach(c => {
                commands.push({
                    name: c.name,
                    displayName: c.name,
                    icon: require('./icons/cloud.svg').default,
                    callback: () => openConcept(c.id),
                    prefix: '\\'
                })
            })

            return commands

        }).catch(console.error)
    }

    function createContent(type, data, position) {
        let relativePosition = position ?? mouseToCanvasPosition(mousePosition.current.x, mousePosition.current.y)

        let content = {
            type,
            ...data,

            x: relativePosition.x,
            y: relativePosition.y,
            scale: data?.scale ?? 1,

            local: {
                id: uuidv4(),
            },

        }

        let c = _.cloneDeep(conceptRef.current)
        c.content.push(content)

        setConcept(c)
        postUpdatedConcept(c)

        return content

    }

    function deleteContent(id) {
        let c = _.cloneDeep(conceptRef.current)
        let idx = conceptRef.current.content.findIndex(c => c.local.id === id)

        if ([contentTypes.IMAGE, contentTypes.VIDEO].includes(c.content[idx].type)) {
            Frontend.request(Backend.Endpoint.CONTENT, Backend.Operation.DELETE, { content: {src: c.content[idx].src} })
        }

        c.content.splice(idx, 1)

        // setCurrentResizingContentId(null)
        setConcept(c)

        postUpdatedConcept(c)
    }

    function postUpdatedConcept(_c = conceptRef.current) {
        if (!_c) return
        if (backendTimeout.current) clearTimeout(backendTimeout.current)

        backendTimeout.current = setTimeout(() => {
            let c = _.cloneDeep(_c)

            c.content.forEach(__c => {
                delete __c.local
            })

            c.metadata = {
                canvas: {
                    x: xRef.current,
                    y: yRef.current,
                    scale: scaleRef.current
                }
            }

            c.content = JSON.stringify(c.content)
            c.metadata = JSON.stringify(c.metadata)
            Frontend.request(Backend.Endpoint.CONCEPTS, Backend.Operation.UPDATE, {concept: c})
        }, 1000)

    }



    function openConcept(id) {
        setShowConsole(false)
        Frontend.request(Backend.Endpoint.CONCEPTS, Backend.Operation.ONE, {concept: {id}}).then((r) => {
            let _concept = r.data.data
            _concept.content = JSON.parse(_concept.content)
            _concept.metadata = JSON.parse(_concept.metadata)
            _concept.content.forEach(c => {
                c.local = {
                    id: uuidv4(),
                }
            })

            if (_concept.metadata) {
                setX(_concept.metadata.canvas.x)
                setY(_concept.metadata.canvas.y)
                setScale(_concept.metadata.canvas.scale)
                dispatch(canvasSlice.actions.setDimensions({
                    x: _concept.metadata.canvas.x,
                    y: _concept.metadata.canvas.y,
                    scale: _concept.metadata.canvas.scale
                }))
            }

            setConcept(_concept)
            dispatch(conceptSlice.actions.setConcept(_concept))
        })
    }

    function onContentUpdate(id, data) {
        let idx = conceptRef.current.content.findIndex(c => c.local.id === id)
        conceptRef.current.content[idx] = {...conceptRef.current.content[idx], ...data}
        postUpdatedConcept(conceptRef.current)
    }

    function createConcept(data) {
        let c = {
            name: data.name ?? "New concept",
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
                        <Content key={c.local.id}
                                 contentId={c.local.id}
                                 lock={metaDown}
                                 update={(data) => onContentUpdate(c.local.id, data)}
                            // registerCommands={(cmds) => c.local.commands = cmds}
                                 registerCommands={() => null}
                                 setMenuItems={setMenuItems}
                                 onFocus={onContentFocus}
                                 onBlur={onContentBlur}
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


            {
                showConsole &&
                (<Console
                    commands={consoleCommands}
                    label={consolePrefix === '/' ? 'COMMAND' : 'CONCEPT'}
                    mousePosition={mousePosition.current}
                    close={() => setShowConsole(false)}
                />)
            }

            {
                menuItems &&
                (
                    <Menu
                        items={menuItems}
                        mousePosition={mousePosition.current}
                        close={() => setMenuItems(null)}
                    />
                )
            }

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