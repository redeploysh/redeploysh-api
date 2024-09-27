const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    { createSandbox } = require('sinon'),
    Logger = require('../src/logger')

chai.should()
chai.use(chaiAsPromised)

const sinon = createSandbox()

describe('Logger tests', function() {
    describe('#constructor', function() {
        it('should construct the logger with default device', function() {
            const logger = new Logger()
        })
    })

    describe('#log', function() {
        it('should log', function() {
            const logStub = sinon.stub()
            const logger = new Logger({
                log: logStub
            })
            logger.log('message')
            return logStub.should.have.been.called
        })
    })

    describe('#error', function() {
        it('should log error', function() {
            const logStub = sinon.stub()
            const logger = new Logger({
                error: logStub
            })
            logger.error('message')
            return logStub.should.have.been.called
        })
    })
})