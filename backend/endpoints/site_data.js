import {Response as _Response} from "../Response.js";
import {Operation, Server} from "../config.js";
import axios from "axios";
import grabFavicons from "../lib/favicongrabber/index.js";
import {v4 as uuid} from "uuid";
import fs from "fs";

export default async function Site_data(req, res) {
    let response = new _Response()
    let data = {}
    switch (req.body.operation) {
        case Operation.ONE:
            let url = req.body.site.url
            data.url = url

            try {
                let htmlResponse = await axios.get(url, {timeout: 5000})
                let html = htmlResponse.data

                let title = html.match(/<title[^>]*>(.*?)<\/title>/ims)
                if (title) data.title = title[1]

                let ogTitle = html.match(/property="og:title"\s*content="(.*?)"/ims)
                if (ogTitle) data["og:title"] = ogTitle[1]

                let ogImage = html.match(/property="og:image"\s*content="(.*?)"/ims)
                if (ogImage) data["og:image"] = ogImage[1]

                let ogDescription = html.match(/property="og:description"\s*content="(.*?)"/ims) // TODO: order
                if (ogDescription) data["og:description"] = ogDescription[1]

                grabFavicons(encodeURI(url), null, async (err, _data) => {
                    // data.icons = err ? {error: err} : _data.icons
                    let icons = _data.icons
                    data.icons = []
                    console.log(icons)

                    for (const i of icons) {
                        try {
                            let _img = await axios.get(i.src, {responseType: 'arraybuffer'})
                            let img = Buffer.from(_img.data, 'binary')

                            let _ext = i.src.split(".")
                            let ext = _ext[_ext.length-1]
                            let match = ext.match(/(.+?)[?.]/)
                            if (match) ext = match[1]

                            let fileName = uuid() + "." + ext
                            fs.writeFileSync("." + Server.PUBLIC_PATH + Server.CACHE_PATH + "/" + fileName, img, 'binary')
                            i.src = fileName
                            data.icons.push(i)
                        } catch (e) {
                            //
                        }
                    }

                    response.ok(data)

                    res.send(response)
                })

            } catch (e) {
                response.error(e.message)
                res.send(response)
            }

    }
}