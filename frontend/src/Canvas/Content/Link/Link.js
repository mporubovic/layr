import styles from './Link.module.sass'
import defaultIcon from './Link.svg'
import {forwardRef, useEffect, useState} from "react";
import {Server} from "../../../../../backend/config.js"

export default forwardRef((props, ref) => {

    const open = () => {
        window.open(props.src, '_blank')
    }

    return (
        <div className={styles.link} onClick={!props.lock ? open : undefined} style={props.style} ref={ref}>
            <div className={styles.header}>
                <img src={Server.EXTERNAL_CACHE_URL + "/" + props.icon.src ?? defaultIcon} />
                <span>{props.title}</span>
            </div>

            <div className={styles.body}>
                <span>{props.src}</span>
            </div>

        </div>
    )
})