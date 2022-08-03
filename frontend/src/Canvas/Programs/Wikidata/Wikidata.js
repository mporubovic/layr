import {useEffect, useRef, useState} from "react";
import axios from "axios";
import styles from './Wikidata.module.sass'
import InputBox from "../../../UI/InputBox/InputBox";
import List from "../../../UI/List/List";
import consoleStyles from '../../Console/Console.module.sass'
import Resizer from "../../Resizer/Resizer";

export default function Wikidata(props) {
    const [x, setX] = useState(props.mousePosition.x)
    const [y, setY] = useState(props.mousePosition.y)

    const [searchResults, setSearchResults] = useState([])

    const inputTimeoutRef = useRef()

    const uiRef = useRef()
    const [showResizer, setShowResizer] = useState(false)

    const search = (s) => {
        axios.get('https://www.wikidata.org/w/api.php', {
            params: {
                action: 'wbsearchentities',
                format: 'json',
                language: 'en',
                search: s
            }
        }).then((r) => {
            console.log(r)
            let results = r.data.search
            let finalResults = []

            results && results.forEach(res => {
                finalResults.push({
                    name: res.label + " " + res.description,
                    // displayName: `<strong>${res.label}</strong> <i>${res.description}</i>`,
                    displayName: (<><strong>{ res.label }</strong> <i>{ res.description } <span style={{color: 'gray'}}>{ res.id }</span> </i></>),
                    callback: () => null
                })
            })

            setSearchResults(finalResults)
        })
    }

    const onInput = (value) => {
        if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current)

        inputTimeoutRef.current = setTimeout(() => {
            if (value) search(value)
            else setSearchResults([])
        }, 0)
    }

    const onKeyDown = (e) => {
        if (e.key === 'Escape') props.close()
        else if (e.key === 'Meta') setShowResizer(true)
    }

    const onKeyUp = (e) => {
        if (e.key === 'Meta') setShowResizer(false)
    }

    const onMove = (dx, dy, corner) => {
        setX(x => x + dx)
        setY(y => y + dy)
    }

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)

        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
        }
    }, [])

    return (

        <div className={consoleStyles.console} ref={uiRef} style={{
            transform: `translate(${x}px, ${y}px)`
        }}>
            <InputBox
                label={'WIKIDATA SEARCH'}
                initialValue={''}
                onInput={onInput}
            />

            {
                searchResults.length > 0 &&
                (
                    <List
                        items={searchResults}
                    />
                )
            }

            <div className={styles.logo}>
                <a href='https://www.wikidata.org/wiki/Wikidata:Main_Page' target='_blank'>
                    <img src={require('./Wikidata-inline-white.svg').default} />
                </a>
            </div>

            {
                showResizer &&
                (<Resizer
                    contentRef={uiRef.current}
                    onMouseLeave={() => null}
                    pointerMove={onMove}
                    pointerUp={() => null}
                    pointerDown={() => null}
                    relative={true}
                />)
            }
        </div>
    )
}