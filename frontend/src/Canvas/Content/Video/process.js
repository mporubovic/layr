import { uploadFile } from "../backendUtils";

export default function (file, data, callback) {
    uploadFile(file).then(r => {
        let url = r.data.data
        let vid = document.createElement("video")

        vid.src = data
        vid.onloadedmetadata = () => {
            let scale = window.innerWidth / (5 * vid.videoWidth)

            callback({src: url, scale})

            vid.onloadedmetadata = null
            vid = null
        }

        vid.load()
    })
}