const { InvalidRequestError } = require('../errors')

class ApiGatewayJsonParser {

    constructor({ logger }) {
        this.logger = logger
    }

    parse(event, context) {
        this.logger.log(`event: ${JSON.stringify(event)}`)
        this.logger.log(`lambda context: ${JSON.stringify(context)}`)

        const {
            headers,
            queryStringParameters,
            pathParameters,
            body,
            requestContext: {
                authorizer,
                identity: {
                    sourceIp
                },
                requestId
            }
        } = event

        try {
            const requestBody = JSON.parse(body)
            return Promise.resolve({
                body: requestBody,
                headers,
                pathParameters,
                queryStringParameters,
                authorizer,
                sourceIp,
                requestId
            })
        } catch (err) {
            return Promise.reject(new InvalidRequestError('invalid json'))
        }
    }
}

module.exports = ApiGatewayJsonParser