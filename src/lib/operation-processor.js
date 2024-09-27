const { ReadOperationProcessingError, InvalidOperationError, WriteOperationProcessingError, RedeployShError } = require('../errors')

class OperationProcessor {
    constructor({ dynamoAdaptor, typeRegistry, operationSorter, variableSubstitutor }) {
        this.dynamoAdaptor = dynamoAdaptor
        this.typeRegistry = typeRegistry
        this.operationSorter = operationSorter
        this.variableSubstitutor = variableSubstitutor
    }

    async process(operations) {
        const readOperations = this.operationSorter.sortOperations(operations.filter(op => op.isReadOperation()))
        const writeOperations = operations.filter(op => !op.isReadOperation())
        const store = await this.processReads(readOperations)
        await this.processWrites(writeOperations)
        return store
    }

    async processReads(operations) {
        let store = {}
        for (let i = 0; i < operations.length; i++) {
            store = await this.processRead(operations[i], store)
        }
        return store
    }

    async processRead(originalOperation, store) {
        try {
            const key = this.variableSubstitutor.substituteInObject(originalOperation.key, store)
            const operation = Object.assign({}, originalOperation)
            operation.key = key
            const item = await this.dynamoAdaptor.get(operation)
            let newStore = Object.assign({}, store)
            for (let returnVariableIdentifier of Object.keys(operation.returnValues)) {
                if (this.getProperty(item, operation.returnValues[returnVariableIdentifier])) {
                    newStore[returnVariableIdentifier] = this.getProperty(item, operation.returnValues[returnVariableIdentifier])
                } else {
                    throw new ReadOperationProcessingError(`${returnVariableIdentifier} set to value of ${operation.returnValues[returnVariableIdentifier]} but that property is not found in the source data: ${JSON.stringify(item)}`)
                }
            }
            return newStore
        } catch (err) {
            if (err instanceof RedeployShError) {
                throw err
            }
            throw new ReadOperationProcessingError(err)
        }
    }

    async processWrites(originalOperations, store) {
        const operations = originalOperations
            .map(operation => ({
                op: operation.op,
                type: operation.type,
                version: operation.version,
                data: this.variableSubstitutor.substituteInObject(operation.data, store)
            }))
        try {
            return await this.dynamoAdaptor.batchWrite(operations)
        } catch (err) {
            throw new WriteOperationProcessingError(err)
        }
    }

    buildResponse(response, store) {
        return (response) ? this.variableSubstitutor.substituteInObject(response, store) : {}
    }

    getProperty(data, path) {
        if (path.indexOf('\.') > -1) {
            const top = path.split('.')[0]
            return this.getProperty(data[top], path.substring(path.indexOf('.') + 1))
        } else {
            if (data[path]) {
                return data[path]
            }
            throw new InvalidOperationError(`missing data property ${path}`)
        }
    }
}

module.exports = OperationProcessor