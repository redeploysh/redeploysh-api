const chai = require('chai'),
    BatchOperationsHandler = require('../../src/handlers/batch-operations-handler'),
    DynamoAdaptor = require('../../src/lib/dynamo-adaptor'),
    OperationProcessor = require('../../src/lib/operation-processor'),
    { InvalidRequestError } = require('../../src/errors'),
    { createSandbox } = require('sinon')

chai.should()

const sinon = createSandbox()

describe('BatchOperationsHandler tests', function() {
    describe('#handle', function() {
        it('should handle a request', async function() {
            const operationProcessor = sinon.createStubInstance(OperationProcessor)
            const handler = new BatchOperationsHandler({
                operationProcessor
            })
            operationProcessor.process.resolves('result')
            const result = await handler.handle({
                body: {
                    operations: [
                        {
                            type: 'user:1.0.0',
                            op: 'read',
                            key: {
                                emailAddress: 'some.user@email.com'
                            }
                        }
                    ],
                    response: {}
                }
            })
            return result.should.be.eql({
                statusCode: 200,
                body: 'result'
            })
        })
    })
})