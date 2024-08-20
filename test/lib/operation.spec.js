const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    { Operation } = require('../../src/lib/operation')

chai.should()
chai.use(chaiAsPromised)

describe('Operation', function() {
    describe('#isReadOperation', function() {
        it('should be true for a read', function() {
            const op = new Operation({
                id: 'some-id',
                type: 'type:version',
                op: 'read',
                key: {
                    someProperty: 'some-value'
                }
            })
            return op.isReadOperation().should.be.true
        })

        it('should be false if not a read', function() {
            const op = new Operation({
                id: 'some-id',
                type: 'type:version',
                op: 'create',
                data: {
                    someProperty: 'some-value'
                }
            })
            return op.isReadOperation().should.be.false
        })
    })

    describe('#getDependencies', function() {
        it('should use the cached value', function() {
            const op = new Operation({ type: 'type:version' })
            op.substitutions = 'value'
            return op.getDependencies().should.be.eql('value')
        })

        it('should return all the dependency ids for keys', function() {
            const op = new Operation({
                id: 'some-id',
                type: 'type:version',
                op: 'read',
                key: {
                    someProperty: '${some-property-name}',
                    someOtherProperty: '${some-other-property-name}'
                }
            })
            return op.getDependencies().should.be.eql([
                'some-property-name', 'some-other-property-name'
            ])
        })

        it('should return all the dependency ids for data', function() {
            const op = new Operation({
                id: 'some-id',
                type: 'type:version',
                op: 'read',
                data: {
                    someProperty: '${some-property-name}',
                    someOtherProperty: '${some-other-property-name}',
                    someIndependentProperty: 'value',
                }
            })
            return op.getDependencies().should.be.eql([
                'some-property-name', 'some-other-property-name'
            ])
        })
    })

})

