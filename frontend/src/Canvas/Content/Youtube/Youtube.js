import styles from './Youtube.sass'
import {useEffect, useState} from "react";
import {contentCommands} from "../../Console/commands";
import {registerMenu, unregisterMenu} from "../../Menu/menus";
import InputBox from "../../../UI/InputBox/InputBox";
import {useDispatch} from "react-redux";
import menuSlice from "../../../state/menu";

export default function Youtube(props) {

    const dispatch = useDispatch()

    const [active, setActive] = useState(false)

    let id = props.local.id

    useEffect(() => {

        registerMenu({
            contentId: id,
            jsx: (<InputBox
                    label='YouTube video URL'
                    initialValue={props.src}
                    onEnter={(data) => {
                        props.update({ src: data.value })
                        dispatch(menuSlice.actions.setMenuId(null))
                    }}
                  />)
        })

        let commands = [
            {
                name: 'edit',
                displayName: 'edit link',
                icon: require("../../icons/edit.svg").default,
                callback: () => {
                    dispatch(menuSlice.actions.setMenuId(id))
                },
            }
        ]

        contentCommands.push(...commands.map(c => {
            return {...c, contentId: id}
        }))

        return () => {
            unregisterMenu(id)
        }

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
                    sandbox='allow-scripts allow-same-origin allow-popups'
                    title='YouTube video player'
                    allowFullScreen
            />
        </div>
    )
}