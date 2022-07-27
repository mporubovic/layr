import styles from './Youtube.sass'
import {memo, useEffect, useRef, useState} from "react";
import {Elements} from "../../Menu/Menu.js";

export default function Youtube(props) {

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


    const match = props.src.match(/([A-Za-z0-9_-]{11})/)
    const videoId = match !== '' ? match[0] : 'eRqUE6IHTEA'

    return (
        <iframe className={styles.container} style={props.style}
                width='560' height='315'
                src={'https://www.youtube-nocookie.com/embed/' + videoId}
                allow='encrypted-media; picture-in-picture'
                sandbox='allow-scripts allow-same-origin'
                title='YouTube video player'
                allowFullScreen
        />
    )
}