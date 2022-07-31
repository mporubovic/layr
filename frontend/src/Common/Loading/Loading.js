import styles from './Loading.module.scss'

export default function Loading(props) {


    return (
        <div className={styles.field}>
            <div className={styles.ping}></div>
            <div className={styles.pong}></div>
            <div className={styles.ball}></div>
        </div>
    )
}