import './Text.sass'
import {useEffect, useRef, useState} from "react";

export default function Text(props) {

    const font = 20

    const [text, setText] = useState(props.text)
    const ref = useRef()

    const changeText = (t) => {
        props.update({text: t})
        props.onBlur()
        setText(t)
    }

    useEffect(() => {
        ref.current.innerHTML = text
    }, [ref])

    return (
        <div contentEditable={!props.lock} suppressContentEditableWarning={true}
             className="text" ref={ref} onBlur={e => changeText(e.target.innerHTML)} onFocus={props.onFocus}
             style={{
                fontSize: font + "px",
                ...props.style
            }}
        >

        </div>
    )
}