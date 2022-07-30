import {useRef, useEffect} from "react";
import style from './Resizer.module.sass'

export default function Resizer(props) {

    const outerPadding = 20
    const innerPadding = 5

    const pointerDownRef = useRef(false)
    const cornerRef = useRef(null)
    const div = useRef()
    const resizing = pointerDownRef.current

    const contentRect = props.content.local.ref.getBoundingClientRect()

    function corner(c) {
        if (resizing) return

        cornerRef.current = c
        let cursor

        switch (c) {
            case "tl":
            case "br":
                cursor = "nwse-resize"
                break
            case "tr":
            case "bl":
                cursor = "nesw-resize"
                break
            case "t":
            case "b":
                cursor = "ns-resize"
                break
            case "l":
            case "r":
                cursor = "ew-resize"
                break
            case "m":
                cursor = "move"
                break
            default:
                console.warn("Wrong corner", c)
        }

        document.body.style.cursor = cursor

    }

    function onPointerDown() {
        pointerDownRef.current = true
        props.pointerDown()
    }

    function onPointerUp() {
        pointerDownRef.current = false
        cornerRef.current = null
        document.body.style.cursor = ""
        props.pointerUp()
    }

    function onPointerMove(e) {
        if (pointerDownRef.current) {
            props.pointerMove(e.movementX, e.movementY, cornerRef.current)
        }

    }

    useEffect(() => {
        window.addEventListener("pointermove", onPointerMove)
        div.current.addEventListener("pointerdown", onPointerDown)
        window.addEventListener("pointerup", onPointerUp)

        return () => {
            // console.log("cursor set to null")
            document.body.style.cursor = ""
            window.removeEventListener("pointermove", onPointerMove)
            window.removeEventListener("pointerup", onPointerUp)
        }
    }, [])

    const lineThickness = Math.round(1.5 * (1/props.scale))


    return (
        <div className={style.resizer} ref={div}
             style={{
                 transform: `translate(${contentRect.x - (outerPadding + innerPadding)}px, ${contentRect.y - (outerPadding + innerPadding)}px)`,
                 height: contentRect.height + outerPadding*2 + innerPadding*2 + 'px',
                 width: contentRect.width + outerPadding*2 + innerPadding*2 + 'px',
             }}
             onMouseLeave={props.onMouseLeave}
        >

            <div onMouseEnter={() => corner("tl")} />
            <div onMouseEnter={() => corner("t")} />
            <div onMouseEnter={() => corner("tr")} />

            <div onMouseEnter={() => corner("l")} />
            <div onMouseEnter={() => corner("m")} />
            <div onMouseEnter={() => corner("r")} />

            <div onMouseEnter={() => corner("bl")} />
            <div onMouseEnter={() => corner("b")} />
            <div onMouseEnter={() => corner("br")} />

            <div className={style.tlCorner} />
            <div className={style.trCorner} />
            <div className={style.blCorner} />
            <div className={style.brCorner} />

            <div className={style.left} />
            <div className={style.right} />
            <div className={style.top} />
            <div className={style.bottom} />

        </div>
    )
}