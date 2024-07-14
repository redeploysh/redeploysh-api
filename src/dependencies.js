const parsers = require('./framework/parsers'),
    handlers = require('./handlers'),
    Logger = require('./framework/logger'),
    Router = require('./framework/router')

const routes = {
    'GET/': {
        parser: 'ApiGatewayJsonParser',
        handler: 'NotImplementedHandler'
    }
}

module.exports = {
    logger: c => new Logger(),
    router: c => new Router({
        routes: c.resolve('routes')
    }),
    parsers: {
        ApiGatewayJsonParser: c => new parsers.ApiGatewayJsonParser({ logger: c.resolve('logger') })
    },
    handlers: {
        NotImplementedHandler: c => new handlers.NotImplementedHandler({ logger: c.resolve('logger') })
    },
    routes: {
        'GET/': {
            parser: c.resolve('ApiGatewayJsonParser'),
            handler: c.resolve('DummyHandler')
        }
    }
}