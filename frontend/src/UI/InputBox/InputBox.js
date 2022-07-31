import {useEffect, useRef} from "react";
import styles from './InputBox.module.sass'

export default function InputBox(props) {

    const ref = useRef()

    const onKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (props.onEnter) props.onEnter({ value: ref.current.innerText })
        }
        else if (e.key === 'Backspace') {
            if (ref.current.innerText === '') onInput('')
        }
    }

    const onInput = (txt) => {
        props.onInput(txt)
    }

    const onPaste = (e) => {
        e.preventDefault()
        let text = e.clipboardData.getData('text')
        let txt = ref.current.innerText + text
        updateInput(txt)
        props.onInput(txt)
        // renderResults()
    }

    const updateInput = (val) => {
        ref.current.innerText = val

        // https://stackoverflow.com/questions/36284973/set-cursor-at-the-end-of-content-editable
        const range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(ref.current);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        const selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }

    useEffect(() => {
        updateInput(props.initialValue)
    }, [props.initialValue])

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown)

        ref.current.addEventListener('paste', onPaste)

        const _ref = ref.current
        return () => {
            window.removeEventListener('keydown', onKeyDown)
            _ref.removeEventListener('paste', onPaste)
        }
    }, [])

    return (
        <div className={styles.inputBox}>
            <div className={styles.label}> { props.label } </div>
            <span ref={ref}
                  className={styles.input}
                  role='textbox'
                  contentEditable
                  onInput={(e) => onInput(e.target.innerText)}
            />
        </div>
    )
}