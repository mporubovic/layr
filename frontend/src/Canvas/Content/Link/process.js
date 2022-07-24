import {getSiteData} from "../backendUtils";

export default function (data, callback) {
    let url = data.src
    if (url.indexOf('http') === -1) url = "http://" + url

    getSiteData(url).then(r => {
        let siteData = r.data.data

        let src = siteData.url
        let favicon = siteData.icons.find(i => i.favicon)?.src
        let title = siteData['og:title'] ?? siteData.title
        let description = siteData['og:description']
        let image = siteData['og:image']

        console.log(siteData, {src, favicon, title, description, image})

        callback({
            src, favicon, title, description, image
        })

        // console.log(siteData)

        // callback({src: url})
    })
}