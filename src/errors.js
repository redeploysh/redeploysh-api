class RedeployShError extends Error {
    constructor(name, statusCode, message) {
        super(name)
        this.name = name
        this.statusCode = statusCode
        this.message = message
    }
}

class InvalidRequestError extends RedeployShError {
    constructor(message) {
        super('InvalidRequestError', 400, message)
    }
}

class InternalServerError extends RedeployShError {
    constructor(message) {
        super('InternalServerError', 503, message)
    }
}

class NotFoundError extends RedeployShError {
    constructor(message) {
        super('NotFoundError', 404, message)
    }
}

class InvalidTypeError extends RedeployShError {
    constructor(type, version) {
        super('InvalidTypeError', 400, `Invalid type '${type}:${version}'`)
    }
}

module.exports = { InternalServerError, InvalidRequestError, NotFoundError, InvalidTypeError }