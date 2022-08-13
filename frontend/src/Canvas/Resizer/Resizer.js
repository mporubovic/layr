import {useRef, useEffect, useState} from "react";
import styles from './Resizer.module.sass'
import {shallowEqual, useDispatch, useSelector} from "react-redux";
import conceptSlice, {updateContent} from "../../state/concept";
import resizerSlice from "../../state/resizer";
import useStateRef from "react-usestateref";
import {canvasXtoDomX, canvasYtoDomY, getContentDomRect} from "../Canvas";

export default function Resizer(props) { // TODO: memoize?
    const dispatch = useDispatch()

    const outerPadding = 20
    const innerPadding = 5

    const [pointerDown, setPointerDown, pointerDownRef] = useStateRef(false)
    const cornerRef = useRef(null)
    const div = useRef()

    const active = useRef(false)
    const domRect = useRef() // TODO: maybe let domRect is enough?

    const backspaceCounter = useRef(0)
    const backspaceTimeout = useRef(null)

    const metaDown = useSelector(state => state.inputManager.key.Meta.down)
    const mouseInContentId = useSelector(state => state.canvas.mouseInContentId)
    const canvasScale = useSelector(state => state.canvas.scale)
    const resizingContentIds = useSelector(state => state.resizer.resizingContentIds)

    useEffect(() => {
        if (metaDown && mouseInContentId && pointerDownRef.current) {
            if (!resizingContentIds.includes(mouseInContentId)) {
                dispatch(resizerSlice.actions.setResizingContentIds([...resizingContentIds, mouseInContentId]))
            }
        }
    }, [metaDown, mouseInContentId, pointerDown])

    const contents = useSelector(state => state.concept.content?.filter(c => resizingContentIds.includes(c.local.id)) || [], shallowEqual)

    useEffect(() => {
        window.addEventListener('pointermove', onPointerMove)
        window.addEventListener('pointerdown', onPointerDown)
        window.addEventListener('pointerup', onPointerUp)
        window.addEventListener('keydown', onKeyDown)

        return () => {
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('pointerup', onPointerUp)
            window.removeEventListener('pointerdown', onPointerDown)
            window.removeEventListener('keydown', onKeyDown)

        }
    }, [contents])


    function corner(c) {
        if (active.current) return

        cornerRef.current = c
        let cursor

        switch (c) {
            case 'tl':
            case 'br':
                cursor = 'nwse-resize'
                break
            case 'tr':
            case 'bl':
                cursor = 'nesw-resize'
                break
            case 't':
            case 'b':
                cursor = 'ns-resize'
                break
            case 'l':
            case 'r':
                cursor = 'ew-resize'
                break
            case 'm':
                cursor = 'move'
                break
            default:
                console.warn('Wrong corner', c)
        }

        document.body.style.cursor = cursor

    }

    function resize(content, movX, movY) {
        let x = content.x
        let y = content.y
        let dx = (movX/canvasScale)
        let dy = (movY/canvasScale)

        let rect = getContentDomRect(content)

        let aspect = rect.width/rect.height
        let contentScale = content.scale

        let next = {}

        switch (cornerRef.current) {
            case 'br':
                next.scale = contentScale + (movY)*contentScale/rect.height // TODO: what is this doing?
                break

            case 'tr':
                next.scale = contentScale - (movY)*contentScale/rect.height
                next.y = y + dy
                break

            case 'tl':
                next.x = x + dy
                next.y = y + dy
                break

            case 'bl':
                next.scale = contentScale + (movY)*contentScale/rect.height
                next.x = x - ((movY)*contentScale/rect.height)*rect.width
                break

            case 't':
            case 'l':
            case 'r':
            case 'b':
            case 'm':
                next.x = x + dx
                next.y = y + dy
                break
        }
        dispatch(updateContent( { id: content.local.id, data: next }))
    }

    function onPointerDown() {
        setPointerDown(true)
    }

    function onPointerUp() {
        setPointerDown(false)
        active.current = false
    }

    function onPointerMove(e) {
        if (contents.length && pointerDownRef.current) {
            if (!active.current) active.current = true
            contents.forEach(c => {
                resize(c, e.movementX, e.movementY)
            })
        }
    }

    function close() {
        contents.forEach(c => unDim(c))
        active.current = false
        domRect.current = null
        backspaceCounter.current = 0
        dispatch(resizerSlice.actions.setResizingContentIds([]))
    }

    function onKeyDown(e) {
        if (!contents.length) return

        if (e.key === 'Backspace') {
            backspaceCounter.current++

            if (backspaceCounter.current === 2) {
                resizingContentIds.forEach(id => dispatch(conceptSlice.actions.deleteContent(id)))
                close()
            }
            else {
                backspaceTimeout.current = setTimeout(() => {
                    backspaceCounter.current = 0
                    contents.forEach(c => unDim(c))
                }, 1000)

                contents.forEach(c => dim(c))

            }
        }

        else if (e.key === 'Escape') {
            close()
        }
    }


    function dim(content) {
        dispatch(conceptSlice.actions.updateContent({
            id: content.local.id,
            data: {
                local: {
                    ...content.local,
                    dim: true
                }
            }
        }))
    }

    function unDim(content) {
        backspaceCounter.current = 0
        clearTimeout(backspaceTimeout.current)

        dispatch(conceptSlice.actions.updateContent({
            id: content.local.id,
            data: {
                local: {
                    ...content.local,
                    dim: false
                }
            }
        }))
    }

    if (!contents.length) return

    domRect.current = {
        min: {
            x: Infinity,
            y: Infinity
        },
        max: {
            x: -Infinity,
            y: -Infinity
        }
    }

    contents.forEach(c => {
        if (canvasXtoDomX(c.x) < domRect.current.min.x) domRect.current.min.x = canvasXtoDomX(c.x)
        if (canvasYtoDomY(c.y) < domRect.current.min.y) domRect.current.min.y = canvasYtoDomY(c.y)

        if (canvasXtoDomX(c.x + c.width) > domRect.current.max.x) domRect.current.max.x = canvasXtoDomX(c.x + c.width)
        if (canvasYtoDomY(c.y + c.height) > domRect.current.max.y) domRect.current.max.y = canvasYtoDomY(c.y + c.height)
    })


    return (
        <div className={styles.resizer} ref={div}
             style={{
                 transform: `translate(${domRect.current.min.x - (outerPadding + innerPadding)}px, ${domRect.current.min.y - (outerPadding + innerPadding)}px)`,
                 height: (domRect.current.max.y - domRect.current.min.y) + outerPadding * 2 + innerPadding * 2 + 'px',
                 width: (domRect.current.max.x - domRect.current.min.x) + outerPadding * 2 + innerPadding * 2 + 'px',
             }}
        >

            <div onMouseEnter={() => corner('tl')} />
            <div onMouseEnter={() => corner('t')} />
            <div onMouseEnter={() => corner('tr')} />

            <div onMouseEnter={() => corner('l')} />
            <div onMouseEnter={() => corner('m')} />
            <div onMouseEnter={() => corner('r')} />

            <div onMouseEnter={() => corner('bl')} />
            <div onMouseEnter={() => corner('b')} />
            <div onMouseEnter={() => corner('br')} />

            <div className={styles.tlCorner} />
            <div className={styles.trCorner} />
            <div className={styles.blCorner} />
            <div className={styles.brCorner} />

            <div className={styles.left} />
            <div className={styles.right} />
            <div className={styles.top} />
            <div className={styles.bottom} />

        </div>
    )
}