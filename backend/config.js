const Server = {
    IP: "127.0.0.1",
    PORT: 2001,
    PUBLIC_PATH: '/public',
    STORAGE_PATH: '/storage'
}

Server.URL = `http://${Server.IP}:${Server.PORT}`
Server.EXTERNAL_CONTENT_URL = Server.URL + Server.STORAGE_PATH
Server.INTERNAL_CONTENT_URL = Server.URL + Server.PUBLIC_PATH + Server.STORAGE_PATH
Server.INTERNAL_CONTENT_PATH = "." + Server.PUBLIC_PATH + Server.STORAGE_PATH

const Endpoint = {
    CONCEPTS: "/concepts",
    CONTENT: "/content"
}

const Operation = {
    LIST: 'list',
    ONE: 'one',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
}

const Status = {
    ERROR: 'error',
    OK: 'ok'
}

const Error = {
    UNSUPPORTED_OPERATION: "Unsupported operation",
    MISSING_FILE: "Missing file",
    UNKNOWN: "Unknown error",
    AUTHORIZATION_GUARD_FAIL: "Unauthorized",
    AUTHENTICATION_GUARD_FAIL: "Unauthenticated"
}

export { Server, Endpoint, Operation, Status, Error }