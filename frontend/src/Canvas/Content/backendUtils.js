import Frontend from "../../frontend";
import * as Backend from "../../../../backend/config.js"

const errorHandler = (response) => {
    if (response.data.status === Backend.Status.ERROR) {
        console.warn("File upload error:", response.data.error)
    }
    return response
}

const uploadFile = (file) => {
    const formData = new FormData()
    formData.append("file", file)

    return Frontend.fileRequest(Backend.Endpoint.CONTENT, Backend.Operation.CREATE, formData)
                                .then(errorHandler)
}

const getSiteData = (site) => {
    return Frontend.request(Backend.Endpoint.SITE_DATA, Backend.Operation.ONE, {
        operation: "one",
        site: {
            url: site
        }
    }).then(errorHandler)
}

export { uploadFile, getSiteData }