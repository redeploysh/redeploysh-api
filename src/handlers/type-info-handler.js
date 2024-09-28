const { InvalidRequestError } = require('../errors')

class TypeInfoHandler {
    constructor({ dynamoAdaptor }) {
        this.dynamoAdaptor = dynamoAdaptor
    }

    async handle({ pathParameters: { type, version } }) {
        if (!type || !version) {
            throw new InvalidRequestError(type || 'no type', version || 'no version')
        }
        const typeMetadata = await this.dynamoAdaptor.getType(type, version)
        return {
            statusCode: 200,
            body: {
                type,
                version,
                primaryKeyProperties: Object.values(typeMetadata.keyProperties)
            }
        }
    }
}

module.exports = TypeInfoHandler