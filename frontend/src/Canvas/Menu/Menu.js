import styles from './Menu.module.sass'
import InputBox from "./InputBox/InputBox";
import {useState} from "react";

const Elements = {
    INPUT: (id, label, value, callback) => {
        return {
            id, label, value, callback,
            type: 'INPUT', component: InputBox
        }
    }
}

export default function Menu(props) {

    const [x, setX] = useState(props.mousePosition.x)
    const [y, setY] = useState(props.mousePosition.y)

    return (
        <div className={styles.menu} style={{
            transform: `translate(${x}px, ${y}px)`
        }}>
            {
                props.items.map((item, idx) => {
                    const Component = item.component

                    return (
                        <Component key={idx} {...item} close={(data) => {
                            item.callback(data)
                            props.close()
                        }} />
                    )
                })
            }
        </div>
    )
}



export {Elements}