import styles from './Placeholder.module.sass'

export default function Placeholder (props) {


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
}