import {useRef, useEffect} from "react";
import styles from './Resizer.module.sass'
import {useDispatch, useSelector} from "react-redux";
import conceptSlice, {updateContent} from "../../state/concept";
import resizerSlice from "../../state/resizer";

export default function Resizer(props) { // TODO: memoize?
    const dispatch = useDispatch()

    const outerPadding = 20
    const innerPadding = 5

    const pointerDownRef = useRef(false)
    const cornerRef = useRef(null)
    const div = useRef()

    const active = useRef(false)

    const backspaceCounter = useRef(0)
    const backspaceTimeout = useRef(null)

    const metaDown = useSelector(state => state.inputManager.key.Meta.down)
    const mouseInContentId = useSelector(state => state.canvas.mouseInContentId)
    const canvasScale = useSelector(state => state.canvas.scale)
    const resizingContentId = useSelector(state => state.resizer.resizingContentId)

    useEffect(() => {
        if (metaDown && mouseInContentId && !resizingContentId) {
            dispatch(resizerSlice.actions.setResizingContentId(mouseInContentId))
        }
        else if (!metaDown && resizingContentId) {
            unDim(content, resizingContentId)
            active.current = false
            dispatch(resizerSlice.actions.setResizingContentId(null))
        }

        else if (mouseInContentId && resizingContentId && resizingContentId !== mouseInContentId) {
            unDim(content, resizingContentId)
            active.current = false
            dispatch(resizerSlice.actions.setResizingContentId(mouseInContentId))
        }
    }, [metaDown, mouseInContentId, resizingContentId])

    const content = useSelector(state => state.concept.content?.find(c => c.local.id === resizingContentId))
    const contentRect = content?.local.rect

    // if (show) {
    //     // debugger
    //
    //     const contentRect = content.local.rect
    //
    //     style =
    //         props.relative
    //         ?
    //         {
    //             transform: `translate(${0 - (outerPadding + innerPadding)}px, ${0 - (outerPadding + innerPadding)}px)`,
    //             height: contentRect.height + outerPadding*2 + innerPadding*2 + 'px',
    //             width: contentRect.width + outerPadding*2 + innerPadding*2 + 'px',
    //         }
    //         :
    //         {
    //             transform: `translate(${contentRect.x - (outerPadding + innerPadding)}px, ${contentRect.y - (outerPadding + innerPadding)}px)`,
    //             height: contentRect.height + outerPadding*2 + innerPadding*2 + 'px',
    //             width: contentRect.width + outerPadding*2 + innerPadding*2 + 'px',
    //         }
    //
    // }


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

    function resize(movX, movY) {
        let x = content.x
        let y = content.y
        let dx = (movX/canvasScale)
        let dy = (movY/canvasScale)

        let rect = contentRect
        let aspect = rect.width/rect.height
        let contentScale = content.scale

        let next = {}

        // debugger

        switch (cornerRef.current) {
            case 'br':
                next.scale = contentScale + (movY)*contentScale/rect.height
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
        dispatch(updateContent( { id: resizingContentId, data: next }))
    }

    function onPointerDown() {
        pointerDownRef.current = true
    }

    function onPointerUp() {
        pointerDownRef.current = false
        active.current = false
        // cornerRef.current = null
        // document.body.style.cursor = 'auto'
    }

    function onPointerMove(e) {
        if (content && pointerDownRef.current) {
            if (!active.current) active.current = true
            resize(e.movementX, e.movementY)
        }
    }

    function onKeyDown(e) {
        if (!resizingContentId) return

        if (e.key === 'Backspace') {
            backspaceCounter.current++

            if (backspaceCounter.current === 2) {
                dispatch(resizerSlice.actions.setResizingContentId(null))
                dispatch(conceptSlice.actions.deleteContent(resizingContentId))
                backspaceCounter.current = 0
            }
            else {
                backspaceTimeout.current = setTimeout(() => {
                    backspaceCounter.current = 0
                    unDim(content, resizingContentId)
                }, 1000)

                dim()

            }
        }
    }

    function dim() {
        dispatch(conceptSlice.actions.updateContent({
            id: resizingContentId,
            data: {
                local: {
                    ...content.local,
                    dim: true
                }
            }
        }))
    }

    function unDim(content, id) {
        backspaceCounter.current = 0
        clearTimeout(backspaceTimeout.current)

        dispatch(conceptSlice.actions.updateContent({
            id,
            data: {
                local: {
                    ...content.local,
                    dim: false
                }
            }
        }))
    }

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
    }, [content])

    if (!resizingContentId) return null

    return (
        <div className={styles.resizer} ref={div}
             style={{
                 transform: `translate(${contentRect.x - (outerPadding + innerPadding)}px, ${contentRect.y - (outerPadding + innerPadding)}px)`,
                 height: contentRect.height + outerPadding * 2 + innerPadding * 2 + 'px',
                 width: contentRect.width + outerPadding * 2 + innerPadding * 2 + 'px',
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