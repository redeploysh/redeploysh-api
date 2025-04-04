const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    { createSandbox } = require('sinon'),
    sinonChai = require('sinon-chai'),
    ApiGatewayJsonParser = require('../../src/parsers/api-gateway-json-parser'),
    { InvalidRequestError } = require('../../src/errors'),
    Logger = require('../../src/logger')

chai.should()
chai.use(chaiAsPromised)
chai.use(sinonChai)

const sinon = createSandbox()

describe('ApiGatewayJsonParser', function() {

    afterEach(function() {
        sinon.restore()
    })

    describe('#parse', function() {
        it('should parse the event and context correctly', function() {
            const event = {
                headers: {
                    'some-header-key': 'some-header-value'
                },
                queryStringParameters: 'some-query-params',
                pathParameters: 'some-path-params',
                body: JSON.stringify({
                    'key': 'value'
                }),
                requestContext: {
                    authorizer: 'some-auth-data',
                    identity: {
                        sourceIp: '127.0.0.1'
                    },
                    requestId: 'some-request-id'
                }
            }
            const context = 'some-lambda-context'

            const parser = new ApiGatewayJsonParser({ logger: sinon.createStubInstance(Logger) })
            return parser.parse(event, context).should.be.eql({
                body: {
                    key: 'value'
                },
                headers: {
                    'some-header-key': 'some-header-value'
                },
                pathParameters: 'some-path-params',
                queryStringParameters: 'some-query-params',
                authorizer: 'some-auth-data',
                sourceIp: '127.0.0.1',
                requestId: 'some-request-id'
            })
        })

        it('should return invalid request error on bad json', function() {
            const event = {
                headers: {
                    'some-header-key': 'some-header-value'
                },
                queryStringParameters: 'some-query-params',
                pathParameters: 'some-path-params',
                body: '\'23rj304gh031g{bad:json}',
                requestContext: {
                    authorizer: 'some-auth-data',
                    identity: {
                        sourceIp: '127.0.0.1'
                    },
                    requestId: 'some-request-id'
                }
            }
            const context = 'some-lambda-context'

            const parser = new ApiGatewayJsonParser({ logger: sinon.createStubInstance(Logger) })
            try {
                parser.parse(event, context)
                return chai.expect.fail(`should have thrown`)
            } catch (err) {
                return err.should.be.an.instanceOf(InvalidRequestError)
            }
        })
    })
})