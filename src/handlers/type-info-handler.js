const BaseHandler = require('./base-handler'),
    { InvalidRequestError, InternalServerError, NotFoundError } = require('../errors')

class TypeInfoHandler extends BaseHandler {
    constructor({ typeRegistry }) {
        super()
        this.typeRegistry = typeRegistry
    }

    handle({ pathParameters: { type, version } }) {
        if (!type || !version) {
            return this.buildErrorResponse(new InvalidRequestError('type and version required'))
        }
        const typeMetadata = this.typeRegistry.getType(type, version)
        return this.buildResponse({
            statusCode: 200,
            body: JSON.stringify({
                type,
                version,
                primaryKeyProperties: Object.values(typeMetadata)
            })
        })
    }
}

module.exports = TypeInfoHandler