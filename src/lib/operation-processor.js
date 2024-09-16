const { ReadOperationProcessingError, InvalidOperationError, WriteOperationProcessingError, RedeployShError } = require('../errors')

class OperationProcessor {
    constructor({ dynamoAdaptor, typeRegistry, operationSorter, logger }) {
        this.dynamoAdaptor = dynamoAdaptor
        this.typeRegistry = typeRegistry
        this.operationSorter = operationSorter
        this.logger = logger
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

    containsSubstitution(stringValue) {
        const re = /\$\{[-\w]+\}/
        return (stringValue.match(re) != null)
    }

    substitute(stringValue, data) {
        const substitutions = {}
        Object.keys(data).forEach((variableReference) => {
            substitutions[variableReference] = data[variableReference]
        })
        const re = new RegExp(`\\$\\{[-\\w]+\\}`, "g")
        return stringValue.replace(re, (matched) => {
            const key = matched.match(/\$\{(.+)\}/)[1]
            if (!key || !substitutions[key]) {
                throw new InvalidOperationError(`Undefined variable in substitution: ${key}`)
            }
            return substitutions[key]
        })
    }

    buildOperationWithValues(operation, variables) {
        const op = Object.assign({}, operation)
        Object.keys(op.key)
            .filter(propertyName => this.containsSubstitution(op.key[propertyName]))
            .forEach(propertyName => op.key[propertyName] = this.substitute(op.key[propertyName], variables))
        return op
    }

    async read(operation, variables) {
        try {
            const op = this.buildOperationWithValues(operation, variables)
            const item = await this.dynamoAdaptor.get(op)
            let data = {}
            for (let returnedValueIdentifier of Object.keys(op.returnValues)) {
                if (this.getProperty(item, op.returnValues[returnedValueIdentifier])) {
                    data[returnedValueIdentifier] = this.getProperty(item, op.returnValues[returnedValueIdentifier])
                } else {
                    throw new ReadOperationProcessingError(`${returnedValueIdentifier} set to value of ${op.returnValues[returnedValueIdentifier]} but that property is not found in the source data: ${JSON.stringify(item)}`)
                }
            }
            return data
        } catch (err) {
            if (err instanceof RedeployShError) {
                throw err
            }
            throw new ReadOperationProcessingError(err)
        }
    }

    async processReadOperation(operation, data) {
        const result = await this.read(operation, data)
        return Object.assign({}, data, result)
    }

    async processReadOperations(operations) {
        let data = {}
        for (let i = 0; i < operations.length; i++) {
            data = await this.processReadOperation(operations[i], data)
        }
        return data
    }

    mapWriteOperations(operations, data) {
        return operations.filter(op => !op.isReadOperation())
            .map((op) => {
                Object.keys(op.data)
                    .filter(propertyName => this.containsSubstitution(op.data[propertyName]))
                    .forEach(propertyName => op.data[propertyName] = this.substitute(op.data[propertyName], data))
                return {
                    op: op.op,
                    type: op.type,
                    version: op.version,
                    data: op.data
                }
            })
    }

    async process(operations, response) {
        const data = await this.processReadOperations(this.operationSorter.sortOperations(operations.filter(op => op.isReadOperation())))
        const writeItems = this.mapWriteOperations(operations, data)
        if (writeItems.length === 0) {
            return this.processResponse(response, data)
        } else {
            try {
                await this.dynamoAdaptor.batchWrite(writeItems)
                return this.processResponse(response, data)
            } catch (err) {
                throw new WriteOperationProcessingError(err)
            }
        }
    }

    processResponse(response, data) {
        if (!response) {
            return {}
        } else if (response.constructor && response.constructor === Object) {
            const final = {}
            Object.keys(response).forEach((key) => {
                final[key] = this.processResponse(response[key], data)
            })
            return final
        } else if (Array.isArray(response)) {
            return response.map(responseElement => this.processResponse(responseElement, data))
        } else if (typeof response === 'string') {
            if (this.containsSubstitution(response)) {
                return this.substitute(response, data)
            } else {
                return response
            }
        } else {
            return response
        }
    }
}

module.exports = OperationProcessor