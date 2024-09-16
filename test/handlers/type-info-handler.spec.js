const chai = require('chai'),
    TypeInfoHandler = require('../../src/handlers/type-info-handler'),
    TypeRegistry = require('../../src/lib/type-registry'),
    { InvalidRequestError } = require('../../src/errors')

chai.should()

describe('TypeInfoHandler tests', function() {
    describe('#handle', function() {
        it('should handle a type lookup request', async function() {
            const typeInfoHandler = new TypeInfoHandler({ typeRegistry: new TypeRegistry() })
            const result = await typeInfoHandler.handle({
                pathParameters: {
                    type: 'user',
                    version: '1.0.0'
                }
            })
            return result.should.be.eql({
                statusCode: 200,
                body: {
                    type: 'user',
                    version: '1.0.0',
                    primaryKeyProperties: [
                        'emailAddress'
                    ]
                }
            })
        })

        it('should throw error if missing type', async function() {
            const typeInfoHandler = new TypeInfoHandler({ typeRegistry: new TypeRegistry() })
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
            const typeInfoHandler = new TypeInfoHandler({ typeRegistry: new TypeRegistry() })
            try {
                await typeInfoHandler.handle({
                    pathParameters: {
                        type: 'user',
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