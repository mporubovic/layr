import {Response as _Response} from "../Response.js";

export default function Template(req, res) {
    let response = new _Response()

    switch (req.body.operation) {
        case null:
            break
    }

    response.ok(null)
}