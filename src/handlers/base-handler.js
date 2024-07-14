class BaseHandler {
    buildResponse({ statusCode, headers, body }) {
        return {
            statusCode,
            headers: headers || {},
            body
        }
    }

    buildErrorResponse({ statusCode, message, headers }) {
        return {
            statusCode: statusCode || 500,
            headers: headers || {},
            body: message || 'Internal Server Error'
        }
    }
}

module.exports = BaseHandler