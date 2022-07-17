import styles from './Console.module.sass'
import {useEffect, useRef, useState} from "react";
import contentTypes from "../Content/contentTypes";
import useStateRef from "react-usestateref";
import axios from "axios";
import _ from "lodash";
import Frontend from "../../frontend";
import Backend from "../../../../backend/config.js"

export default function Console(props) {

    const [x, setX] = useState(props.mousePosition.x)
    const [y, setY] = useState(props.mousePosition.y)

    const [input, setInput, inputRef] = useStateRef("")

    const commands = {
        text: {name: "Text", icon: require('./text.svg').default, callback: () => props.createContent(contentTypes.Text)},
        image: {name: "Image", icon: require("./image.svg").default, callback: () => props.createContent(contentTypes.Image)},
        video: {name: "Video", icon: require("./video.svg").default, callback: () => props.createContent(contentTypes.Video)},
        concept: {name: "Concept", icon: require('./cloud.svg').default, callback: () => props.createConcept()},
    }

    const [results, setResults, resultsRef] = useStateRef([])

    const renderResults = () => {
        if (inputRef.current && inputRef.current[0] === "/") {
            let inpt = inputRef.current.split(" ")
            let command = inpt[0].replace("/", "").toLowerCase()
            let args = inpt.slice(1, inpt.length)

            let _results =
                Object.keys(commands)
                    .filter(k => k.indexOf(command) === 0)
                    .reduce((arr, key) => {
                        let cmnd = _.cloneDeep(commands[key])

                        if (command === "concept" && args.length !== 0) {
                            let name = args.reduce((a, b) => a+" "+b)
                            cmnd.name = `Concept "${name}"`
                            cmnd.callback = () => props.createConcept(name)
                        }

                        arr.push(cmnd)
                        return arr
                    }, [])

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
                    resultsRef.current[highlightResultRef.current].callback()
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
            concepts.forEach(c => c.callback = () => { props.openConcept(c.id) })

            concepts[1].callback()

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
                            <span style={{ marginLeft: r.icon && "20px" }}>{r.name}</span>
                        </div>)
                    )
                }
            </div>
        </div>
    )
}