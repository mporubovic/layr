import style from './Resizer.module.sass'


export default function Resizer(props) {

    function corner(c) {
        let cursor


    }


    return (
        <div className={style.resizer}>

            <div className={style.tlCorner} onMouseEnter={() => props.corner("tl")} />
            <div className={style.trCorner} onMouseEnter={() => props.corner("tr")} />
            <div className={style.blCorner} onMouseEnter={() => props.corner("bl")} />
            <div className={style.brCorner} onMouseEnter={() => props.corner("br")} />

            <div className={style.left} />
            <div className={style.right} />
            <div className={style.top} />
            <div className={style.bottom} />


        </div>
    )
}