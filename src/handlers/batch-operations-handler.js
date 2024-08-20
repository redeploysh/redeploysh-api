const BaseHandler = require('./base-handler'),
    { Operation } = require('../lib/operation')

class BatchOperationsHandler extends BaseHandler {
    constructor({ dynamoAdaptor, operationProcessor }) {
        super()
        this.dynamoAdaptor = dynamoAdaptor
        this.operationProcessor = operationProcessor
    }

    handle(event) {
        const { operations } = event.body
        return this.operationProcessor.process(operations.map(op => new Operation(op)))
            .then(() => this.buildResponse({ statusCode: 200, body: {} }))
            .catch((err) => {
                this.logger.error(`processing error: ${JSON.stringify(err)}`)
                return this.buildErrorResponse({
                    message: `processing error; transaction rejected`
                })
            })
    }
}

module.exports = BatchOperationsHandler