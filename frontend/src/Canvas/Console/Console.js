import styles from './Console.module.sass'
import {useEffect, useRef, useState} from "react";
import useStateRef from "react-usestateref";
import inputStyles from '../Menu/InputBox/InputBox.module.sass'

export default function Console(props) {
    const [x, setX] = useState(props.mousePosition.x)
    const [y, setY] = useState(props.mousePosition.y)

    const inputValueRef = useRef('')
    const inputRef = useRef()
    const argumentsRef = useRef(null)

    const commandsRef = useRef([])

    const [results, setResults, resultsRef] = useStateRef([])
    const [highlightResult, setHighlightResult, highlightResultRef] = useStateRef(0)

    const label = props.prefix === "/" ? 'COMMAND' : 'CONCEPT'

    useEffect(() => {
        commandsRef.current = props.commands
        renderResults()
    }, [props.commands])

    const runCommand = (cmd) => {
        let argumentString = argumentsRef.current && (argumentsRef.current.length > 0 ? argumentsRef.current.join(" ") : null)
        let callbackData = { [cmd.argument]: argumentString }
        cmd.callback(callbackData)
        props.close()
    }

    const renderResults = () => {
        // if (!inputRef.current) return

        let inpt = inputValueRef.current.split(" ")
        let command = inpt[0].toLowerCase()
        argumentsRef.current = inpt.slice(1, inpt.length)

        let _results =
            commandsRef.current
                ? commandsRef.current
                    .filter(k => k.name.toLowerCase().indexOf(command) !== -1)
                : []

        setResults(_results)
        setHighlightResult(0)

    }

    const onInput = (e) => {
        inputValueRef.current = e.target.innerText || ""
        renderResults()
    }

    const onKeyDown = (e) => {
        switch (e.key) {
            case "ArrowDown":
                setHighlightResult((s) => {
                    if (s + 1 > resultsRef.current.length-1) return 0
                    else return s+1
                })
                break
            case "ArrowUp":
                setHighlightResult((s) => {
                    if (s - 1 < 0) return resultsRef.current.length-1
                    else return s-1
                })
                break
            case "Backspace":
                if (inputRef.current.length === 0) props.close()
                renderResults()
                break
            case "Enter":
                if (resultsRef.current.length > 0) {
                    let selected = resultsRef.current[highlightResultRef.current]
                    runCommand(selected)
                }
                break
            case "Escape":
                props.close()
                break
            case "Tab":
                e.preventDefault()

                if (resultsRef.current.length > 0) {
                    let txt = resultsRef.current[highlightResultRef.current].name + " "
                    updateInput(txt)
                    renderResults()
                }

                break
        }


    }

    const onPaste = (e) => {
        e.preventDefault()
        let text = e.clipboardData.getData('text')
        updateInput(inputValueRef.current + text)
        renderResults()
    }

    const updateInput = (val) => {
        inputValueRef.current = val
        inputRef.current.innerText = val

        // https://stackoverflow.com/questions/36284973/set-cursor-at-the-end-of-content-editable
        const range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(inputRef.current);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        const selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }

    useEffect(() => {
        window.addEventListener("keydown", onKeyDown)
        inputRef.current.addEventListener('paste', onPaste)

        const _ref = inputRef.current

        setTimeout(() => {
            inputRef.current.focus()
        }, 0)

        return () => {
            window.removeEventListener("keydown", onKeyDown)
            _ref.removeEventListener('paste', onPaste)

        }
    }, [])

    return (
        <div className={styles.console} style={{
            transform: `translate(${x}px, ${y}px)`
        }}>
            <div className={inputStyles.inputBox}>
                <div className={inputStyles.label}> { label } </div>
                <span ref={inputRef}
                      className={inputStyles.input}
                      role="textbox"
                      contentEditable
                      onInput={onInput}
                />
            </div>

            <div className={styles.results}>
                {
                    results.map((r, i) =>
                        (<div key={r.name} className={styles.result} onClick={() => runCommand(r)}
                              style={{
                                  backgroundColor: highlightResult === i && "white"
                              }}
                        >
                            <div className={styles.iconWrapper}>
                                {r.icon && (<img src={r.icon} style={{filter: highlightResult === i && "invert(1)"}}/>)}
                            </div>

                            <span style={{
                                marginLeft: r.icon && "20px",
                                color: highlightResult === i ? 'black' : 'white'
                            }}>{r.displayName}</span>
                        </div>)
                    )
                }
            </div>
        </div>
    )
}