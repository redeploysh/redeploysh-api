const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    { createSandbox } = require('sinon'),
    sinonChai = require('sinon-chai'),
    { Operation, OperationSorter } = require('../../src/lib'),
    { Graph } = require('graph-data-structure')

chai.should()
chai.use(chaiAsPromised)
chai.use(sinonChai)

const sinon = createSandbox()

describe('OperationsSorter', function() {
    describe('#sortOperations', function() {
        it('should throw error on circular dependency', function() {
            const op1 =
                new Operation({
                    type: 'user:1.0.0',
                    op: 'read',
                    key: {
                        someProperty: '${someOtherProperty}'
                    },
                    'return': {
                        someProperty: 'some-prop-name'
                    }
                }, 'id1')
            const op2 =
                new Operation({
                    type: 'user:1.0.0',
                    op: 'read',
                    key: {
                        someProperty: '${someProperty}'
                    },
                    'return': {
                        someOtherProperty: 'some-prop-name'
                    }
                }, 'id2')

            const sorter = new OperationSorter({ graph: Graph })
            return chai.expect(() => sorter.sortOperations([op1, op2])).to.throw('Circular dependency')
        })

        it('should throw error on nested circular dependency', function() {
            const op1 =
                new Operation({
                    type: 'user:1.0.0',
                    op: 'read',
                    key: {
                        someProperty: '${someOtherPropertyReference}'
                    },
                    'return': {
                        somePropertyReference: 'some-property-name'
                    }
                }, 'id1')
            const op2 =
                new Operation({
                    type: 'user:1.0.0',
                    op: 'read',
                    key: {
                        someThirdProperty: '${somePropertyReference}'
                    },
                    'return': {
                        someThirdPropertyReference: 'some-third-property-name'
                    }
                }, 'id2')
            const op3 =
                new Operation({
                    type: 'user:1.0.0',
                    op: 'read',
                    key: {
                        someOtherProperty: '${someThirdPropertyReference}'
                    },
                    'return': {
                        someOtherPropertyReference: 'some-other-property-name'
                    }
                }, 'id3')
            const sorter = new OperationSorter({ graph: Graph })
            return chai.expect(() => sorter.sortOperations([op1, op2, op3])).to.throw('Circular dependency')
        })

        it('should sort into dependency order', function() {
            const op1 = new Operation({
                type: 'user:1.0.0',
                op: 'read',
                key: {
                    prop: 'value'
                },
                'return': {
                    op1PropReference: 'prop-name'
                }
            }, 'id1')
            const op2 = new Operation({
                type: 'user:1.0.0',
                op: 'read',
                key: {
                    prop: '${op1PropReference}'
                },
                'return': {
                    op2PropReference: 'prop-name'
                }
            }, 'id2')
            const op3 = new Operation({
                type: 'user:1.0.0',
                op: 'create',
                data: {
                    prop: '${op2PropReference}'
                },
                'return': {
                    op3PropReference: 'prop-name'
                }
            }, 'id3')
            const op4 = new Operation({
                type: 'user:1.0.0',
                op: 'create',
                data: {
                    prop: '${op2PropReference}',
                    otherProp: '${op3PropReference}'
                }
            }, 'id4')
            const op5 = new Operation({
                type: 'user:1.0.0',
                op: 'archive',
                key: {
                    prop: '${op3PropReference}',
                    otherProp: '${op2PropReference}'
                }
            }, 'id5')

            const sorter = new OperationSorter({ graph: Graph })
            const sorted = sorter.sortOperations([
                op5, op1, op3, op2, op4
            ])
            return sorted.should.have.deep.ordered.members([
                op1, op2, op3, op5, op4
            ])
        })
    })
})
