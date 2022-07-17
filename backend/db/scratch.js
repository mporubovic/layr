const connection = require("../connection")

connection.connect()

connection.query("SELECT * FROM concepts WHERE user_id = 1 LIMIT 1;", (error, result) => {
    if (error) console.log(error)
    else console.log(result)
})


connection.end()
