export default function (data, callback) {
    let html = data?.html ?? "<h1>Goodbye world!</h1>"
    callback({html})
}