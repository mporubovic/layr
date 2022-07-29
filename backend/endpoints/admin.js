import {Response as _Response} from "../Response.js";
import {AdminOperation, Server} from "../config.js";
import connection from "../connection.js";
import fs from "fs";

export default function Admin(req, res) {
    let response = new _Response()

    switch (req.body.operation) {
        case AdminOperation.BACKUP:
            // language=MySQL
            const query = "SELECT * FROM concepts"
            connection.query(query, (err, result) => {
                if (err) response.error(err)
                else {
                    let date = new Date()

                    fs.writeFileSync(`.${Server.BACKUP_PATH}/concepts-${date.toISOString()}.json`, JSON.stringify(result), 'utf-8')
                    response.ok()
                }
                res.send(response)
            })
            break
    }
}