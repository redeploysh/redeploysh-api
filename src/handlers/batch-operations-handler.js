const { Definition, Operation } = require('../lib')

class BatchOperationsHandler {
    constructor({ operationProcessor, dynamoAdaptor }) {
        this.operationProcessor = operationProcessor
        this.dynamoAdaptor = dynamoAdaptor
    }

    deserializeDefinitions(definitions) {
        return definitions.map(def => new Definition(def))
    }

    deserializeOperations(operations) {
        let id = 0
        return operations.map(op => new Operation(op, `${id++}`))
    }

    async handle({ body }) {
        if (body.definitions) {
            await this.dynamoAdaptor.createTypes(this.deserializeDefinitions(body.definitions))
        }
        const operations = this.deserializeOperations(body.operations)
        const store = (operations.length > 0)
            ? await this.operationProcessor.process(operations)
            : {}

        return {
            statusCode: 200,
            body: this.operationProcessor.buildResponse(body.response, store)
        }
    }
}

module.exports = BatchOperationsHandler