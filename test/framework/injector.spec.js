const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    { Injector } = require('../../src/framework/injector'),
    { createSandbox } = require('sinon')

chai.should()

const sinon = createSandbox()

describe('Injector tests', function() {
    describe('#constructor', function() {
        it('should create the instance', function() {
            const injector = new Injector('dependencies')
            return injector.should.be.an.instanceOf(Injector)
        })
    })

    describe('#resolve', function() {
        it('should call the resolver', function() {
            const injector = new Injector({
                name: sinon.stub()
            })

            injector.resolve('name')
            return injector.dependencies.name.should.have.been.calledOnce
        })
    })
})