const chai = require('chai'),
    { InvalidTypeError } = require('../../src/errors'),
    { createSandbox } = require('sinon'),
    TypeInfoHandler = require('../../src/handlers/type-info-handler'),
    TypeRegistry = require('../../src/adaptors/type-registry'),
    { InvalidRequestError } = require('../../src/errors')

chai.should()
const sinon = createSandbox()

describe('TypeInfoHandler tests', function() {
    describe('#handle', function() {
        it('should handle a type lookup request', async function() {
            const typeInfoHandler = new TypeInfoHandler({ typeRegistry: sinon.createStubInstance(TypeRegistry) })
            typeInfoHandler.typeRegistry.getType.withArgs('type', '1.0.0').resolves({
                type: 'type',
                version: '1.0.0',
                keyProperties: {
                    keyPropertyA: 'type',
                    keyPropertyB: 'version'
                }
            })
            const result = await typeInfoHandler.handle({
                pathParameters: {
                    type: 'type',
                    version: '1.0.0'
                }
            })
            return result.should.be.eql({
                statusCode: 200,
                body: {
                    type: 'type',
                    version: '1.0.0',
                    primaryKeyProperties: [
                        'type',
                        'version'
                    ]
                }
            })
        })

        it('should throw error if missing type', async function() {
            const typeInfoHandler = new TypeInfoHandler({ typeRegistry: sinon.createStubInstance(TypeRegistry) })
            typeInfoHandler.typeRegistry.getType.throws(new InvalidTypeError('type', '1.0.0'))
            try {
                await typeInfoHandler.handle({
                    pathParameters: {
                        type: undefined,
                        version: 'test-version'
                    }
                })
                return chai.expect.fail(`expected to throw`)
            } catch (err) {
                return err.should.be.instanceOf(InvalidRequestError)
            }
        })

        it('should return error response if missing version', async function() {
            const typeInfoHandler = new TypeInfoHandler({ typeRegistry: sinon.createStubInstance(TypeRegistry) })
            typeInfoHandler.typeRegistry.getType.throws(new InvalidTypeError('type', '1.0.0'))
            try {
                await typeInfoHandler.handle({
                    pathParameters: {
                        type: 'type',
                        version: undefined
                    }
                })
                return chai.expect.fail(`expected to throw`)
            } catch (err) {
                return err.should.be.instanceOf(InvalidRequestError)
            }
        })
    })
})