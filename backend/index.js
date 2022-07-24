import express from "express"
const app = express()

import connection from "./connection.js"

import cors from "cors";
import multer from "multer";
import path from "path";
import {v4 as uuid} from "uuid";
import fs from "fs";
import {Response as _Response} from './Response.js'

import { Server, Endpoint, Error, Operation } from "./config.js"
import axios from "axios";
import grabFavicons from "./lib/favicongrabber.com/index.js";

const storage = multer.diskStorage({
    destination: Server.INTERNAL_CONTENT_PATH,
    filename: function (req, file, cb) {
        cb(null, uuid() + path.extname(file.originalname));
    }
});

const upload = multer({storage})

app.use(express.static(Server.PUBLIC_PATH.replace("/", "")))
app.use(cors())
app.use(express.json())

connection.connect()

app.post(Endpoint.CONCEPTS, (req, res) => {
    let response = new _Response()
    let userId = req.body.user.id
    let query = ""
    let values = []
    let guard = (next, err) => next()
    let process = (d) => d

    let userGuard = (id, next, _err) => {
        // language=MySQL
        let _query = "SELECT * FROM concepts WHERE id = ?"
        let _values = [id]

        connection.query(_query, _values, (err, result) => {
            if (err) _err(err)
            else if (result.length === 0) _err("Concept not found")
            else if (result[0]["user_id"] !== userId) _err("User mismatch")
            else next()
        })
    }

    console.log(req.body)

    switch (req.body.operation) {
        case Operation.LIST:
            // language=MySQL
            query = "SELECT * FROM concepts WHERE user_id = ?"
            values = [userId]
            break
        case Operation.ONE:
            // language=MySQL
            query = "SELECT * FROM concepts WHERE concepts.id = ? LIMIT 1"
            values = [req.body.concept.id]
            guard = (next, err) => userGuard(req.body.concept.id, next, err)
            process = (d) => d[0]
            break
        case Operation.CREATE:
            // language=MySQL
            query = "INSERT INTO concepts (name, user_id, content) VALUES (?, ?, ?);"
            // language=MySQL
            query += "SELECT * FROM concepts WHERE id = LAST_INSERT_ID()"
            values = [req.body.concept.name, userId, req.body.concept.content]
            process = (d) => d[1][0]
            break
        case Operation.UPDATE:
            // language=MySQL
            query = "UPDATE concepts SET name = ?, content = ? WHERE id = ?"
            values = [req.body.concept.name, req.body.concept.content, req.body.concept.id]
            guard = (next, err) => userGuard(req.body.concept.id, next, err)
            process = (d) => null
            break
        case Operation.DELETE:
            // language=MySQL
            query = "DELETE FROM concepts WHERE id = ?"
            values = [req.body.concept.id]
            guard = (next, err) => userGuard(req.body.concept.id, next, err)
            process = (d) => null
            break
        default:
            response.error(Error.UNSUPPORTED_OPERATION)
            return res.send(response)
    }

    guard(() => {
        connection.query(query, values, (err, results, fields) => {
            // console.log(results, fields)
            if (err) response.error(err)
            else response.ok(process(results))
            res.send(response)
        })
    }, (e) => {
        response.error(e)
        res.send(response)
    })


})

app.post(Endpoint.CONTENT, upload.single('file'), (req, res) => {
    let response = new _Response()

    switch (req.body.operation) {
        case Operation.CREATE:
            if (req.file) response.ok(req.file.filename)
            else response.error(Error.MISSING_FILE)
            res.send(response)
            break

        case Operation.DELETE:
            fs.unlink( Server.INTERNAL_CONTENT_PATH + "/" + req.body.content.src, (err) => {
                if (err)  response.error(err)
                else response.ok(null)
                res.send(response)
            })
            break
        default:
            response.error(Error.UNSUPPORTED_OPERATION)
            return res.send(response)
    }
})

app.post(Endpoint.SITE_DATA, async (req, res) => {
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

                let ogDescription = html.match(/property="og:description"\s*content="(.*?)"/ims)
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
})

app.listen(Server.PORT, (a) => {
    console.log("Listening on " + Server.URL)
})