const chai = require('chai'),
    BatchOperationsHandler = require('../../src/handlers/batch-operations-handler'),
    OperationProcessor = require('../../src/lib/operation-processor'),
    { Definition, Operation } = require('../../src/lib'),
    { createSandbox } = require('sinon'),
    { DynamoAdaptor } = require('../../src/adaptors')

chai.should()

const sinon = createSandbox()

describe('BatchOperationsHandler tests', function() {

    describe('#deserializeDefinitions', function() {
        it('should map the definitions to new objects', function() {
            const handler = new BatchOperationsHandler({})
            return handler.deserializeDefinitions([{
                type: 'type',
                version: 'version',
                keyProperties: {
                    keyPropertyA: 'some-propA',
                    keyPropertyB: 'some-propB',
                    keyPropertyC: 'some-propC'
                }
            }])[0].should.be.an.instanceOf(Definition)
        })
    })

    describe('#deserializeOperations', function() {
        it('should map the operations to new objects', function() {
            const handler = new BatchOperationsHandler({})
            return handler.deserializeOperations([{
                op: 'create',
                type: 'user',
                version: '1.0.0',
                data: 'data'
            }])[0].should.be.an.instanceOf(Operation)
        })
    })

    describe('#handle', function() {
        it('should handle the request', function() {
            const handler = sinon.createStubInstance(BatchOperationsHandler)
            handler.handle.callThrough()

            handler.operationProcessor = sinon.createStubInstance(OperationProcessor)
            handler.deserializeOperations
                .withArgs('ops')
                .returns('ops')
            handler.operationProcessor.process
                .withArgs('ops')
                .resolves('store')
            handler.operationProcessor.buildResponse
                .withArgs('resp', 'store')
                .returns('response')

            return handler.handle({
                body: {
                    operations: 'ops',
                    response: 'resp'
                }
            }).should.eventually.be.eql({
                statusCode: 200,
                body: 'response'
            })
        })

        it('should handle an empty operations list', function() {
            const handler = sinon.createStubInstance(BatchOperationsHandler)
            handler.handle.callThrough()
            handler.deserializeOperations.withArgs([]).resolves([])
            handler.operationProcessor = sinon.createStubInstance(OperationProcessor)
            handler.operationProcessor.buildResponse.returns('response')

            return handler.handle({
                body: {
                    operations: [],
                    response: 'resp'
                }
            }).should.eventually.be.eql({
                statusCode: 200,
                body: 'response'
            })
        })

        it('should handle the request with definitions present', function() {
            const handler = sinon.createStubInstance(BatchOperationsHandler)
            handler.handle.callThrough()

            handler.operationProcessor = sinon.createStubInstance(OperationProcessor)

            handler.deserializeDefinitions.withArgs('defs').returns('types')
            handler.dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            handler.dynamoAdaptor.createTypes.withArgs('types').resolves()

            handler.deserializeOperations
                .withArgs('ops')
                .returns('ops')
            handler.operationProcessor.process
                .withArgs('ops')
                .resolves('store')
            handler.operationProcessor.buildResponse
                .withArgs('resp', 'store')
                .returns('response')

            return handler.handle({
                body: {
                    definitions: 'defs',
                    operations: 'ops',
                    response: 'resp'
                }
            }).should.eventually.be.eql({
                statusCode: 200,
                body: 'response'
            })
        })
    })
})