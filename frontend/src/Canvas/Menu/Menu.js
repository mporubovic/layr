import styles from './Menu.module.sass'
import {useEffect, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import menuSlice from "../../state/menu";
import menus from "./menus";

export default function Menu(props) {

    const dispatch = useDispatch()

    const mouse = {
        x: useSelector(state => state.inputManager.mouse.x),
        y: useSelector(state => state.inputManager.mouse.y)
    }

    const localPosition = useRef({ x: 0, y: 0 })

    const menuId = useSelector(state => state.menu.menuId)

    const onKeyDown = (e) => {
        if (e.key === 'Escape' && menuId) dispatch(menuSlice.actions.setMenuId(null))
    }

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown)

        return () => {
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [menuId])

    useEffect(() => {
        if (menuId) return
        localPosition.current = {
            x: mouse.x,
            y: mouse.y
        }
    }, [mouse])

    if (!menuId) return null

    return (
        <div className={styles.menu} style={{
            transform: `translate(${localPosition.current.x}px, ${localPosition.current.y}px)`
        }}>
            { menus.find(m => m.contentId === menuId).jsx }
        </div>
    )
}