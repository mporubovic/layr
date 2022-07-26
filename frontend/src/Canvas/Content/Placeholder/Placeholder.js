import styles from './Placeholder.module.sass'
import {forwardRef, useEffect, useState} from "react";

export default forwardRef((props, ref) => {


    return (
        <div className={styles.placeholder}
             style={{
                 transform: `translate(${props.x}px, ${props.y}px)`,
             }}
        >
            {/*<span className={styles.loader} />*/}
            <img className={styles.icon} src={props.icon} />
        </div>
    )
})