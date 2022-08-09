import {Response as _Response} from "../Response.js";
import connection from "../connection.js";
import {Error, Operation} from "../config.js";

export default function Concepts(req, res) {
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
            query = "UPDATE concepts SET "

            let whitelist = ['name', 'content', 'metadata']

            Object.entries(req.body.concept)
                    .filter(e => whitelist.includes(e[0]))
                    .forEach((e, idx, arr) => {
                        let key = e[0]
                        let value = e[1]

                        query += `${key} = ${connection.escape(value)}`

                        if (idx === arr.length - 1) query += ' '
                        else query += ', '
                    })

            query += `WHERE id = ${connection.escape(req.body.concept.id)}`

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
}