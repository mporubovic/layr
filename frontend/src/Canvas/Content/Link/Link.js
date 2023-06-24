import styles from './Link.module.sass'
import defaultIcon from './Link_black.svg'
import {Server} from "../../../config"

export default function Link(props) {

    const open = () => {
        window.open(props.src, '_blank')
    }

    return (
        <div className={styles.link} style={props.style}>
            <div className={styles.header}>
                <img src={ props.favicon
                            ? Server.EXTERNAL_CACHE_URL + "/" + props.favicon
                            : defaultIcon}
                />
                <span>{props.title}</span>
            </div>

            <div className={styles.body}>
                {
                    props.description && (
                        <div className={styles.description} dangerouslySetInnerHTML={ {__html: props.description} } />
                    )
                }
            </div>

            <div className={styles.url} onClick={!props.lock ? open : undefined}>{props.src}</div>

        </div>
    )
}