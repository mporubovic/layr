import express from "express"
import connection from "./connection.js"
import cors from "cors";
import multer from "multer";
import path from "path";
import {v4 as uuid} from "uuid";
import { Server, Endpoint } from "./config.js"
import Concepts from "./endpoints/concepts.js";
import Content from "./endpoints/content.js";
import Site_data from "./endpoints/site_data.js";
import Admin from "./endpoints/admin.js";

const storage = multer.diskStorage({
    destination: Server.INTERNAL_CONTENT_PATH,
    filename: function (req, file, cb) {
        cb(null, uuid() + path.extname(file.originalname));
    }
});
const upload = multer({storage})

const app = express()

app.use(express.static(Server.PUBLIC_PATH.replace("/", "")))
app.use(cors())
app.use(express.json())

connection.connect()

app.post(Endpoint.CONCEPTS, Concepts)
app.post(Endpoint.CONTENT, upload.single('file'), Content)
app.post(Endpoint.SITE_DATA, Site_data)
app.post(Endpoint.ADMIN, Admin)

app.listen(Server.PORT, (a) => {
    console.log("Listening on " + Server.URL)
})