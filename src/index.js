const { Injector } = require('./framework/injector'),
    dependencies = require('./dependencies')

module.exports = {
    handle: (event, context) => {
        const i = new Injector(dependencies)
        const router = i.resolve('router')
        return router.dispatch(event, context)
    }
}