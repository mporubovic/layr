import {Status, Error} from "./config.js";

export class Response {
    constructor(res) {
        this.status = Status.ERROR
        this._error = Error.UNKNOWN
        this.data = null
        this.res = res
    }

    ok(data) {
        this.status = Status.OK
        this._error = null
        this.data = data
        return this
    }

    error(e) {
        // this.status = con
        this._error = e
        return this
    }

    send() {
        this.res.send(this)
    }

    toJSON() {
        return {
            status: this.status,
            data: this.data,
            ...( this.status === Status.ERROR && { error: this._error })
        }
    }
}