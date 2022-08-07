import './Content.sass'
import {useEffect, useRef} from "react";
import {getComponent} from './contentTypes'
import {useDispatch, useSelector} from "react-redux";
import conceptSlice from "../../state/concept";
import canvasSlice from "../../state/canvas";

export default function Content(props) {

    const dispatch = useDispatch()

    const contentRef = useRef()

    const id = props.contentId
    const content = useSelector(state => state.concept.content.find(c => c.local.id === id))

    const x = content.x
    const y = content.y
    const scale = content.scale

    const canvasX = useSelector(state => state.canvas.x)
    const canvasY = useSelector(state => state.canvas.y)
    const canvasScale = useSelector(state => state.canvas.scale)

    const onMouseEnter = (e) => {
        dispatch(canvasSlice.actions.setMouseInContentId(id))
    }

    const onMouseLeave = (e) => {
        dispatch(canvasSlice.actions.setMouseInContentId(null))
    }

    useEffect(() => {
        if (contentRef) {
            let ref = contentRef.current
            let rect = ref.getBoundingClientRect().toJSON()

            update({
                local: {
                    ...content.local,
                    rect,
                }
            })

            ref.addEventListener('mouseenter', onMouseEnter)
            ref.addEventListener('mouseleave', onMouseLeave)

            return () => {
                ref.removeEventListener('mouseenter', onMouseEnter)
                ref.removeEventListener('mouseleave', onMouseLeave)
            }
        }
    }, [contentRef, x, y, scale, canvasX, canvasY, canvasScale])

    useEffect(() => {
        // (cmds) => c.local.commands = cmds



    }, [])

    const update = (data) => {
        dispatch(conceptSlice.actions.updateContent({ id, data }))
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
                               ...(props.lock) && { pointerEvents: "none", userSelect: "none"},
                               ...(content.local.dim) && { opacity: 0.5 }
                           }}

                           lock={props.lock}
                           update={update}

                           registerCommands={props.registerCommands}
                           setMenuItems={props.setMenuItems}

                           onFocus={props.onFocus}
                           onBlur={props.onBlur}
                />
            }


        </div>
    )
}