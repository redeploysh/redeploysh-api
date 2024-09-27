const chai = require('chai'),
    { InvalidRequestError, WriteOperationProcessingError } = require('../src/errors')

chai.should()

describe('Error Tests', function() {
    describe('WriteOperationProcessingError', function() {
        it('should set the error message from err.message', function() {
            const err = new WriteOperationProcessingError({
                message: 'message'
            })
            return err.message.should.be.eql('message')
        })

        it('should set the error message from err.errorMessage', function() {
            const err = new WriteOperationProcessingError({
                errorMessage: 'message'
            })
            return err.message.should.be.eql('message')
        })

        it('should set the default error message', function() {
            const err = new WriteOperationProcessingError({})
            return err.message.should.be.eql('Write Error')
        })
    })

    describe('InvalidRequestError', function() {
        it('should set the error message from err.message', function() {
            const err = new InvalidRequestError({
                message: 'message'
            })
            return err.message.should.be.eql('message')
        })

        it('should set the error message from err.errorMessage', function() {
            const err = new InvalidRequestError({
                errorMessage: 'message'
            })
            return err.message.should.be.eql('message')
        })

        it('should set the default error message', function() {
            const err = new InvalidRequestError({})
            return err.message.should.be.eql('Invalid Request Error')
        })
    })
})