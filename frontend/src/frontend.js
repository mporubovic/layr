import axios from "axios";
import Backend from "../../backend/config.js"

const user = {
    id: 1
}

const request = (endpoint, operation, data) => {
    return axios.post(Backend.URL + endpoint, {user, operation, data})
}

export default { request }