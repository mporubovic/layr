import styles from './Console.module.sass'
import {useEffect, useRef, useState} from "react";
import useStateRef from "react-usestateref";
import List from "../../UI/List/List";
import InputBox from "../../UI/InputBox/InputBox";
import {useDispatch, useSelector} from "react-redux";
import consoleSlice from "../../state/console";
import {canvasCommands, clearCommands, contentCommands, register as registerCanvasCommands} from "./commands";
import {fetchConcepts, openConcept} from "../../state/concepts";

export default function Console(props) {
    const dispatch = useDispatch()

    const mouse = {
        x: useSelector(state => state.inputManager.mouse.x),
        y: useSelector(state => state.inputManager.mouse.y)
    }

    const localPosition = useRef({ x: 0, y: 0 })
    const [title, setTitle] = useState('')

    const inputValueRef = useRef('')
    const [initialInputValue, setInitialInputValue] = useState('')
    const argumentsRef = useRef(null)

    const [results, setResults, resultsRef] = useStateRef([])
    const highlightedCommandRef = useRef(0)

    const show = useSelector(state => state.console.show)
    const [commands, setCommands, commandsRef] = useStateRef([])
    const concepts = useSelector(state => state.concepts)

    const contentId = useSelector(state => state.canvas.mouseInContentId)

    useEffect(() => {
        registerCanvasCommands()

        return () => {
            clearCommands()
        }
    }, [])

    useEffect(() => {
        renderResults()
    }, [commands])

    useEffect(() => {
        if (concepts.length) {
            let cmds = []

            concepts.forEach(c => {
                cmds.push({
                    name: c.name,
                    displayName: c.name,
                    icon: require('../icons/cloud.svg').default,
                    callback: () => dispatch(openConcept(c.id))
                })
            })

            setCommands(cmds)
        }
    }, [concepts])

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown)

        return () => {
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [mouse])


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

        commandsRef.current.forEach(cmd => {
            if (cmd.name.toLowerCase().indexOf(command) !== -1) _results.push(cmd)
        })

        setResults(_results)
    }

    const onInput = (txt) => {
        inputValueRef.current = txt
        renderResults()
    }

    const onKeyDown = (e) => {
        if (show) {
            if (e.key === 'Escape') close()

            else if (e.key === 'Tab') {
                e.preventDefault()

                if (resultsRef.current.length > 0) {
                    let txt = highlightedCommandRef.current.name + " "
                    setInitialInputValue(txt)
                    onInput(txt)
                }
            }
        }
        else {
            if (e.key === '/' || e.key === '\\') {
                localPosition.current = {
                    x: mouse.x,
                    y: mouse.y
                }

                setTimeout(() => {
                    dispatch(consoleSlice.actions.setShow(true))
                    renderResults()
                }, 0)

                if (e.key === '/') {
                    let cmds = contentCommands.filter(c => c.contentId === contentId)
                    
                    if (cmds && cmds.length) setCommands(cmds)
                    else setCommands(canvasCommands)

                    setTitle('COMMANDS')
                }
                else {
                    setCommands([])
                    dispatch(fetchConcepts())
                    setTitle('CONCEPTS')
                }
            }
        }
    }

    function close() {
        dispatch(consoleSlice.actions.setShow(false))
        inputValueRef.current = ''
        setInitialInputValue('')
        highlightedCommandRef.current = 0
    }


    if (!show) return null

    return (
        <div className={styles.console} style={{
            transform: `translate(${localPosition.current.x}px, ${localPosition.current.y}px)`
        }}>
            <InputBox
                label={title}
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