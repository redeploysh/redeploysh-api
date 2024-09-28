const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    { createSandbox } = require('sinon'),
    sinonChai = require('sinon-chai'),
    Router = require('../../src/framework/router'),
    { Injector } = require('../../src/framework/injector'),
    Logger = require('../../src/logger'),
    BatchOperationsHandler = require('../../src/handlers/batch-operations-handler'),
    ApiGatewayJsonParser = require('../../src/parsers/api-gateway-json-parser')

chai.should()
chai.use(chaiAsPromised)
chai.use(sinonChai)

const sinon = createSandbox()

describe('Router tests', function() {

    afterEach(function() {
        sinon.restore()
    })

    describe('#constructor', function() {
        it('should create the instance', function() {
            const router = new Router({})
            router.should.be.an.instanceOf(Router)
        })
    })

    describe('#dispatch', function() {
        it('should call the parser and handler', async function() {
            const router = sinon.createStubInstance(Router)
            router.dispatch.callThrough()
            router.routes = {
                'GET/': {
                    parser: 'some-parser',
                    handler: 'some-handler'
                }
            }
            const parser = sinon.createStubInstance(ApiGatewayJsonParser)
            parser.parse.returns({})
            const handler = sinon.createStubInstance(BatchOperationsHandler)
            handler.handle.resolves({})
            router.dependencies = {
                'some-parser': inj => parser,
                'some-handler': inj => handler
            }

            router.buildResponse.withArgs({}).returns('response')

            const result = await router.dispatch({
                resource: '/',
                httpMethod: 'GET'
            })
            return result.should.be.eql('response') && parser.parse.should.have.been.calledOnce && handler.handle.should.have.been.calledOnce
        })

        it('should throw NotFoundError if route does not exist', async function() {
            const router = sinon.createStubInstance(Router)
            router.routes = {}
            router.dispatch.callThrough()

            await router.dispatch({
                resource: '/',
                httpMethod: 'GET'
            })

            return router.buildErrorResponse.should.have.been.calledOnce
        })

        it('should throw InternalProcessingError if unknown failure', async function() {
            const router = sinon.createStubInstance(Router)
            router.routes = {
                'GET/': {
                    parser: 'some-parser',
                    handler: 'some-handler'
                }
            }
            router.logger = sinon.createStubInstance(Logger)
            const parser = sinon.createStubInstance(ApiGatewayJsonParser)
            parser.parse.throws(new Error('foo'))
            const handler = sinon.createStubInstance(BatchOperationsHandler)
            handler.handle.resolves({})
            router.dependencies = {
                'some-parser': inj => parser,
                'some-handler': inj => handler
            }

            router.dispatch.callThrough()

            await router.dispatch({
                resource: '/',
                httpMethod: 'GET'
            })

            return router.buildErrorResponse.should.have.been.calledOnce
        })
    })

    describe('#buildResponse', function() {
        it('should return the response', function() {
            const router = new Router({})
            return router.buildResponse({
                statusCode: 200,
                body: 'body'
            }).should.be.eql({
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST,GET,OPTIONS'
                },
                body: '"body"'
            })
        })

        it('should return the response with custom headers', function() {
            const router = new Router({})
            return router.buildResponse({
                statusCode: 200,
                headers: { header: 'value' },
                body: 'body'
            }).should.be.eql({
                statusCode: 200,
                headers: {
                    header: 'value',
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST,GET,OPTIONS'
                },
                body: '"body"'
            })
        })
    })

    describe('#buildErrorResponse', function() {
        it('should return the error response with defaults', function() {
            const router = new Router({})
            return router.buildErrorResponse({}).should.be.eql({
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST,GET,OPTIONS'
                },
                body: 'Unknown Error'
            })
        })

        it('should return the error response with custom headers', function() {
            const router = new Router({})
            return router.buildErrorResponse({
                headers: {
                    header: 'value'
                }
            }).should.be.eql({
                statusCode: 500,
                headers: {
                    header: 'value',
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST,GET,OPTIONS'
                },
                body: 'Unknown Error'
            })
        })
    })
})