import styles from "./List.module.sass";
import {useEffect, useState} from "react";
import useStateRef from "react-usestateref";

export default function List(props) {

    const [items, setItems, itemsRef] = useStateRef(props.items)
    const [highlightResult, setHighlightResult, highlightResultRef] = useStateRef(0)

    useEffect(() => {
        setItems(props.items)
        highlight(0)

    }, [props.items])

    const highlight = (idx) => {
        setHighlightResult(idx)
        let selected = itemsRef.current[idx]
        if (props.onHighlight) props.onHighlight(selected)
    }

    const onEnter = (item) => {
        if (props.onEnter) props.onEnter(item)
    }

    const onKeyDown = (e) => {
        if (itemsRef.current.length === 0) return
        let current = highlightResultRef.current
        let next = 0


        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()

                next = current + 1 > itemsRef.current.length - 1
                            ? 0
                            : current + 1

                highlight(next)
                break
            case 'ArrowUp':
                e.preventDefault()

                next = current - 1 < 0
                    ? itemsRef.current.length - 1
                    : current - 1

                highlight(next)
                break
            case "Enter":
                if (itemsRef.current.length > 0) {
                    let selected = itemsRef.current[highlightResultRef.current]
                    onEnter(selected)
                }
                break
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown)

        return () => {
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [])


    return (
        <div className={styles.list}>
            {
                items.map((item, idx) =>
                    (<div key={item.name} className={styles.item}
                          onClick={() => onEnter(item)}
                          onMouseEnter={() => setHighlightResult(idx)}
                          style={{
                              backgroundColor: highlightResult === idx && 'white'
                          }}
                    >
                        {
                            item.icon && (
                                <div className={styles.iconWrapper}>
                                    {item.icon && (<img src={item.icon} style={{filter: highlightResult === idx && 'invert(1)'}}/>)}
                                </div>
                            )
                        }

                        <span style={{
                            marginLeft: item.icon && '20px',
                            color: highlightResult === idx ? 'black' : 'white'
                        }}>{item.displayName}</span>
                    </div>)
                )
            }
        </div>
    )
}