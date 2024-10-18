const { GetCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb'),
    { TransactWriteItemsCommand, TransactionCanceledException } = require('@aws-sdk/client-dynamodb'),
    { InternalProcessingError, InvalidOperationError, InvalidRequestError, InvalidTypeError } = require('../errors')

const types = {
    'type': {
        '1.0.0': {
            keyPropertyA: 'type',
            keyPropertyB: 'version'
        }
    }
}

class DynamoAdaptor {
    constructor({ dynamoDBClient, dataTableName, logger }) {
        this.dynamoDBClient = dynamoDBClient
        this.dataTableName = dataTableName
        this.dynamoDBDocumentClient = this.createDocumentClient(dynamoDBClient)
        this.logger = logger || console
    }

    createDocumentClient(dynamoDBClient) {
        return DynamoDBDocumentClient.from(dynamoDBClient)
    }

    buildKey(type, version, keyPropertyA, keyPropertyB, keyPropertyC) {
        return {
            hKey: `${type}:${version}:${keyPropertyA}:archived=false`,
            rKey: `${(keyPropertyB) ? keyPropertyB : ''}:${(keyPropertyC) ? keyPropertyC : ''}`
        }
    }

    async get({ type, version, key }) {
        try {
            const { keyProperties: { keyPropertyA, keyPropertyB, keyPropertyC } } = await this.getType(type, version)
            const command = new GetCommand({
                TableName: this.dataTableName,
                Key: this.buildKey(type, version, key[keyPropertyA], keyPropertyB ? key[keyPropertyB] : '', keyPropertyC ? keyPropertyC : '')
            })
            const response = await this.dynamoDBDocumentClient.send(command)
            return (response.Item) ? JSON.parse(response.Item.data) : undefined
        } catch (err) {
            throw new InternalProcessingError(err)
        }
    }

    async batchWrite(items) {
        if (items.length === 0) {
            return {}
        }

        const transactItems = []
        const errors = []
        for (let { op, type, version, data } of items) {
            const { keyProperties: { keyPropertyA, keyPropertyB, keyPropertyC } } = await this.getType(type, version)
            const { hKey, rKey } = this.buildKey(type, version, data[keyPropertyA], keyPropertyB ? data[keyPropertyB] : undefined, keyPropertyC ? data[keyPropertyC] : undefined)
            if (op === 'create') {
                transactItems.push({
                    Put: {
                        TableName: this.dataTableName,
                        ConditionExpression: `attribute_not_exists(hKey) AND attribute_not_exists(rKey)`,
                        Item: {
                            hKey: { S: hKey },
                            rKey: { S: rKey },
                            data: { S: JSON.stringify(data) }
                        }
                    }
                })
            } else if (op === 'update') {
                transactItems.push({
                    Update: {
                        TableName: this.dataTableName,
                        ConditionExpression: `attribute_exists(hKey) AND attribute_exists(rKey)`,
                        Key: {
                            hKey: { S: hKey },
                            rKey: { S: rKey }
                        },
                        UpdateExpression: `SET #data = :data`,
                        ExpressionAttributeNames: {
                            '#data': 'data'
                        },
                        ExpressionAttributeValues: {
                            ':data': { S: JSON.stringify(data) }
                        }
                    }
                })
            } else {
                errors.push(new InvalidOperationError(`'${op}' is not a valid operation`))
            }
        }

        const command = new TransactWriteItemsCommand({ TransactItems: transactItems })

        if (errors.length > 0) {
            throw errors[0]
        }
        try {
            return await this.dynamoDBClient.send(command)
        } catch (err) {
            this.logger.error(`dynamodb error ${JSON.stringify(err)} ${err.stack}`)
            if (err instanceof TransactionCanceledException) {
                const message = (err.CancellationReasons && err.CancellationReasons.length > 0) ? err.CancellationReasons[0].Code || 'unknown' : err.name
                throw new InvalidRequestError(message, err)
            } else {
                throw new InternalProcessingError(err)
            }
        }
    }

    async getType(type, version) {
        if (types[type] && types[type][version]) {
            return {
                keyProperties: types[type][version]
            }
        }

        const typeData = await this.get({
            'type': 'type',
            'version': '1.0.0',
            key: {
                type,
                version
            }
        })

        if (!typeData) {
            throw new InvalidTypeError(type, version)
        }

        return {
            keyProperties: typeData.keyProperties
        }
    }

    async createTypes(definitions) {
        const writeOperations = definitions.map((def) => {
            return {
                op: 'create',
                type: 'type',
                version: '1.0.0',
                data: {
                    type: def.type,
                    version: def.version,
                    keyProperties: def.keyProperties
                }
            }
        })

        return await this.batchWrite(writeOperations)
    }
}

module.exports = DynamoAdaptor