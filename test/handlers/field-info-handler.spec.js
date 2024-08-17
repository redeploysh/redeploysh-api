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
            const typeInfoHandler = new TypeInfoHandler({ typeRegistry })

        })
    })
})