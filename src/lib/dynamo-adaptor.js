const { GetCommand, TransactWriteCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb'),
    { InternalProcessingError, InvalidOperationError } = require('../errors')

class DynamoAdaptor {
    constructor({ typeRegistry, dynamoDBClient, dataTableName }) {
        this.typeRegistry = typeRegistry
        this.dynamoDBClient = dynamoDBClient
        this.dataTableName = dataTableName
        this.dynamoDBDocumentClient = this.createDocumentClient(dynamoDBClient)
    }

    createDocumentClient(dynamoDBClient) {
        return DynamoDBDocumentClient.from(dynamoDBClient)
    }

    async get({ type, version, key }) {
        try {
            const typeMetadata = this.typeRegistry.getType(type, version)
            const command = new GetCommand({
                TableName: this.dataTableName,
                Key: {
                    hKey: `${type}:${version}:${key[typeMetadata.keyPropertyA]}:archived=false`,
                    rKey: `${(typeMetadata.keyPropertyB) ? key[typeMetadata.keyPropertyB] : ''}:${(typeMetadata.keyPropertyC) ? key[typeMetadata.keyPropertyC] : ''}`
                },

            })
            const response = await this.dynamoDBDocumentClient.send(command)
            return JSON.parse(response.Item.data)
        } catch (err) {
            throw new InternalProcessingError(err)
        }
    }

    async batchWrite(items) {
        const errors = []
        const command = new TransactWriteCommand({
            TransactItems: items.map(({ op, type, version, data }) => {
                const typeMetadata = this.typeRegistry.getType(type, version)
                if (op === 'create') {
                    return {
                        Put: {
                            TableName: this.dataTableName,
                            Item: {
                                hKey: `${type}:${version}:${data[typeMetadata.keyPropertyA]}:archived=false`,
                                rKey: `${(typeMetadata.keyPropertyB) ? data[typeMetadata.keyPropertyB] : ''}:${(typeMetadata.keyPropertyC) ? data[typeMetadata.keyPropertyC] : ''}`,
                                data: JSON.stringify(data)
                            }
                        }
                    }
                } else if (op === 'update') {
                    return {
                        Update: {
                            TableName: this.dataTableName,
                            Key: {
                                hKey: `${type}:${version}:${data[typeMetadata.keyPropertyA]}:archived=false`,
                                rKey: `${(typeMetadata.keyPropertyB) ? data[typeMetadata.keyPropertyB] : ''}:${(typeMetadata.keyPropertyC) ? data[typeMetadata.keyPropertyC] : ''}`
                            },
                            UpdateExpression: `SET #data = :data`,
                            ExpressionAttributeNames: {
                                '#data': 'data'
                            },
                            ExpressionAttributeValues: {
                                ':data': JSON.stringify(data)
                            }
                        }
                    }
                } else {
                    errors.push(new InvalidOperationError(`'${op}' is not a valid operation`))
                }
            })
        })
        if (errors.length > 0) {
            throw errors[0]
        }
        return await this.dynamoDBDocumentClient.send(command)
    }
}

module.exports = DynamoAdaptor