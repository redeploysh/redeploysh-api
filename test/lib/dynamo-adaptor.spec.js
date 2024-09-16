const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    DynamoAdaptor = require('../../src/lib/dynamo-adaptor'),
    { GetCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb'),
    { TransactWriteItemsCommand, DynamoDBClient } = require('@aws-sdk/client-dynamodb'),
    TypeRegistry = require('../../src/lib/type-registry'),
    { mockClient } = require('aws-sdk-client-mock'),
    { createSandbox } = require('sinon'),
    { InvalidOperationError, InternalProcessingError } = require('../../src/errors')

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
                    hKey: 'test-type:test-version:some-value:archived=false',
                    rKey: ':'
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

            return dynamoAdaptor.get({
                type: 'test-type-one-key',
                version: 'test-version',
                key: {
                    'some-propA': 'some-value'
                }
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
                    hKey: 'test-type:test-version:some-value:archived=false',
                    rKey: 'some-other-value:'
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

            return dynamoAdaptor.get({
                type: 'test-type',
                version: 'test-version',
                key: {
                    'some-propA': 'some-value',
                    'some-propB': 'some-other-value'
                }
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
                    hKey: 'test-type:test-version:some-value:archived=false',
                    rKey: 'some-other-valueB:some-other-valueC'
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

            return dynamoAdaptor.get({
                type: 'test-type',
                version: 'test-version',
                key: {
                    'some-propA': 'some-value',
                    'some-propB': 'some-other-valueB',
                    'some-propC': 'some-other-valueC'
                }
            }).should.eventually.be.deep.eql({
                'some-propA': 'some-value',
                'some-propB': 'some-other-valueB',
                'some-propC': 'some-other-valueC'
            })
        })

        it('should throw an error if dynamo errors', async function() {
            const dynamoDocClient = mockClient(DynamoDBDocumentClient)
            dynamoDocClient.on(GetCommand, {
                TableName: 'data-table',
                Key: {
                    hKey: 'test-type:test-version:some-value:archived=false',
                    rKey: ':'
                }
            }).rejects(new Error('some-message'))

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
            try {
                await dynamoAdaptor.get({
                    type: 'user',
                    version: '1.0.0',
                    key: {
                        key: 'value'
                    }
                })
                return chai.expect.fail(`should have thrown`)
            } catch (err) {
                return err.should.be.instanceOf(InternalProcessingError)
            }
        })
    })

    describe('#batchWrite', function() {
        it('should throw if unsupported operation in batch', async function() {
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

            try {
                await dynamoAdaptor.batchWrite([
                    {
                        op: 'some-other'
                    }
                ])
                return chai.expect.fail(`should have thrown`)
            } catch (err) {
                return err.should.be.instanceOf(InvalidOperationError)
            }
        })

        it('should do a put if a create op is in the items', async function() {
            const dynamoDocClient = mockClient(DynamoDBDocumentClient)
            dynamoDocClient.on(TransactWriteItemsCommand, {
                TransactItems: [
                    {
                        "Put": {
                            "TableName": "data-table",
                            "Item": {
                                "hKey": "test-type:test-version:test-valueA:archived=false",
                                "rKey": "test-valueB:",
                                "data": "{\"some-propA\":\"test-valueA\",\"some-propB\":\"test-valueB\"}"
                            }
                        }
                    },
                    {
                        "Put": {
                            "TableName": "data-table",
                            "Item": {
                                "hKey": "test-type-one-key:test-version:test-valueA:archived=false",
                                "rKey": ":",
                                "data": "{\"some-propA\":\"test-valueA\"}"
                            }
                        }
                    },
                    {
                        "Put": {
                            "TableName": "data-table",
                            "Item": {
                                "hKey": "test-type-three-keys:test-version:test-valueA:archived=false",
                                "rKey": "test-valueB:test-valueC",
                                "data": "{\"some-propA\":\"test-valueA\",\"some-propB\":\"test-valueB\",\"some-propC\":\"test-valueC\"}"
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

            try {
                await dynamoAdaptor.batchWrite([
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
                ])
                return chai.expect(true).to.be.true
            } catch (err) {
                chai.expect.fail(`should not have thrown ${err}`)
            }
        })

        it('should do an update if an update op is in the items', async function() {
            const dynamoDocClient = mockClient(DynamoDBDocumentClient)
            dynamoDocClient.on(TransactWriteItemsCommand, {
                TransactItems: [
                    {
                        "Update": {
                            "TableName": "data-table",
                            "Key": {
                                "hKey": "test-type-one-key:test-version:test-valueA:archived=false",
                                "rKey": ":"
                            },
                            "UpdateExpression": 'SET #data = :data',
                            "ExpressionAttributeNames": {
                                '#data': 'data'
                            },
                            "ExpressionAttributeValues": {
                                ":data": "{\"some-propA\":\"test-valueA\"}"
                            }
                        }
                    },
                    {
                        "Update": {
                            "TableName": "data-table",
                            "Key": {
                                "hKey": "test-type:test-version:test-valueA:archived=false",
                                "rKey": "test-valueB:"
                            },
                            "UpdateExpression": 'SET #data = :data',
                            "ExpressionAttributeNames": {
                                '#data': 'data'
                            },
                            "ExpressionAttributeValues": {
                                ":data": "{\"some-propA\":\"test-valueA\",\"some-propB\":\"test-valueB\"}"
                            }
                        }
                    },
                    {
                        "Update": {
                            "TableName": "data-table",
                            "Key": {
                                "hKey": "test-type-three-keys:test-version:test-valueA:archived=false",
                                "rKey": "test-valueB:test-valueC"
                            },
                            "UpdateExpression": 'SET #data = :data',
                            "ExpressionAttributeNames": {
                                '#data': 'data'
                            },
                            "ExpressionAttributeValues": {
                                ":data": "{\"some-propA\":\"test-valueA\",\"some-propB\":\"test-valueB\",\"some-propC\":\"test-valueC\"}"
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

            try {
                await dynamoAdaptor.batchWrite([
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
                    }
                ])
                chai.expect(true).to.be.true
            } catch (err) {
                chai.expect.fail(`should not have thrown ${err}`)
            }
        })

    })
})
