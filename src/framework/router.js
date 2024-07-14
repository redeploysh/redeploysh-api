class Router {
    constructor({ routes }) {
        this.routes = routes
    }

    dispatch(event, context) {
        const { resource, httpMethod } = event
        const routeName = `${httpMethod}${resource}`

        if (!this.routes[routeName]) {
            return this.routes['NotFound'].parser(event, context)
                .then(request => this.routes['NotFound'].handler(request))
        }

        return this.routes[routeName].parser(event, context)
            .then(request => this.routes[routeName].handler(request))
    }
}

module.exports = Router