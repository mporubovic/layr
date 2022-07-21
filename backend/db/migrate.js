import connection from "../connection.js";
import fs from "fs";

// https://stackoverflow.com/a/65402918
import { createRequire } from "module"
const require = createRequire(import.meta.url)
const defaultConcepts = require("./concepts.json")

const sql = fs.readFileSync('./schema.sql', 'utf8')

connection.connect()

connection.query(sql, (error) => {
    if (error) console.log(error)
})

connection.query("INSERT INTO users (name) VALUES (?)", ["Peter"])

defaultConcepts.forEach(c => {
    connection.query(
        "INSERT INTO concepts (name, user_id, content) VALUES (?, ?, ?)",
        [c.name, 1, JSON.stringify(c.content)]
    )
})

console.log("Migration success")

connection.end()