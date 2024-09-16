const { Operation } = require('../lib/operation')

class BatchOperationsHandler {
    constructor({ operationProcessor }) {
        this.operationProcessor = operationProcessor
    }

    async handle(event) {
        const { operations, response } = event.body
        let id = 0
        return {
            statusCode: 200,
            body: await this.operationProcessor.process(operations.map(op => new Operation(op, `${id++}`)), response)
        }
    }
}

module.exports = BatchOperationsHandler