const { Container } = require('./framework/container'),
    dependencies = require('./dependencies')

module.exports = {
    handle: (event, context) => {
        const c = new Container(dependencies)
        const router = c.resolve('router')
        return router.dispatch(event, context)
    }
}