const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    { createSandbox } = require('sinon'),
    BaseHandler = require('../../src/handlers/base-handler')

chai.should()
chai.use(chaiAsPromised)

const sinon = createSandbox()

describe('BaseHandler tests', function() {
    describe('#buildResponse', function() {
        it('should return the response', function() {
            const handler = new BaseHandler()
            return handler.buildResponse({
                statusCode: 200,
                body: 'body'
            }).should.be.eql({
                statusCode: 200,
                headers: {},
                body: 'body'
            })
        })

        it('should return the response with custom headers', function() {
            const handler = new BaseHandler()
            return handler.buildResponse({
                statusCode: 200,
                headers: 'headers',
                body: 'body'
            }).should.be.eql({
                statusCode: 200,
                headers: 'headers',
                body: 'body'
            })
        })
    })

    describe('#buildErrorResponse', function() {
        it('should return the error response with defaults', function() {
            const handler = new BaseHandler()
            return handler.buildErrorResponse({}).should.be.eql({
                statusCode: 500,
                headers: {},
                body: 'Internal Server Error'
            })
        })

        it('should return the error response with custom headers', function() {
            const handler = new BaseHandler()
            return handler.buildErrorResponse({
                statusCode: 503,
                headers: 'headers',
                message: 'msg'
            }).should.be.eql({
                statusCode: 503,
                headers: 'headers',
                body: 'msg'
            })
        })
    })
})