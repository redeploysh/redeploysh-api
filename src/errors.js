class RedeployShError extends Error {
    constructor(name, statusCode, message) {
        super(name)
        this.name = name
        this.statusCode = statusCode
        this.message = message
    }
}

class ReadOperationProcessingError extends RedeployShError {
    constructor(cause) {
        super('ReadOperationProcessingError', 400, cause.message || cause.errorMessage || 'Read Error')
        this.cause = cause
    }
}

class WriteOperationProcessingError extends RedeployShError {
    constructor(cause) {
        super('WriteOperationProcessingError', 400, cause.message || cause.errorMessage || 'Write Error')
        this.cause = cause
    }
}

class InvalidOperationError extends RedeployShError {
    constructor(message, cause) {
        super('InvalidOperationProcessingError', 400, message)
        this.cause = cause
    }
}

class InvalidTypeError extends RedeployShError {
    constructor(type, version) {
        super('InvalidTypeError', 400, `Invalid type '${type}:${version}'`)
    }
}

class InvalidRequestError extends RedeployShError {
    constructor(cause) {
        super('InvalidRequestError', 400, cause.message || cause.errorMessage || 'Invalid Request Error')
    }
}

class NotFoundError extends RedeployShError {
    constructor() {
        super('NotFoundError', 404, 'Not Found')
    }
}

class InternalProcessingError extends RedeployShError {
    constructor(cause) {
        super('InternalOperationProcessingError', 503, cause.message || cause.errorMessage)
    }
}

module.exports = { ReadOperationProcessingError, WriteOperationProcessingError, InvalidOperationError, InvalidTypeError, InvalidRequestError, NotFoundError, InternalProcessingError, RedeployShError }
