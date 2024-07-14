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

module.exports = { InvalidRequestError }