import connection from "../connection.js";
import fs from "fs";

// https://stackoverflow.com/a/65402918
import { createRequire } from "module"
const require = createRequire(import.meta.url)
const defaultConcepts = require("../backup/concepts-2022-12-25T22:48:01.800Z.json")

const sql = fs.readFileSync('./schema.sql', 'utf8')

connection.connect()

connection.query(sql, (error) => {
    if (error) console.log(error)
})

connection.query("INSERT INTO users (name) VALUES (?)", ["Peter"])

defaultConcepts.forEach(c => {
    connection.query(
        "INSERT INTO concepts (name, user_id, content, metadata) VALUES (?, ?, ?, ?)",
        // [c.name, 1, JSON.stringify(c.content), JSON.stringify(c.metadata)]
            [c.name, 1, c.content, c.metadata]
    )
})

console.log("Migration success")

connection.end()