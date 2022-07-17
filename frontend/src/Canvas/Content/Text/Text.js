import './Text.sass'
import {forwardRef, useEffect, useState} from "react";

export default forwardRef((props, ref) => {

    const font = 20

    const [text, setText] = useState(props.text)

    const changeText = (t) => {
        props.update({text: t})
        setText(t)
    }

    useEffect(() => {
        ref.current.innerHTML = text
    }, [ref])

    return (
        <div contentEditable={!props.lock} suppressContentEditableWarning={true}
             className="text" ref={ref} onBlur={e => changeText(e.target.innerHTML)}
             style={{
                fontSize: font + "px",
                ...props.style
            }}
        >

        </div>
    )
})