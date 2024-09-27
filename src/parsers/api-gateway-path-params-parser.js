class ApiGatewayPathParamsParser {
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

        return {
            headers,
            pathParameters,
            authorizer,
            sourceIp,
            requestId
        }
    }
}

module.exports = ApiGatewayPathParamsParser