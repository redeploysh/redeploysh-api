const { NotFoundError, InternalProcessingError, RedeployShError } = require('../errors')

const defaultRoutes = {
    'GET/v1/types/{type}/{version}': {
        parser: 'apiGatewayPathParamsParser',
        handler: 'typeInfoHandler'
    },
    'POST/v1/data': {
        parser: 'apiGatewayJsonParser',
        handler: 'batchOperationsHandler'
    }
}

class Router {
    constructor({ dependencies, injector, logger, routes = defaultRoutes }) {
        this.dependencies = dependencies
        this.injector = injector
        this.logger = logger
        this.routes = routes
    }

    buildResponse({ statusCode, headers, body }) {
        return {
            statusCode,
            headers: Object.assign({}, headers || {}, {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST,GET,OPTIONS'
            }),
            body: JSON.stringify(body)
        }
    }

    buildErrorResponse({ statusCode, message, headers }) {
        return {
            statusCode: statusCode || 500,
            headers: Object.assign({}, headers || {}, {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST,GET,OPTIONS'
            }),
            body: message || 'Unknown Error'
        }
    }

    async dispatch(event, context) {
        try {
            const { resource, httpMethod } = event
            const routeName = `${httpMethod}${resource}`
            if (!this.routes[routeName]) {
                throw new NotFoundError(`${routeName} not found`)
            }

            const parser = this.dependencies[this.routes[routeName].parser](this.injector)
            const handler = this.dependencies[this.routes[routeName].handler](this.injector)

            const request = parser.parse(event, context)
            const response = await handler.handle(request)
            return this.buildResponse(response)
        } catch (err) {
            if (err instanceof RedeployShError) {
                return this.buildErrorResponse(err)
            } else {
                this.logger.error(`err: ${JSON.stringify(err)} ${err.name} ${err.message} ${err.stack}`)
                return this.buildErrorResponse(new InternalProcessingError(err.message))
            }
        }
    }
}

module.exports = Router