const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    TypeRegistry = require('../../src/lib/type-registry'),
    { InvalidTypeError } = require('../../src/errors')

chai.should()
chai.use(chaiAsPromised)

describe('TypeRegistry tests', function() {
    describe('#getType', function() {
        it('should return the key property names', function() {
            const typeRegistry = new TypeRegistry()
            return typeRegistry.getType('user', '1.0.0').should.be.eql({
                keyPropertyA: 'emailAddress'
            })
        })

        it('should throw invalid type error', function() {
            const typeRegistry = new TypeRegistry()
            return chai.expect(() => typeRegistry.getType('bad-type', 'bad-version')).to.throw(InvalidTypeError)
        })
    })
})