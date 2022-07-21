import {getSiteData} from "../backendUtils";

export default function (data, callback) {
    getSiteData(data.src).then(r => {
        let url = r.data.data

        let img = new Image()

        img.onload = () => {
            let scale = window.innerWidth / (5 * img.width)
            callback({src: url, scale})

            img.onload = null
            img = null
        }

        img.src = data
    })
}