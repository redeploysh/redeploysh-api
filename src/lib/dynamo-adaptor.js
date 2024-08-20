const { GetCommand, BatchGetCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb'),
    { TransactWriteItemsCommand } = require('@aws-sdk/client-dynamodb')

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

    get(type, version, key) {
        const typeMetadata = this.typeRegistry.getType(type, version)
        const command = new GetCommand({
            TableName: this.dataTableName,
            Key: {
                type: typeMetadata.type,
                version: typeMetadata.version,
                keyPropertyA: key[typeMetadata.keyPropertyA],
                keyPropertyB: (typeMetadata.keyPropertyB) ? key[typeMetadata.keyPropertyB] : '',
                keyPropertyC: (typeMetadata.keyPropertyC) ? key[typeMetadata.keyPropertyC] : '',
                archived: 'false'
            }
        })
        return this.dynamoDBDocumentClient.send(command)
            .then(({ Item }) => JSON.parse(Item.data))
    }

    batchRead(items) {
        const keys = items.map(({ type, version, key }) => {
            const typeMetadata = this.typeRegistry.getType(type, version)
            return {
                type,
                version,
                keyPropertyA: key[typeMetadata.keyPropertyA],
                keyPropertyB: (typeMetadata.keyPropertyB) ? key[typeMetadata.keyPropertyB] : '',
                keyPropertyC: (typeMetadata.keyPropertyC) ? key[typeMetadata.keyPropertyC] : '',
                archived: 'false'
            }
        })

        const command = new BatchGetCommand({
            RequestItems: {
                [this.dataTableName]: {
                    Keys: keys
                }
            }
        })

        return this.dynamoDBDocumentClient.send(command)
            .then(({ Responses }) => {
                const { Items } = Responses[this.dataTableName]
                return Items.map(item => (JSON.parse(item.data)))
            })
    }

    batchWrite(items) {
        /*
            Item: {
                op := 'create'|'update'|'archive'
                type: <type id>
                version: <type version>
                data: <json record>
            }
        */
        const transactItems = []
        items.forEach((item) => {
            const typeMetadata = this.typeRegistry.getType(item.type, item.version)
            if (item.op === 'create') {
                transactItems.push({
                    Put: {
                        TableName: this.dataTableName,
                        Item: {
                            type: item.type,
                            version: item.version,
                            keyPropertyA: item.data[typeMetadata.keyPropertyA],
                            keyPropertyB: (typeMetadata.keyPropertyB) ? item.data[typeMetadata.keyPropertyB] : '',
                            keyPropertyC: (typeMetadata.keyPropertyC) ? item.data[typeMetadata.keyPropertyC] : '',
                            data: JSON.stringify(item.data),
                            archived: 'false'
                        }
                    }
                })
            } else if (item.op === 'update') {
                transactItems.push({
                    Update: {
                        TableName: this.dataTableName,
                        Key: {
                            type: item.type,
                            version: item.version,
                            keyPropertyA: item.data[typeMetadata.keyPropertyA],
                            keyPropertyB: (typeMetadata.keyPropertyB) ? item.data[typeMetadata.keyPropertyB] : '',
                            keyPropertyC: (typeMetadata.keyPropertyC) ? item.data[typeMetadata.keyPropertyC] : '',
                            archived: 'false'
                        },
                        UpdateExpression: `SET #keyPropertyA = :keyValueA, #keyPropertyB = :keyValueB, #keyPropertyC = :keyValueC, #data = :data`,
                        ExpressionAttributeNames: {
                            '#keyPropertyA': 'keyPropertyA',
                            '#keyPropertyB': 'keyPropertyB',
                            '#keyPropertyC': 'keyPropertyC',
                            '#data': 'data'
                        },
                        ExpressionAttributeValues: {
                            ':keyValueA': item.data[typeMetadata.keyPropertyA],
                            ':keyValueB': (typeMetadata.keyPropertyB) ? item.data[typeMetadata.keyPropertyB] : '',
                            ':keyValueC': (typeMetadata.keyPropertyC) ? item.data[typeMetadata.keyPropertyC] : '',
                            ':data': JSON.stringify(item.data)
                        }
                    }
                })
            } else if (item.op === 'archive') {
                transactItems.push({
                    Update: {
                        TableName: this.dataTableName,
                        Key: {
                            type: item.type,
                            version: item.version,
                            keyPropertyA: item.data[typeMetadata.keyPropertyA],
                            keyPropertyB: (typeMetadata.keyPropertyB) ? item.data[typeMetadata.keyPropertyB] : '',
                            keyPropertyC: (typeMetadata.keyPropertyC) ? item.data[typeMetadata.keyPropertyC] : '',
                            archived: 'false'
                        },
                        UpdateExpression: `SET #archived = :archived`,
                        ExpressionAttributeNames: {
                            '#archived': 'archived'
                        },
                        ExpressionAttributeValues: {
                            ':archived': 'true'
                        }
                    }
                })
            } else {
                throw new Error('Unsupported operation')
            }
        })

        const command = new TransactWriteItemsCommand({
            TransactItems: transactItems
        })

        return this.dynamoDBDocumentClient.send(command)
    }
}

module.exports = DynamoAdaptor