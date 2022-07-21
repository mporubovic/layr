import styles from './Console.module.sass'
import {useEffect, useRef, useState} from "react";
import contentTypes, {getIcon} from "../Content/contentTypes";
import useStateRef from "react-usestateref";
import _ from "lodash";
import Frontend from "../../frontend";
import * as Backend from "../../../../backend/config.js"

export default function Console(props) {

    const [x, setX] = useState(props.mousePosition.x)
    const [y, setY] = useState(props.mousePosition.y)

    const [input, setInput, inputRef] = useStateRef("")
    const argumentsRef = useRef(null)

    const commands = []

    Object.entries(contentTypes).forEach(e => {
        let [key, value] = e
        commands.push({
            name: value,
            displayName: value,
            icon: getIcon(key),
            callback: (data) => props.createContent(contentTypes[key], data)
        })
    })

    commands.push({name: 'concept', displayName: 'concept', icon: require('./cloud.svg').default, callback: (data) => props.createConcept(data)})

    const commandArgumentToProperty = {
        [contentTypes.TEXT.toLowerCase()]: 'text',
        [contentTypes.LINK.toLowerCase()]: 'src',
        'concept': 'name'
    }
    const commandsWithArgs = Object.keys(commandArgumentToProperty)

    const [results, setResults, resultsRef] = useStateRef([])

    const renderResults = () => {
        if (inputRef.current && inputRef.current[0] === "/") {
            let inpt = inputRef.current.split(" ")
            let command = inpt[0].replace("/", "").toLowerCase()
            let args = inpt.slice(1, inpt.length)
            argumentsRef.current = args

            let _results =
                commands
                    .filter(k => k.name.toLowerCase().indexOf(command) === 0)
                    .reduce((arr, key) => {
                        let cmnd = _.cloneDeep(key)

                        if (commandsWithArgs.includes(command) && args.length !== 0) {
                            let name = args.reduce((a, b) => a+" "+b)
                            cmnd.displayName = `${command} "${name}"`
                            // cmnd.callback = () => props.createConcept(name)
                        }

                        arr.push(cmnd)
                        return arr
                    }, [])

            console.log(_results)

            setResults(_results)

        }
        else {
            retrieveConcepts()
        }



    }

    const [highlightResult, setHighlightResult, highlightResultRef] = useStateRef(0)


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
                setInput((i) => i.slice(0, i.length-1))
                break
            case "Enter":
                if (resultsRef.current.length > 0) {
                    let selected = resultsRef.current[highlightResultRef.current]
                    let argumentString = argumentsRef.current && (argumentsRef.current.length > 0 ? argumentsRef.current.join("") : null)
                    let callbackData = { [commandArgumentToProperty[selected.name]]: argumentString }
                    resultsRef.current[highlightResultRef.current].callback(callbackData)
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
                if (e.key.length === 1 && e.key.match(/[\w\d.\- /]/i)) {
                    setInput((i) => i + e.key)
                    setHighlightResult(0)
                }
        }

        renderResults()

    }

    function retrieveConcepts() {
        Frontend.request(Backend.Endpoint.CONCEPTS, Backend.Operation.LIST).then((r) => {
            let concepts = r.data.data
            concepts.forEach(c => {
                c.callback = () => { props.openConcept(c.id) }
                c.displayName = c.name
            })
            concepts.sort((a, b) => new Date(a['updated_at']) > new Date(b['updated_at']) ? -1 : 1)

            // concepts[0].callback()

            setResults(concepts)
        }).catch(console.error)
    }

    useEffect(() => {
        window.addEventListener("keydown", onKeyDown)

        retrieveConcepts()

        return () => {
            window.removeEventListener("keydown", onKeyDown)
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
                        (<div key={r.name} className={styles.result} onClick={r.callback}
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