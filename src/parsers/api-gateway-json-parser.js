const { InvalidRequestError } = require('../errors')

class ApiGatewayJsonParser {
    parse(event) {
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
            return {
                body: JSON.parse(body),
                headers,
                pathParameters,
                queryStringParameters,
                authorizer,
                sourceIp,
                requestId
            }
        } catch (err) {
            throw new InvalidRequestError(err)
        }
    }
}

module.exports = ApiGatewayJsonParser