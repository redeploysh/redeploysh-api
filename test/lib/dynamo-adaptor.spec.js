const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    DynamoAdaptor = require('../../src/lib/dynamo-adaptor'),
    { GetCommand, BatchGetCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb'),
    { TransactWriteItemsCommand, DynamoDBClient } = require('@aws-sdk/client-dynamodb'),
    TypeRegistry = require('../../src/framework/type-registry'),
    { mockClient } = require('aws-sdk-client-mock'),
    { createSandbox } = require('sinon')

chai.should()
chai.use(chaiAsPromised)

const sinon = createSandbox()

describe('DynamoAdaptor tests', function() {

    describe('#constructor', function() {
        it('should construct the instance', function() {
            const dynamoAdaptor = new DynamoAdaptor({ dynamoDBClient: new DynamoDBClient({}) })
            return dynamoAdaptor.should.be.an.instanceOf(DynamoAdaptor)
        })
    })

    describe('#createDocumentClient', function() {
        it('should create the document client', function() {
            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.createDocumentClient.callThrough()
            return dynamoAdaptor.createDocumentClient(new DynamoDBClient({})).should.be.an.instanceOf(DynamoDBDocumentClient)
        })
    })

    describe('#get', function() {
        it('should call the dynamodb client with the get command for one key property', function() {
            const dynamoDocClient = mockClient(DynamoDBDocumentClient)
            dynamoDocClient.on(GetCommand, {
                TableName: 'data-table',
                Key: {
                    type: 'test-type',
                    version: 'test-version',
                    keyPropertyA: 'some-value',
                    keyPropertyB: '',
                    keyPropertyC: '',
                    archived: 'false'
                }
            }).resolves({
                Item: {
                    data: JSON.stringify({
                        'some-propA': 'some-value',
                        'some-propB': 'some-other-value',
                        'some-propC': 'some-third-value'
                    })
                }
            })

            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.typeRegistry = sinon.createStubInstance(TypeRegistry)
            dynamoAdaptor.typeRegistry.getType.withArgs('test-type-one-key', 'test-version').returns({
                type: 'test-type',
                version: 'test-version',
                keyPropertyA: 'some-propA',
                keyPropertyB: undefined,
                keyPropertyC: undefined
            })
            dynamoAdaptor.dataTableName = 'data-table'
            dynamoAdaptor.dynamoDBDocumentClient = dynamoDocClient
            dynamoAdaptor.get.callThrough()

            return dynamoAdaptor.get('test-type-one-key', 'test-version', {
                'some-propA': 'some-value'
            }).should.eventually.be.deep.eql({
                'some-propA': 'some-value',
                'some-propB': 'some-other-value',
                'some-propC': 'some-third-value'
            })
        })

        it('should call the dynamodb client with the get command for two key properties', function() {
            const dynamoDocClient = mockClient(DynamoDBDocumentClient)
            dynamoDocClient.on(GetCommand, {
                TableName: 'data-table',
                Key: {
                    type: 'test-type',
                    version: 'test-version',
                    keyPropertyA: 'some-value',
                    keyPropertyB: 'some-other-value',
                    keyPropertyC: '',
                    archived: 'false'
                }
            }).resolves({
                Item: {
                    data: JSON.stringify({
                        'some-propA': 'some-value',
                        'some-propB': 'some-other-value',
                        'some-propC': 'some-third-value'
                    })
                }
            })

            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.typeRegistry = sinon.createStubInstance(TypeRegistry)
            dynamoAdaptor.typeRegistry.getType.withArgs('test-type', 'test-version').returns({
                type: 'test-type',
                version: 'test-version',
                keyPropertyA: 'some-propA',
                keyPropertyB: 'some-propB',
                keyPropertyC: undefined
            })
            dynamoAdaptor.dataTableName = 'data-table'
            dynamoAdaptor.dynamoDBDocumentClient = dynamoDocClient
            dynamoAdaptor.get.callThrough()

            return dynamoAdaptor.get('test-type', 'test-version', {
                'some-propA': 'some-value',
                'some-propB': 'some-other-value'
            }).should.eventually.be.deep.eql({
                'some-propA': 'some-value',
                'some-propB': 'some-other-value',
                'some-propC': 'some-third-value'
            })
        })

        it('should call the dynamodb client with the get command for three key properties', function() {
            const dynamoDocClient = mockClient(DynamoDBDocumentClient)
            dynamoDocClient.on(GetCommand, {
                TableName: 'data-table',
                Key: {
                    type: 'test-type',
                    version: 'test-version',
                    keyPropertyA: 'some-value',
                    keyPropertyB: 'some-other-valueB',
                    keyPropertyC: 'some-other-valueC',
                    archived: 'false'
                }
            }).resolves({
                Item: {
                    data: JSON.stringify({
                        'some-propA': 'some-value',
                        'some-propB': 'some-other-valueB',
                        'some-propC': 'some-other-valueC'
                    })
                }
            })

            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.typeRegistry = sinon.createStubInstance(TypeRegistry)
            dynamoAdaptor.typeRegistry.getType.withArgs('test-type', 'test-version').returns({
                type: 'test-type',
                version: 'test-version',
                keyPropertyA: 'some-propA',
                keyPropertyB: 'some-propB',
                keyPropertyC: 'some-propC'
            })
            dynamoAdaptor.dataTableName = 'data-table'
            dynamoAdaptor.dynamoDBDocumentClient = dynamoDocClient
            dynamoAdaptor.get.callThrough()

            return dynamoAdaptor.get('test-type', 'test-version', {
                'some-propA': 'some-value',
                'some-propB': 'some-other-valueB',
                'some-propC': 'some-other-valueC'
            }).should.eventually.be.deep.eql({
                'some-propA': 'some-value',
                'some-propB': 'some-other-valueB',
                'some-propC': 'some-other-valueC'
            })
        })

    })

    describe('#batchRead', function() {
        it('should get the items', function() {
            const dynamoDocClient = mockClient(DynamoDBDocumentClient)
            dynamoDocClient.on(BatchGetCommand, {
                RequestItems: {
                    'data-table': {
                        Keys: [
                            {
                                type: 'test-type-one-key',
                                version: 'test-version',
                                keyPropertyA: 'test-valueA',
                                keyPropertyB: '',
                                keyPropertyC: '',
                                archived: 'false'
                            },
                            {
                                type: 'test-type',
                                version: 'test-version',
                                keyPropertyA: 'test-valueA2',
                                keyPropertyB: 'test-valueB2',
                                keyPropertyC: '',
                                archived: 'false'
                            },
                            {
                                type: 'test-type-three-keys',
                                version: 'test-version',
                                keyPropertyA: 'test-valueA3',
                                keyPropertyB: 'test-valueB3',
                                keyPropertyC: 'test-valueC3',
                                archived: 'false'
                            }
                        ]
                    }
                }
            }).resolves({
                Responses: {
                    'data-table': {
                        Items: [
                            {
                                data: JSON.stringify({
                                    'some-propA': 'test-valueA'
                                })
                            },
                            {
                                data: JSON.stringify({
                                    'some-propA': 'test-valueA2',
                                    'some-propB': 'test-valueB2'
                                })
                            },
                            {
                                data: JSON.stringify({
                                    'some-propA': 'test-valueA3',
                                    'some-propB': 'test-valueB3',
                                    'some-propC': 'test-valueC3'
                                })
                            }
                        ]
                    }
                }
            })

            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.typeRegistry = sinon.createStubInstance(TypeRegistry)
            dynamoAdaptor.typeRegistry.getType.withArgs('test-type-one-key', 'test-version').returns({
                type: 'test-type',
                version: 'test-version',
                keyPropertyA: 'some-propA',
                keyPropertyB: undefined,
                keyPropertyC: undefined
            })
            dynamoAdaptor.typeRegistry.getType.withArgs('test-type', 'test-version').returns({
                type: 'test-type',
                version: 'test-version',
                keyPropertyA: 'some-propA',
                keyPropertyB: 'some-propB',
                keyPropertyC: undefined
            })
            dynamoAdaptor.typeRegistry.getType.withArgs('test-type-three-keys', 'test-version').returns({
                type: 'test-type',
                version: 'test-version',
                keyPropertyA: 'some-propA',
                keyPropertyB: 'some-propB',
                keyPropertyC: 'some-propC'
            })

            dynamoAdaptor.dataTableName = 'data-table'
            dynamoAdaptor.dynamoDBDocumentClient = dynamoDocClient
            dynamoAdaptor.batchRead.callThrough()

            return dynamoAdaptor.batchRead([
                {
                    type: 'test-type-one-key',
                    version: 'test-version',
                    key: {
                        'some-propA': 'test-valueA'
                    }
                },
                {
                    type: 'test-type',
                    version: 'test-version',
                    key: {
                        'some-propA': 'test-valueA2',
                        'some-propB': 'test-valueB2'
                    }
                },
                {
                    type: 'test-type-three-keys',
                    version: 'test-version',
                    key: {
                        'some-propA': 'test-valueA3',
                        'some-propB': 'test-valueB3',
                        'some-propC': 'test-valueC3'
                    }
                }
            ]).should.eventually.be.deep.eql([
                {
                    'some-propA': 'test-valueA'
                },
                {
                    'some-propA': 'test-valueA2',
                    'some-propB': 'test-valueB2'
                },
                {
                    'some-propA': 'test-valueA3',
                    'some-propB': 'test-valueB3',
                    'some-propC': 'test-valueC3'
                }
            ])
        })
    })

    describe('#batchWrite', function() {
        it('should throw if unsupported operation in batch', function() {
            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.typeRegistry = sinon.createStubInstance(TypeRegistry)
            dynamoAdaptor.typeRegistry.getType.withArgs('test-type-one-key', 'test-version').returns({
                type: 'test-type',
                version: 'test-version',
                keyPropertyA: 'some-propA',
                keyPropertyB: undefined,
                keyPropertyC: undefined
            })
            dynamoAdaptor.batchWrite.callThrough()

            return chai.expect(() => dynamoAdaptor.batchWrite([
                {
                    op: 'some-other'
                }
            ])).to.throw('Unsupported operation')
        })

        it('should write the batch of items', function() {
            const dynamoDocClient = mockClient(DynamoDBDocumentClient)
            dynamoDocClient.on(TransactWriteItemsCommand, {
                TransactItems: [
                    {
                        "Put": {
                            "TableName": "data-table",
                            "Item": {
                                "type": "test-type",
                                "version": "test-version",
                                "keyPropertyA": "test-valueA",
                                "keyPropertyB": "test-valueB",
                                "keyPropertyC": "",
                                "data": "{\"some-propA\":\"test-valueA\",\"some-propB\":\"test-valueB\"}",
                                "archived": "false"
                            }
                        }
                    },
                    {
                        "Put": {
                            "TableName": "data-table",
                            "Item": {
                                "type": "test-type-one-key",
                                "version": "test-version",
                                "keyPropertyA": "test-valueA",
                                "keyPropertyB": "",
                                "keyPropertyC": "",
                                "data": "{\"some-propA\":\"test-valueA\"}",
                                "archived": "false"
                            }
                        }
                    },
                    {
                        "Put": {
                            "TableName": "data-table",
                            "Item": {
                                "type": "test-type-three-keys",
                                "version": "test-version",
                                "keyPropertyA": "test-valueA",
                                "keyPropertyB": "test-valueB",
                                "keyPropertyC": "test-valueC",
                                "data": "{\"some-propA\":\"test-valueA\",\"some-propB\":\"test-valueB\",\"some-propC\":\"test-valueC\"}",
                                "archived": "false"
                            }
                        }
                    },
                    {
                        "Update": {
                            "TableName": "data-table",
                            "Key": {
                                "type": "test-type-one-key",
                                "version": "test-version",
                                "keyPropertyA": "test-valueA",
                                "keyPropertyB": "",
                                "keyPropertyC": "",
                                "archived": "false"
                            },
                            "UpdateExpression": "SET #keyPropertyA = :keyValueA, #keyPropertyB = :keyValueB, #keyPropertyC = :keyValueC, #data = :data",
                            "ExpressionAttributeNames": {
                                "#keyPropertyA": "keyPropertyA",
                                "#keyPropertyB": "keyPropertyB",
                                "#keyPropertyC": "keyPropertyC",
                                "#data": "data"
                            },
                            "ExpressionAttributeValues": {
                                ":keyValueA": "test-valueA",
                                ":keyValueB": "",
                                ":keyValueC": "",
                                ":data": "{\"some-propA\":\"test-valueA\"}"
                            }
                        }
                    },
                    {
                        "Update": {
                            "TableName": "data-table",
                            "Key": {
                                "type": "test-type",
                                "version": "test-version",
                                "keyPropertyA": "test-valueA",
                                "keyPropertyB": "test-valueB",
                                "keyPropertyC": "",
                                "archived": "false"
                            },
                            "UpdateExpression": "SET #keyPropertyA = :keyValueA, #keyPropertyB = :keyValueB, #keyPropertyC = :keyValueC, #data = :data",
                            "ExpressionAttributeNames": {
                                "#keyPropertyA": "keyPropertyA",
                                "#keyPropertyB": "keyPropertyB",
                                "#keyPropertyC": "keyPropertyC",
                                "#data": "data"
                            },
                            "ExpressionAttributeValues": {
                                ":keyValueA": "test-valueA",
                                ":keyValueB": "test-valueB",
                                ":keyValueC": "",
                                ":data": "{\"some-propA\":\"test-valueA\",\"some-propB\":\"test-valueB\"}"
                            }
                        }
                    }
                    , {
                        "Update": {
                            "TableName": "data-table",
                            "Key": {
                                "type": "test-type-three-keys",
                                "version": "test-version",
                                "keyPropertyA": "test-valueA",
                                "keyPropertyB": "test-valueB",
                                "keyPropertyC": "test-valueC",
                                "archived": "false"
                            },
                            "UpdateExpression": "SET #keyPropertyA = :keyValueA, #keyPropertyB = :keyValueB, #keyPropertyC = :keyValueC, #data = :data",
                            "ExpressionAttributeNames": {
                                "#keyPropertyA": "keyPropertyA",
                                "#keyPropertyB": "keyPropertyB",
                                "#keyPropertyC": "keyPropertyC",
                                "#data": "data"
                            },
                            "ExpressionAttributeValues": {
                                ":keyValueA": "test-valueA",
                                ":keyValueB": "test-valueB",
                                ":keyValueC": "test-valueC",
                                ":data": "{\"some-propA\":\"test-valueA\",\"some-propB\":\"test-valueB\",\"some-propC\":\"test-valueC\"}"
                            }
                        }
                    },
                    {
                        "Update": {
                            "TableName": "data-table",
                            "Key": {
                                "type": "test-type-one-key",
                                "version": "test-version",
                                "keyPropertyA": "archive-valueA",
                                "keyPropertyB": "",
                                "keyPropertyC": "",
                                "archived": "false"
                            },
                            "UpdateExpression": "SET #archived = :archived",
                            "ExpressionAttributeNames": {
                                "#archived": "archived"
                            },
                            "ExpressionAttributeValues": {
                                ":archived": "true"
                            }
                        }
                    },
                    {
                        "Update": {
                            "TableName": "data-table",
                            "Key": {
                                "type": "test-type",
                                "version": "test-version",
                                "keyPropertyA": "archive-valueA",
                                "keyPropertyB": "archive-valueB",
                                "keyPropertyC": "",
                                "archived": "false"
                            },
                            "UpdateExpression": "SET #archived = :archived",
                            "ExpressionAttributeNames": {
                                "#archived": "archived"
                            },
                            "ExpressionAttributeValues": {
                                ":archived": "true"
                            }
                        }
                    },
                    {
                        "Update": {
                            "TableName": "data-table",
                            "Key": {
                                "type": "test-type-three-keys",
                                "version": "test-version",
                                "keyPropertyA": "archive-valueA",
                                "keyPropertyB": "archive-valueB",
                                "keyPropertyC": "archive-valueC",
                                "archived": "false"
                            },
                            "UpdateExpression": "SET #archived = :archived",
                            "ExpressionAttributeNames": {
                                "#archived": "archived"
                            },
                            "ExpressionAttributeValues": {
                                ":archived": "true"
                            }
                        }
                    }
                ]
            }).resolves({})

            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.typeRegistry = sinon.createStubInstance(TypeRegistry)
            dynamoAdaptor.typeRegistry.getType.withArgs('test-type-one-key', 'test-version').returns({
                type: 'test-type',
                version: 'test-version',
                keyPropertyA: 'some-propA',
                keyPropertyB: undefined,
                keyPropertyC: undefined
            })
            dynamoAdaptor.typeRegistry.getType.withArgs('test-type', 'test-version').returns({
                type: 'test-type',
                version: 'test-version',
                keyPropertyA: 'some-propA',
                keyPropertyB: 'some-propB',
                keyPropertyC: undefined
            })
            dynamoAdaptor.typeRegistry.getType.withArgs('test-type-three-keys', 'test-version').returns({
                type: 'test-type',
                version: 'test-version',
                keyPropertyA: 'some-propA',
                keyPropertyB: 'some-propB',
                keyPropertyC: 'some-propC'
            })
            dynamoAdaptor.dataTableName = 'data-table'
            dynamoAdaptor.dynamoDBDocumentClient = dynamoDocClient
            dynamoAdaptor.batchWrite.callThrough()

            return dynamoAdaptor.batchWrite([
                {
                    op: 'create',
                    type: 'test-type',
                    version: 'test-version',
                    data: {
                        'some-propA': 'test-valueA',
                        'some-propB': 'test-valueB'
                    }
                },
                {
                    op: 'create',
                    type: 'test-type-one-key',
                    version: 'test-version',
                    data: {
                        'some-propA': 'test-valueA'
                    }
                },
                {
                    op: 'create',
                    type: 'test-type-three-keys',
                    version: 'test-version',
                    data: {
                        'some-propA': 'test-valueA',
                        'some-propB': 'test-valueB',
                        'some-propC': 'test-valueC'
                    }
                }
                ,
                {
                    op: 'update',
                    type: 'test-type-one-key',
                    version: 'test-version',
                    data: {
                        'some-propA': 'test-valueA'
                    }
                },
                {
                    op: 'update',
                    type: 'test-type',
                    version: 'test-version',
                    data: {
                        'some-propA': 'test-valueA',
                        'some-propB': 'test-valueB'
                    }
                },
                {
                    op: 'update',
                    type: 'test-type-three-keys',
                    version: 'test-version',
                    data: {
                        'some-propA': 'test-valueA',
                        'some-propB': 'test-valueB',
                        'some-propC': 'test-valueC'
                    }
                },
                {
                    op: 'archive',
                    type: 'test-type-one-key',
                    version: 'test-version',
                    data: {
                        'some-propA': 'archive-valueA'
                    }
                },
                {
                    op: 'archive',
                    type: 'test-type',
                    version: 'test-version',
                    data: {
                        'some-propA': 'archive-valueA',
                        'some-propB': 'archive-valueB'
                    }
                },
                {
                    op: 'archive',
                    type: 'test-type-three-keys',
                    version: 'test-version',
                    data: {
                        'some-propA': 'archive-valueA',
                        'some-propB': 'archive-valueB',
                        'some-propC': 'archive-valueC'
                    }
                }
            ]).should.eventually.be.eql({})
        })
    })
})
