const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    TypeRegistry = require('../../src/framework/type-registry'),
    { InvalidTypeError } = require('../../src/errors')

chai.should()
chai.use(chaiAsPromised)

describe('TypeRegistry tests', function() {
    describe('#getType', function() {
        it('should return the key property names', function() {
            const typeRegistry = new TypeRegistry()
            return typeRegistry.getType('test-type', 'test-version').should.be.eql({
                keyPropertyA: 'some-propA',
                keyPropertyB: 'some-propB'
            })
        })

        it('should throw invalid type error', function() {
            const typeRegistry = new TypeRegistry()
            return chai.expect(() => typeRegistry.getType('bad-type', 'bad-version')).to.throw(InvalidTypeError)
        })
    })
})