class ApiGatewayPathParamsParser {

    constructor({ logger }) {
        this.logger = logger
    }

    parse(event) {
        const {
            headers,
            pathParameters,
            requestContext: {
                authorizer,
                identity: {
                    sourceIp
                },
                requestId
            }
        } = event

        return Promise.resolve({
            headers,
            pathParameters,
            authorizer,
            sourceIp,
            requestId
        })
    }
}

module.exports = ApiGatewayPathParamsParser