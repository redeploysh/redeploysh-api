const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    { createSandbox } = require('sinon'),
    sinonChai = require('sinon-chai'),
    Router = require('../../src/framework/router')

chai.should()
chai.use(chaiAsPromised)
chai.use(sinonChai)

const sinon = createSandbox()

describe('Router tests', function () {

    afterEach(function () {
        sinon.restore()
    })

    describe('#constructor', function () {
        it('should create the instance', function () {
            const router = new Router({})
            router.should.be.an.instanceOf(Router)
        })
    })

    describe('#dispatch', function () {
        it('should call the parser and handler', function () {
            const parserStub = sinon.stub().resolves('request')
            const handlerStub = sinon.stub().resolves('response')
            const router = new Router({
                routes: {
                    'GET/': {
                        parser: parserStub,
                        handler: handlerStub
                    }
                }
            })
            return router.dispatch({
                resource: '/',
                httpMethod: 'GET'
            }).then((result) => result.should.be.eql('response') && parserStub.should.have.been.calledOnce && handlerStub.should.have.been.calledOnce)
        })

        it('should call NotFound route if route does not exist', function () {
            const parserStub = sinon.stub().resolves('request')
            const handlerStub = sinon.stub().withArgs('request').resolves('response')
            const router = new Router({
                routes: {
                    'NotFound': {
                        parser: parserStub,
                        handler: handlerStub
                    }
                }
            })
            return router.dispatch({
                resource: '/',
                httpMethod: 'GET'
            }).then((result) => result.should.be.eql('response') && parserStub.should.have.been.calledOnce && handlerStub.should.have.been.calledOnce)
        })
    })
})