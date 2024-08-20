const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    { createSandbox } = require('sinon'),
    TypeInfoHandler = require('../../src/handlers/type-info-handler'),
    TypeRegistry = require('../../src/framework/type-registry')

chai.should()
chai.use(chaiAsPromised)

const sinon = createSandbox()

describe('TypeInfoHandler tests', function() {
    describe('#handle', function() {
        it('should handle a type lookup request', function() {
            const typeInfoHandler = new TypeInfoHandler({ typeRegistry: new TypeRegistry() })
            return typeInfoHandler.handle({
                pathParameters: {
                    type: 'test-type',
                    version: 'test-version'
                }
            }).should.be.eql({
                statusCode: 200,
                headers: {},
                body: JSON.stringify({
                    type: 'test-type',
                    version: 'test-version',
                    primaryKeyProperties: [
                        'some-propA', 'some-propB'
                    ]
                })
            })
        })

        it('should return error response if missing type', function() {
            const typeInfoHandler = new TypeInfoHandler({ typeRegistry: new TypeRegistry() })
            return typeInfoHandler.handle({
                pathParameters: {
                    version: 'test-version'
                }
            }).should.be.eql({
                statusCode: 400,
                headers: {},
                body: 'type and version required'
            })
        })

        it('should return error response if missing version', function() {
            const typeInfoHandler = new TypeInfoHandler({ typeRegistry: new TypeRegistry() })
            return typeInfoHandler.handle({
                pathParameters: {
                    type: 'test-type'
                }
            }).should.be.eql({
                statusCode: 400,
                headers: {},
                body: 'type and version required'
            })

        })
    })
})