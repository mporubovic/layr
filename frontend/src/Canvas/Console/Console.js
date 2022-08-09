import styles from './Console.module.sass'
import {useEffect, useRef, useState} from "react";
import useStateRef from "react-usestateref";
import List from "../../UI/List/List";
import InputBox from "../../UI/InputBox/InputBox";
import {useDispatch, useSelector} from "react-redux";
import consoleSlice from "../../state/console";
import {commands} from "./commands";
import _ from "lodash";

export default function Console(props) {
    const dispatch = useDispatch()

    const mouse = {
        x: useSelector(state => state.inputManager.mouse.x),
        y: useSelector(state => state.inputManager.mouse.y)
    }

    const localPosition = useRef({ x: 0, y: 0 })


    const inputValueRef = useRef('')
    const [initialInputValue, setInitialInputValue] = useState('')
    const argumentsRef = useRef(null)

    // const commandsRef = useRef([])

    const [results, setResults, resultsRef] = useStateRef([])
    const highlightedCommandRef = useRef(0)

    const show = useSelector(state => state.console.show)
    const commands = useSelector(state => state.console.commands)

    const contentId = useSelector(state => state.canvas.mouseInContentId)
    const content = useSelector(state => state.concept.content?.find(c => c.local.id === contentId))

    useEffect(() => {
        renderResults()
    }, [commands])


    const runCommand = (cmd) => {
        let argumentString = argumentsRef.current && (argumentsRef.current.length > 0 ? argumentsRef.current.join(" ") : null)
        cmd.callback(argumentString)
        close()
    }

    const renderResults = () => {
        let inpt = inputValueRef.current.split(" ")
        let command = inpt[0].toLowerCase()
        argumentsRef.current = inpt.slice(1, inpt.length)

        let _results = []

        commands.forEach(path => {
            let cmd = _.get(commands, path)
            if (cmd.name.toLowerCase().indexOf(command) !== -1) _results.push(cmd)
        })

        setResults(_results)
    }

    const onInput = (txt) => {
        inputValueRef.current = txt
        renderResults()
    }

    const onKeyDown = (e) => {
        if (e.key === '/') {
            if (show) return

            localPosition.current = {
                x: mouse.x,
                y: mouse.y
            }

            setTimeout(() => {
                dispatch(consoleSlice.actions.setShow(true))
            }, 0)

            let _commands = Object.values(commands.content.create).map(c => c.id)

            dispatch(consoleSlice.actions.setCommands(_commands))
            dispatch(consoleSlice.actions.setTitle('COMMANDS'))
        }

        else if (e.key === 'Escape') close()

        else if (e.key === 'Tab') {
            e.preventDefault()

            if (resultsRef.current.length > 0) {
                let txt = highlightedCommandRef.current.name + " "
                setInitialInputValue(txt)
                onInput(txt)
            }
        }
    }

    function close() {
        dispatch(consoleSlice.actions.setShow(false))
    }

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown)

        return () => {
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [mouse])


    if (!show) return null

    return (
        <div className={styles.console} style={{
            transform: `translate(${localPosition.current.x}px, ${localPosition.current.y}px)`
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