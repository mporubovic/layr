import {Response as _Response} from "../Response.js";
import {Error, Operation, Server} from "../config.js";
import fs from "fs";

export default function Content(req, res) {
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
}