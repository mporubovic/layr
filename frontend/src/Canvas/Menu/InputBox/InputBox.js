import {useEffect, useRef} from "react";
import styles from './InputBox.module.sass'

export default function InputBox(props) {

    const ref = useRef()

    const inputRef = useRef('')

    const onKeyDown = (e) => {
        if (e.key === 'Enter') props.enter({ value: inputRef.current })
    }


    useEffect(() => {

        window.addEventListener('keydown', onKeyDown)

        ref.current.innerText = props.value

        return () => {

            window.removeEventListener('keydown', onKeyDown)

        }
    }, [])

    return (
        <div className={styles.inputBox}>
            <div className={styles.label}> { props.label } </div>
            <span ref={ref}
                  className={styles.input}
                  role="textbox"
                  contentEditable
                  onInput={(e) => inputRef.current = e.target.innerText}
            />
        </div>
    )
}