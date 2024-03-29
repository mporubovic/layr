const Server = {
    IP: "127.0.0.1",
    PORT: 2001,
    PUBLIC_PATH: '/public',
    STORAGE_PATH: '/storage',
    CACHE_PATH: '/cache',
    BACKUP_PATH: '/backup',
    BACKUP_INTERVAL: 1000 * 60 * 30,
}

Server.URL = `http://${Server.IP}:${Server.PORT}`
Server.EXTERNAL_CONTENT_URL = Server.URL + Server.STORAGE_PATH
Server.INTERNAL_CONTENT_URL = Server.URL + Server.PUBLIC_PATH + Server.STORAGE_PATH
Server.INTERNAL_CONTENT_PATH = "." + Server.PUBLIC_PATH + Server.STORAGE_PATH
Server.EXTERNAL_CACHE_URL = Server.URL + Server.CACHE_PATH

const Endpoint = {
    CONCEPTS: "/concepts",
    CONTENT: "/content",
    SITE_DATA: "/site-data",
    ADMIN: '/admin'
}

const Operation = {
    LIST: 'list',
    ONE: 'one',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
}

const AdminOperation = {
    BACKUP: 'backup'
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
    AUTHENTICATION_GUARD_FAIL: "Unauthenticated",
    SITE_DATA_TITLE_NOT_FOUND: "Title not found"
}

export { Server, Endpoint, Operation, Status, Error, AdminOperation }