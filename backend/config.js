const Server = {
    IP: "127.0.0.0",
    PORT: 2001,
    PUBLIC_PATH: '/public',
    STORAGE_PATH: '/storage'
}

Server.URL = `http://${Server.IP}:${Server.PORT}`

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

export default { Server, Endpoint, Operation, Status }