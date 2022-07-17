import mysql from "mysql"

export default mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'rootuser',
        database: 'layr',
        multipleStatements: true
    })