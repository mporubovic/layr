import express from "express"
const app = express()

import connection from "./connection.js"

import cors from "cors";
import multer from "multer";
import path from "path";
import {v4 as uuid} from "uuid";
import fs from "fs";
import {StatusCodes} from "http-status-codes";

import config from "./config.js"

const storage = multer.diskStorage({
    destination: "." + config.Server.PUBLIC_PATH + config.Server.STORAGE_PATH,
    filename: function (req, file, cb) {
        cb(null, uuid + path.extname(file.originalname));
    }
});

const upload = multer({storage})

app.use(express.static(config.Server.PUBLIC_PATH))
app.use(cors())
app.use(express.json())



connection.connect()


app.post(config.Endpoint.CONCEPTS, (req, res) => {
    let response = { status: null, data: null }
    let userId = req.body.user.id
    let query = ""
    let values = []
    let guard = (c) => true
    let process = (d) => d
    let error = null

    switch (req.body.operation) {
        case config.Operation.LIST:
            // language=MySQL
            query = "SELECT * FROM concepts WHERE user_id = ?"
            values = [userId]
            break
        case config.Operation.ONE:
            // language=MySQL
            query = "SELECT * FROM concepts WHERE concepts.id = ? LIMIT 1"
            values = [req.body.concept.id]
            guard = c => c[0]['user_id'] === userId
            process = (d) => d[0]
            break
        case config.Operation.CREATE:
            // language=MySQL
            query = "INSERT INTO concepts (name, user_id, content) VALUES (?, ?, ?)"
            values = [req.body.concept.name, userId, req.body.concept.content]
            process = (d) => d[0]
            break
        case config.Operation.DELETE:
            // language=MySQL
            query = "DELETE FROM concepts WHERE id = ?"
            values = [req.body.concept.id]
            guard = c => c[0]['user_id'] === userId
            process = (d) => "ok"
            break
        case config.Operation.UPDATE:
            // language=MySQL
            query = "UPDATE concepts SET name = ?, content = ? WHERE id = ?"
            values = [req.body.concept.name, req.body.concept.content, req.body.concept.id]
            guard = c => c[0]['user_id'] === userId
            process = (d) => d[0]
            break
        default:
            error = "Unsupported operation"
            break
    }


    if (!error) {
        connection.query(query, values, (err, results, fields) => {
            if (err) {
                response.status = "error"
                response.data = err
            }
            else if (guard(results)) {
                response.status = "ok"
                response.data = process(results)
            }
            else {
                response.status = "error"
                response.data = "Guard fail"
            }
            res.send(response)
        })
    }
    else {
        response.status = "error"
        response.data = error
        res.send(response)
    }
})

app.post(config.Endpoint.CONTENT, upload.single('file'), (req, res) => {
    switch (req.body.operation) {
        // case
    }

    if (req.file) {
        res.status(StatusCodes.OK).send("storage/" + req.file.filename)
    }
    else {

    }
})

app.delete('/content/*', (req, res) => {
    let filePath = req.params[0]

    fs.unlink(publicFolder + "/" + filePath, (err) => {
        if (err) {
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
        }
        else {
            res.status(StatusCodes.OK).send()
        }
    })
})

app.listen(config.Server.PORT, (a) => {
    console.log("Listening on " + config.Server.URL)
})