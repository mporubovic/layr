import {Status, Error} from "./config.js";

export class Response {
    constructor() {
        this.status = Status.ERROR
        this._error = Error.UNKNOWN
        this.data = null
    }

    ok(data) {
        this.status = Status.OK
        this._error = null
        this.data = data
    }

    error(e) {
        // this.status = con
        this._error = e
    }

    toJSON() {
        return {
            status: this.status,
            data: this.data,
            ...( this.status === Status.ERROR && { error: this._error })
        }
    }
}