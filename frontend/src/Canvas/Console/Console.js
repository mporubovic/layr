import styles from './Console.module.sass'
import {useEffect, useRef, useState} from "react";
import useStateRef from "react-usestateref";
import _ from "lodash";

export default function Console(props) {
    const [x, setX] = useState(props.mousePosition.x)
    const [y, setY] = useState(props.mousePosition.y)

    const [input, setInput, inputRef] = useStateRef(props.prefix)
    const argumentsRef = useRef(null)

    const commandsRef = useRef([])

    const [results, setResults, resultsRef] = useStateRef([])
    const [highlightResult, setHighlightResult, highlightResultRef] = useStateRef(0)

    useEffect(() => {
        commandsRef.current = props.commands
        renderResults()
    }, [props.commands])

    const runCommand = (cmd) => {
        let argumentString = argumentsRef.current && (argumentsRef.current.length > 0 ? argumentsRef.current.join("") : null)
        let callbackData = { [cmd.argument]: argumentString }
        cmd.callback(callbackData)
        props.close()
    }

    const renderResults = () => {
        let prefix = inputRef.current[0]
        // if (inputRef.current && inputRef.current[0] === "/") {
            let inpt = inputRef.current.split(" ")
            let command = inpt[0].slice(1).toLowerCase()
            let args = inpt.slice(1, inpt.length)
            argumentsRef.current = args

            let _results =
                commandsRef.current ? commandsRef.current
                    // .filter(k => k.name.toLowerCase().indexOf(command) === 0)
                    .filter(k => k.prefix === prefix)
                    .filter(k => k.name.toLowerCase().indexOf(command) === 0)
                    .reduce((arr, key) => {
                        let cmnd = _.cloneDeep(key)

                        if (cmnd.argument && args.length !== 0) {
                            let name = args.reduce((a, b) => a+" "+b)
                            cmnd.displayName = `${cmnd.name} "${name}"`
                            // cmnd.callback = () => props.createConcept(name)
                        }

                        arr.push(cmnd)
                        return arr
                    }, []) : []

            setResults(_results)

        // }
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
                if (inputRef.current.length === 1) props.close()
                else setInput((i) => i.slice(0, i.length-1))
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
                    setInput("/" + resultsRef.current[highlightResultRef.current].name.toLowerCase() + " ")
                }

                break
            default:
                if (e.key.length === 1) {
                    // if (e.key.match(/[vc]/i)) return
                    if (e.key.match(/[\w\d.\\\-: /]/i)) {
                        setInput((i) => i + e.key)
                        setHighlightResult(0)
                    }
                }
        }

        renderResults()

    }

    const onPaste = (e) => {
        let text = e.clipboardData.getData('text')
        setInput((i) => i + text)
        renderResults()
    }

    useEffect(() => {
        window.addEventListener("keydown", onKeyDown)
        window.addEventListener('paste', onPaste)

        return () => {
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener('paste', onPaste)

        }
    }, [])

    return (
        <div className={styles.console} style={{
            transform: `translate(${x}px, ${y}px)`
        }}>
            <div className={styles.input}>
                {input}
            </div>

            <div className={styles.results}>
                {
                    results.map((r, i) =>
                        (<div key={r.name} className={styles.result} onClick={() => runCommand(r)}
                            style={{
                                backgroundColor: highlightResult === i && "red"
                            }}
                        >
                            { r.icon && (<img src={r.icon} />) }
                            <span style={{ marginLeft: r.icon && "20px" }}>{r.displayName}</span>
                        </div>)
                    )
                }
            </div>
        </div>
    )
}