import {getSiteData} from "../backendUtils";

export default function (data, callback) {
    let text = data?.text ?? "Lorem ipsum"
    callback({text})
}