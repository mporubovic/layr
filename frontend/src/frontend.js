import axios from "axios";
import * as Backend from "./config"

const user = {
    id: 1
}

const request = (endpoint, operation, data, config) => {
    console.debug(`[⬆] [${endpoint}] [${operation}]`, data)
    return null
    return axios.post(Backend.Server.URL + endpoint, {user, operation, ...data}, config).then((r) => {
        if (r.data.status === Backend.Status.ERROR) console.warn("[⬇]", r.data.error)
        else console.log("[⬇]", r.data)
        return r
    })
}

const fileRequest = (endpoint, operation, formData) => {
    formData.append("user", user)
    formData.append("operation", operation)
    return axios.post(Backend.Server.URL + endpoint, formData, {headers: {"Content-Type": "multipart/form-data"}})
}

export default { request, fileRequest }