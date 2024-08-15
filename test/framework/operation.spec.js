const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    { createSandbox } = require('sinon'),
    sinonChai = require('sinon-chai'),
    { Operation } = require('../../src/framework/operation')

chai.should()
chai.use(chaiAsPromised)
chai.use(sinonChai)

const sinon = createSandbox()

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
        it('should return all the dependency ids', function() {
            const op = new Operation({
                id: 'some-id',
                type: 'type:version',
                op: 'read',
                key: {
                    someProperty: '${some-id:some-property-name}',
                    someOtherProperty: '${some-other-id:some-other-property-name}'
                }
            })
            return op.getDependencies().should.be.eql([
                'some-id', 'some-other-id'
            ])
        })
    })

    describe('#dependsOn', function() {
        it('should be true if there is a dependency', function() {
            const op1 =
                new Operation({
                    id: 'some-id',
                    type: 'type:version',
                    op: 'read',
                    key: {
                        someProperty: '${some-other-id:someOtherProperty}'
                    }
                })
            const op2 =
                new Operation({
                    id: 'some-other-id',
                    type: 'type:version',
                    op: 'read',
                    key: {
                        someOtherProperty: 'value'
                    }
                })
            return op1.dependsOn(op2).should.be.true
        })

        it('should be false if there is no dependency', function() {
            const op1 =
                new Operation({
                    id: 'some-id',
                    type: 'type:version',
                    op: 'read',
                    key: {
                        someProperty: '${some-third-id:someOtherProperty}'
                    }
                })
            const op2 =
                new Operation({
                    id: 'some-other-id',
                    type: 'type:version',
                    op: 'read',
                    key: {
                        someOtherProperty: 'value'
                    }
                })
            return op1.dependsOn(op2).should.be.false
        })
    })
})

