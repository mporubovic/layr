import styles from './Youtube.sass'
import {memo, useEffect, useRef, useState} from "react";
import {Elements} from "../../Menu/Menu.js";

export default function Youtube(props) {

    const [active, setActive] = useState(false)

    useEffect(() => {
        props.registerCommands([
            {
                name: 'edit',
                displayName: 'edit link',
                icon: require("../../icons/edit.svg").default,
                callback: () => {
                    props.setMenuItems([
                        Elements.INPUT('urlInput', 'YouTube video URL', props.src, (data) => {
                            props.update({ src: data.value })
                        })
                    ])
                },
                prefix: '/'
            }
        ])
    }, [])


    const match = props.src?.match(/([A-Za-z0-9_-]{11})/)
    const videoId = match && match !== '' ? match[0] : 'jNQXAC9IVRw'

    return (
        <div className={styles.container}
             onMouseLeave={() => setActive(false)}
             onClick={() => {
                 if (!active) setActive(true)
             }}
             style={{
                 cursor: !active && 'pointer'
             }}
        >

            <iframe
                    style={{
                        ...props.style,
                        pointerEvents: !active && 'none',
                    }}
                    width='560' height='315'
                    src={'https://www.youtube-nocookie.com/embed/' + videoId}
                    allow='encrypted-media; picture-in-picture'
                    sandbox='allow-scripts allow-same-origin'
                    title='YouTube video player'
                    allowFullScreen
            />
        </div>
    )
}