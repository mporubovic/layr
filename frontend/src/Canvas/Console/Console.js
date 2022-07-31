import styles from './Console.module.sass'
import {useEffect, useRef, useState} from "react";
import useStateRef from "react-usestateref";
import List from "../../UI/List/List";
import InputBox from "../../UI/InputBox/InputBox";

export default function Console(props) {
    const [x, setX] = useState(props.mousePosition.x)
    const [y, setY] = useState(props.mousePosition.y)

    const inputValueRef = useRef('')
    const [initialInputValue, setInitialInputValue] = useState('')
    const argumentsRef = useRef(null)

    const commandsRef = useRef([])

    const [results, setResults, resultsRef] = useStateRef([])
    const highlightedCommandRef = useRef(0)

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
        let inpt = inputValueRef.current.split(" ")
        let command = inpt[0].toLowerCase()
        argumentsRef.current = inpt.slice(1, inpt.length)

        let _results =
            commandsRef.current
                ? commandsRef.current
                    .filter(k => k.name.toLowerCase().indexOf(command) !== -1)
                : []

        setResults(_results)
    }

    const onInput = (txt) => {
        inputValueRef.current = txt
        renderResults()
    }

    const onKeyDown = (e) => {
        switch (e.key) {
            case "Escape":
                props.close()
                break
            case "Tab":
                e.preventDefault()

                if (resultsRef.current.length > 0) {
                    let txt = highlightedCommandRef.current.name + " "
                    setInitialInputValue(txt)
                    onInput(txt)
                }
                break
        }
    }

    useEffect(() => {
        window.addEventListener("keydown", onKeyDown)

        return () => {
            window.removeEventListener("keydown", onKeyDown)
        }
    }, [])

    return (
        <div className={styles.console} style={{
            transform: `translate(${x}px, ${y}px)`
        }}>
            <InputBox
                label={props.label}
                initialValue={initialInputValue}
                // focus={true}
                onInput={onInput}
            />

            {
                results.length > 0 &&
                (
                    <List
                        items={results}
                        onEnter={runCommand}
                        onHighlight={(v) => highlightedCommandRef.current = v}
                    />
                )
            }
        </div>
    )
}