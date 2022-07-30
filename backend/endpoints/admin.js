import {Response as _Response} from "../Response.js";
import {AdminOperation, Server} from "../config.js";
import connection from "../connection.js";
import fs from "fs";

export default function Admin(req, res) {
    let response = new _Response(res)

    switch (req.body.operation) {
        case AdminOperation.BACKUP:
            // language=MySQL
            backup().then(() => {
                response.ok().send()
            }).catch((err) => {
                response.error(err).send()
            })

            break
    }
}

export function backup() {
    const query = "SELECT * FROM concepts"

    return new Promise((resolve, reject) => {
        connection.query(query, (err, result) => {
            if (err) throw new Error(err)
            else {
                let date = new Date()
                let path = `.${Server.BACKUP_PATH}/concepts-${date.toISOString()}.json`
                let data = JSON.stringify(result)
                console.log({backup: path})
                fs.writeFile(path, data, 'utf-8', (_err) => {
                    if (_err) throw new Error(_err)
                    else resolve()
                })
            }
        })
    })

}