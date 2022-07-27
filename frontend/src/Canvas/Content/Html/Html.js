import styles from './Html.module.sass'
import {memo, useEffect, useRef, useState} from "react";

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-solarized_dark";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/ext-language_tools"
import "ace-builds/webpack-resolver"

export default function Html(props) {
    const ref = useRef()
    const [editing, setEditing] = useState(false)
    // const [editing, setEditing] = useState(true)
    const htmlRef = useRef(props.html)

    const onChange = (html) => {
        htmlRef.current = html
    }

    const onKeyDown = (e) => {
        if (e.key === "Escape") closeEditor()
    }

    const closeEditor = () => {
        setEditing(false)
        props.update({html: htmlRef.current})
    }

    useEffect(() => {
        props.registerCommands([
            {
                name: "edit",
                displayName: 'edit',
                icon: require("../../icons/edit.svg").default,
                callback: () => setEditing(true),
                prefix: '/'
            }
        ])

        window.addEventListener('keydown', onKeyDown)

        return () => {
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [])


    return (
        <div className={styles.wrapper} ref={ref} style={{
            ...props.style,
            transform: editing ? `scale(${1 / props.scale})` : undefined
        }}>
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
                    : (<div className={styles.html} dangerouslySetInnerHTML={{__html: htmlRef.current}} />)
            }


        </div>
    )
}