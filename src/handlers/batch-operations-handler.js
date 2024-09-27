const { Definition, Operation } = require('../lib')

class BatchOperationsHandler {
    constructor({ operationProcessor, typeRegistry }) {
        this.operationProcessor = operationProcessor
        this.typeRegistry = typeRegistry
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
            await this.typeRegistry.createTypes(this.deserializeDefinitions(body.definitions))
        }
        const operations = this.deserializeOperations(body.operations)
        const store = await this.operationProcessor.process(operations)
        return {
            statusCode: 200,
            body: this.operationProcessor.buildResponse(body.response, store)
        }
    }
}

module.exports = BatchOperationsHandler