const { Injector } = require('./framework/injector'),
    Router = require('./framework/router'),
    Logger = require('./logger'),
    dependencies = require('./dependencies')

module.exports = {
    handler: async (event, context) => {
        const injector = new Injector(dependencies)
        const router = new Router({ dependencies, injector, logger: new Logger() })
        return await router.dispatch(event, context)
    }
}