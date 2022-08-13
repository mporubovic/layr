import './Content.sass'
import {useEffect, useRef} from "react";
import {getComponent} from './contentTypes'
import {useDispatch, useSelector} from "react-redux";
import {updateContent} from "../../state/concept";
import canvasSlice from "../../state/canvas";
import {domToCanvasPosition} from "../Canvas";

export default function Content(props) {

    const dispatch = useDispatch()

    const contentRef = useRef()

    const metaDown = useSelector(state => state.inputManager.key.Meta.down)

    const id = props.contentId
    const content = useSelector(state => state.concept.content.find(c => c.local.id === id))

    const canvasX = useSelector(state => state.canvas.x)
    const canvasY = useSelector(state => state.canvas.y)
    const canvasScale = useSelector(state => state.canvas.scale)

    const resizingContentIds = useSelector(state => state.resizer.resizingContentIds)
    const isSelfResizing = resizingContentIds.includes(id)

    const x = content.x
    const y = content.y
    const scale = content.scale

    const onMouseEnter = (e) => {
        dispatch(canvasSlice.actions.setMouseInContentId(id))
        recalculateRect()
    }

    const onMouseLeave = (e) => {
        dispatch(canvasSlice.actions.setMouseInContentId(null))
    }

    useEffect(() => {
        let ref = contentRef.current

        ref.addEventListener('mouseenter', onMouseEnter)
        ref.addEventListener('mouseleave', onMouseLeave)

        return () => {
            ref.removeEventListener('mouseenter', onMouseEnter)
            ref.removeEventListener('mouseleave', onMouseLeave)
        }

    }, [contentRef])

    useEffect(() => {
        if (contentRef.current) {
            recalculateRect()
        }
    }, [x, y, scale])

    useEffect(() => {

        if (contentRef.current && isSelfResizing) {
            recalculateRect()
        }

    }, [canvasX, canvasY, canvasScale])

    function recalculateRect() {
        let ref = contentRef.current
        let rect = ref.getBoundingClientRect()

        let { x: x1, y: y1 } = domToCanvasPosition(rect.x, rect.y)
        let { x: x2, y: y2 } = domToCanvasPosition(rect.x + rect.width, rect.y + rect.height)

        update({ // TODO: not necessary to send to backend
            width: Math.abs(x2 - x1),
            height: Math.abs(y2 - y1)
        })
    }

    const update = (data, local = false) => {
        dispatch(updateContent({ id, data, local }))
    }

    const Component = getComponent(content.type)

    return (
        <div className="content" ref={contentRef}
             style={{
                 transform: `translate(${x}px, ${y}px) scale(${scale})`,
             }}
        >
            {
                <Component {...content}
                           scale={scale}
                           style={{
                               ...props.style,
                               ...(metaDown) && { pointerEvents: "none", userSelect: "none"},
                               ...(content.local.dim) && { opacity: 0.5 }
                           }}

                           // lock={metaDown}
                           update={update}

                           onFocus={props.onFocus}
                           onBlur={props.onBlur}
                />
            }


        </div>
    )
}