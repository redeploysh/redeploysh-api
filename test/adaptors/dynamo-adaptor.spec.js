const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    DynamoAdaptor = require('../../src/adaptors/dynamo-adaptor'),
    { GetCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb'),
    { TransactWriteItemsCommand, TransactionCanceledException, DynamoDBClient } = require('@aws-sdk/client-dynamodb'),
    TypeRegistry = require('../../src/adaptors/type-registry'),
    { mockClient } = require('aws-sdk-client-mock'),
    { createSandbox } = require('sinon'),
    { InvalidOperationError, InternalProcessingError, InvalidRequestError } = require('../../src/errors')

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
        it('should return undefined if not found', function() {
            const dynamoDocClient = mockClient(DynamoDBDocumentClient)
            dynamoDocClient.on(GetCommand, {
                TableName: 'data-table',
                Key: 'key'
            }).resolves({ })

            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.typeRegistry = sinon.createStubInstance(TypeRegistry)
            dynamoAdaptor.typeRegistry.getType.withArgs('test-type', 'test-version').resolves({
                keyProperties: {
                    keyPropertyA: 'some-propA'
                }
            })
            dynamoAdaptor.dataTableName = 'data-table'
            dynamoAdaptor.dynamoDBDocumentClient = dynamoDocClient
            dynamoAdaptor.get.callThrough()
            dynamoAdaptor.buildKey.withArgs('test-type', 'test-version', 'some-value').returns('key')

            return dynamoAdaptor.get({
                type: 'test-type',
                version: 'test-version',
                key: {
                    'some-propA': 'some-value'
                }
            }).should.eventually.be.deep.eql(undefined)
        })

        it('should call the dynamodb client with the get command for one key property', function() {
            const dynamoDocClient = mockClient(DynamoDBDocumentClient)
            dynamoDocClient.on(GetCommand, {
                TableName: 'data-table',
                Key: {
                    hKey: 'test-type:test-version:some-value:archived=false',
                    rKey: ':'
                }
            }
            ).resolves({
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
            dynamoAdaptor.typeRegistry.getType.withArgs('test-type', 'test-version').resolves({
                keyProperties: {
                    keyPropertyA: 'some-propA'
                }
            })
            dynamoAdaptor.dataTableName = 'data-table'
            dynamoAdaptor.dynamoDBDocumentClient = dynamoDocClient
            dynamoAdaptor.get.callThrough()
            dynamoAdaptor.buildKey.callThrough()

            return dynamoAdaptor.get({
                type: 'test-type',
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
            dynamoAdaptor.typeRegistry.getType.withArgs('test-type', 'test-version').resolves({
                keyProperties: {
                    keyPropertyA: 'some-propA',
                    keyPropertyB: 'some-propB'
                }
            })
            dynamoAdaptor.dataTableName = 'data-table'
            dynamoAdaptor.dynamoDBDocumentClient = dynamoDocClient
            dynamoAdaptor.get.callThrough()
            dynamoAdaptor.buildKey.callThrough()

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
                Key: 'key-values'
            }).resolves({
                Item: {
                    data: '{}'
                }
            })

            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.typeRegistry = sinon.createStubInstance(TypeRegistry)
            dynamoAdaptor.typeRegistry.getType.withArgs('test-type', 'test-version').resolves({
                keyProperties: {
                    keyPropertyA: 'some-propA',
                    keyPropertyB: 'some-propB',
                    keyPropertyC: 'some-propC'
                }
            })
            dynamoAdaptor.dataTableName = 'data-table'
            dynamoAdaptor.dynamoDBDocumentClient = dynamoDocClient
            dynamoAdaptor.buildKey.withArgs('test-type', 'test-version').returns('key-values')
            dynamoAdaptor.get.callThrough()

            return dynamoAdaptor.get({
                type: 'test-type',
                version: 'test-version',
                key: {
                    'some-propA': 'some-value',
                    'some-propB': 'some-other-valueB',
                    'some-propC': 'some-other-valueC'
                }
            }).should.eventually.be.deep.eql({})
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
                keyPropertyA: 'some-propA',
                keyPropertyB: 'some-propB',
                keyPropertyC: 'some-propC'
            })
            dynamoAdaptor.dataTableName = 'data-table'
            dynamoAdaptor.dynamoDBDocumentClient = dynamoDocClient
            dynamoAdaptor.get.callThrough()
            dynamoAdaptor.buildKey.callThrough()

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
            dynamoAdaptor.typeRegistry.getType.resolves({
                keyProperties: {
                    keyPropertyA: 'propA',
                    keyPropertyB: 'propB',
                    keyPropertyC: 'propC'
                }
            })
            dynamoAdaptor.batchWrite.callThrough()
            dynamoAdaptor.buildKey.callThrough()
            dynamoAdaptor.logger = console

            try {
                await dynamoAdaptor.batchWrite([
                    {
                        op: 'some-other',
                        data: {
                            propA: 'val1',
                            propB: 'val2',
                            propC: 'val3'
                        }
                    }
                ])
                return chai.expect.fail(`should have thrown`)
            } catch (err) {
                console.error(err)
                return err.should.be.instanceOf(InvalidOperationError)
            }
        })

        it('should throw if transaction cancelled', async function() {
            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.typeRegistry = sinon.createStubInstance(TypeRegistry)
            dynamoAdaptor.typeRegistry.getType.resolves({
                keyProperties: {
                    keyPropertyA: 'propA',
                    keyPropertyB: 'propB',
                    keyPropertyC: 'propC'
                }
            })
            dynamoAdaptor.batchWrite.callThrough()
            dynamoAdaptor.buildKey.callThrough()
            dynamoAdaptor.logger = console

            dynamoAdaptor.dynamoDBClient = sinon.createStubInstance(DynamoDBClient)
            const err = new TransactionCanceledException('message')
            err.CancellationReasons = [{ Code: 'some-code' }]
            dynamoAdaptor.dynamoDBClient.send.rejects(err)

            try {
                await dynamoAdaptor.batchWrite([
                    {
                        op: 'create',
                        type: 'type',
                        version: '1.0.0',
                        data: {
                            propA: 'val1',
                            propB: 'val2',
                            propC: 'val3'
                        }
                    }
                ])
                return chai.expect.fail(`should have thrown`)
            } catch (err) {
                console.error(err)
                return err.should.be.instanceOf(InvalidRequestError)
            }
        })

        it('should handle error if cancellation reasons empty', async function() {
            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.typeRegistry = sinon.createStubInstance(TypeRegistry)
            dynamoAdaptor.typeRegistry.getType.resolves({
                keyProperties: {
                    keyPropertyA: 'propA',
                    keyPropertyB: 'propB',
                    keyPropertyC: 'propC'
                }
            })
            dynamoAdaptor.batchWrite.callThrough()
            dynamoAdaptor.buildKey.callThrough()
            dynamoAdaptor.logger = console

            dynamoAdaptor.dynamoDBClient = sinon.createStubInstance(DynamoDBClient)
            const err = new TransactionCanceledException('message')
            err.CancellationReasons = []
            dynamoAdaptor.dynamoDBClient.send.rejects(err)

            try {
                await dynamoAdaptor.batchWrite([
                    {
                        op: 'create',
                        type: 'type',
                        version: '1.0.0',
                        data: {
                            propA: 'val1',
                            propB: 'val2',
                            propC: 'val3'
                        }
                    }
                ])
                return chai.expect.fail(`should have thrown`)
            } catch (err) {
                console.error(err)
                return err.should.be.instanceOf(InvalidRequestError)
            }
        })

        it('should handle error if cancellation reasons malformed', async function() {
            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.typeRegistry = sinon.createStubInstance(TypeRegistry)
            dynamoAdaptor.typeRegistry.getType.resolves({
                keyProperties: {
                    keyPropertyA: 'propA',
                    keyPropertyB: 'propB',
                    keyPropertyC: 'propC'
                }
            })
            dynamoAdaptor.batchWrite.callThrough()
            dynamoAdaptor.buildKey.callThrough()
            dynamoAdaptor.logger = console

            dynamoAdaptor.dynamoDBClient = sinon.createStubInstance(DynamoDBClient)
            const err = new TransactionCanceledException('message')
            err.CancellationReasons = [{}]
            dynamoAdaptor.dynamoDBClient.send.rejects(err)

            try {
                await dynamoAdaptor.batchWrite([
                    {
                        op: 'create',
                        type: 'type',
                        version: '1.0.0',
                        data: {
                            propA: 'val1',
                            propB: 'val2',
                            propC: 'val3'
                        }
                    }
                ])
                return chai.expect.fail(`should have thrown`)
            } catch (err) {
                console.error(err)
                return err.should.be.instanceOf(InvalidRequestError)
            }
        })

        it('should handle error if cancellation reasons missing', async function() {
            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.typeRegistry = sinon.createStubInstance(TypeRegistry)
            dynamoAdaptor.typeRegistry.getType.resolves({
                keyProperties: {
                    keyPropertyA: 'propA',
                    keyPropertyB: 'propB',
                    keyPropertyC: 'propC'
                }
            })
            dynamoAdaptor.batchWrite.callThrough()
            dynamoAdaptor.buildKey.callThrough()
            dynamoAdaptor.logger = console

            dynamoAdaptor.dynamoDBClient = sinon.createStubInstance(DynamoDBClient)
            dynamoAdaptor.dynamoDBClient.send.rejects(new TransactionCanceledException('message'))

            try {
                await dynamoAdaptor.batchWrite([
                    {
                        op: 'create',
                        type: 'type',
                        version: '1.0.0',
                        data: {
                            propA: 'val1',
                            propB: 'val2',
                            propC: 'val3'
                        }
                    }
                ])
                return chai.expect.fail(`should have thrown`)
            } catch (err) {
                console.error(err)
                return err.should.be.instanceOf(InvalidRequestError)
            }
        })


        it('should throw if error', async function() {
            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.typeRegistry = sinon.createStubInstance(TypeRegistry)
            dynamoAdaptor.typeRegistry.getType.resolves({
                keyProperties: {
                    keyPropertyA: 'propA',
                    keyPropertyB: 'propB',
                    keyPropertyC: 'propC'
                }
            })
            dynamoAdaptor.batchWrite.callThrough()
            dynamoAdaptor.buildKey.callThrough()
            dynamoAdaptor.logger = console

            dynamoAdaptor.dynamoDBClient = sinon.createStubInstance(DynamoDBClient)
            const err = new Error('message')
            dynamoAdaptor.dynamoDBClient.send.rejects(err)

            try {
                await dynamoAdaptor.batchWrite([
                    {
                        op: 'create',
                        type: 'type',
                        version: '1.0.0',
                        data: {
                            propA: 'val1',
                            propB: 'val2',
                            propC: 'val3'
                        }
                    }
                ])
                return chai.expect.fail(`should have thrown`)
            } catch (err) {
                console.error(err)
                return err.should.be.instanceOf(InternalProcessingError)
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
                                "hKey": "hKey",
                                "rKey": "rKey",
                                "data": "{\"some-propA\":\"test-valueA\",\"some-propB\":\"test-valueB\"}"
                            }
                        }
                    },
                    {
                        "Put": {
                            "TableName": "data-table",
                            "Item": {
                                "hKey": "hKey",
                                "rKey": "rKey",
                                "data": "{\"some-propA\":\"test-valueA\"}"
                            }
                        }
                    },
                    {
                        "Put": {
                            "TableName": "data-table",
                            "Item": {
                                "hKey": "hKey",
                                "rKey": "rKey",
                                "data": "{\"some-propA\":\"test-valueA\",\"some-propB\":\"test-valueB\",\"some-propC\":\"test-valueC\"}"
                            }
                        }
                    }
                ]
            }).resolves({})

            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.buildKey.returns({
                hKey: 'hKey',
                rKey: 'rKey'
            })
            dynamoAdaptor.typeRegistry = sinon.createStubInstance(TypeRegistry)
            dynamoAdaptor.typeRegistry.getType.withArgs('test-type-one-key', 'test-version').resolves({
                keyProperties: {
                    keyPropertyA: 'some-propA'
                }
            })
            dynamoAdaptor.typeRegistry.getType.withArgs('test-type', 'test-version').resolves({
                keyProperties: {
                    keyPropertyA: 'some-propA',
                    keyPropertyB: 'some-propB'
                }
            })
            dynamoAdaptor.typeRegistry.getType.withArgs('test-type-three-keys', 'test-version').resolves({
                keyProperties: {
                    keyPropertyA: 'some-propA',
                    keyPropertyB: 'some-propB',
                    keyPropertyC: 'some-propC'
                }
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
            ]).should.eventually.not.be.rejected
        })

        it('should do an update if an update op is in the items', async function() {
            const dynamoDocClient = mockClient(DynamoDBDocumentClient)
            dynamoDocClient.on(TransactWriteItemsCommand, {
                TransactItems: [
                    {
                        "Update": {
                            "TableName": "data-table",
                            "Key": {
                                hKey: 'hKey',
                                rKey: 'rKey'
                            },
                            UpdateExpression: `SET #data = :data`,
                            ExpressionAttributeNames: {
                                '#data': 'data'
                            },
                            ExpressionAttributeValues: {
                                ':data': '{}'
                            }
                        }
                    }
                ]
            }).resolves({})

            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.buildKey.returns({
                hKey: 'hKey',
                rKey: 'rKey'
            })
            dynamoAdaptor.typeRegistry = sinon.createStubInstance(TypeRegistry)
            dynamoAdaptor.typeRegistry.getType.withArgs('test-type', 'test-version').resolves({
                keyProperties: {
                    keyPropertyA: 'some-propA'
                }
            })
            dynamoAdaptor.dataTableName = 'data-table'
            dynamoAdaptor.dynamoDBDocumentClient = dynamoDocClient
            dynamoAdaptor.batchWrite.callThrough()

            return dynamoAdaptor.batchWrite([
                {
                    op: 'update',
                    type: 'test-type',
                    version: 'test-version',
                    data: {
                        'some-propA': 'test-valueA'
                    }
                }
            ]).should.eventually.not.be.rejected
        })
    })

    describe('#buildKey', function() {
        it('should build a one-value key', function() {
            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.buildKey.callThrough()
            dynamoAdaptor.buildKey('type', 'version', 'value').should.be.eql({
                hKey: 'type:version:value:archived=false',
                rKey: ':'
            })
        })

        it('should build a two-value key', function() {
            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.buildKey.callThrough()
            dynamoAdaptor.buildKey('type', 'version', 'value', 'value').should.be.eql({
                hKey: 'type:version:value:archived=false',
                rKey: 'value:'
            })
        })

        it('should build a three-value key', function() {
            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.buildKey.callThrough()
            dynamoAdaptor.buildKey('type', 'version', 'value', 'value', 'value').should.be.eql({
                hKey: 'type:version:value:archived=false',
                rKey: 'value:value'
            })
        })
    })
})
