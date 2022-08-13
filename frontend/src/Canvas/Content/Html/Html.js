import styles from './Html.module.sass'
import {useEffect, useRef, useState} from "react";

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-solarized_dark";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/ext-language_tools"
import "ace-builds/webpack-resolver"
import useStateRef from "react-usestateref";
import {contentCommands} from "../../Console/commands";

export default function Html(props) {
    const ref = useRef()
    const [editing, setEditing] = useState(false)
    const htmlRef = useRef(props.html)

    const [active, setActive, activeRef] = useStateRef(false)

    const id = props.local.id

    const onChange = (html) => {
        htmlRef.current = html
    }

    const onKeyDown = (e) => {
        if (e.key === "Escape" && activeRef.current) closeEditor()
    }

    const closeEditor = () => {
        setEditing(false)
        props.update({html: htmlRef.current})
    }

    useEffect(() => {
        let commands = [
            {
                name: "edit",
                displayName: 'edit',
                icon: require("../../icons/edit.svg").default,
                callback: () => setEditing(true),
            }
        ]

        contentCommands.push(...commands.map(c => {
            return {...c, contentId: id}
        }))

        window.addEventListener('keydown', onKeyDown)

        return () => {
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [])


    return (
        <div className={styles.wrapper} ref={ref}
            onMouseLeave={() => setActive(false)}
            onClick={() => {if (!active) setActive(true)}}
            style={{
                ...props.style,
                transform: editing ? `scale(${1 / props.scale})` : undefined,
                cursor: !active && 'pointer'
            }}
        >
            {
                editing
                    ? (<div className={styles.editor}>
                            <span className={styles.close} onClick={closeEditor}>❌</span>

                            <AceEditor
                                placeholder=""
                                mode="html"
                                theme="solarized_dark"
                                name="blah2"
                                // onLoad={console.log}
                                onChange={onChange}
                                fontSize={14}
                                showPrintMargin={true}
                                showGutter={true}
                                highlightActiveLine={true}
                                value={htmlRef.current}
                                setOptions={{
                                    enableBasicAutocompletion: true,
                                    enableLiveAutocompletion: true,
                                    enableSnippets: false,
                                    showLineNumbers: true,
                                    tabSize: 2,
                                }}/>
                        </div>
                    )
                    : (<div className={styles.html}
                            dangerouslySetInnerHTML={{__html: htmlRef.current}}
                            style={{
                                pointerEvents: !active && 'none',
                            }}
                />)
            }


        </div>
    )
}