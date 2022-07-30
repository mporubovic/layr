import {getSiteData} from "../backendUtils";

export default function (data, callback) {
    let updateFunc = callback({src: data.src})

    getSiteData(data.src).then(r => {
        let siteData = r.data.data

        let title = siteData['og:title'] ?? siteData.title ?? 'YouTube video'

        updateFunc({
            title
        })
    })

}