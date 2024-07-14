const BaseHandler = require('./base-handler')

class NotImplementedHandler extends BaseHandler {
    handle(request) {
        return this.buildErrorResponse({
            statusCode: 404,
            body: 'Not Found'
        })
    }
}

module.exports = NotImplementedHandler