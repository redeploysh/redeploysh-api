const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    { createSandbox } = require('sinon'),
    sinonChai = require('sinon-chai'),
    { Operation } = require('../../src/lib/operation'),
    { OperationSorter } = require('../../src/lib/operation-sorter'),
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
                        someOtherProperty: '${some-id:someProperty}'
                    }
                })

            const sorter = new OperationSorter({ graph: Graph })
            return chai.expect(() => sorter.sortOperations({
                'some-id': op1,
                'some-other-id': op2
            })).to.throw('Circular dependency')
        })

        it('should throw error on nested circular dependency', function() {
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
                    id: 'some-intermediate-id',
                    type: 'type:version',
                    op: 'read',
                    key: {
                        someThirdProperty: '${some-id:someProperty}'
                    }
                })
            const op3 =
                new Operation({
                    id: 'some-other-id',
                    type: 'type:version',
                    op: 'read',
                    key: {
                        someOtherProperty: '${some-intermediate-id:someThirdProperty}'
                    }
                })

            const sorter = new OperationSorter({ graph: Graph })
            return chai.expect(() => sorter.sortOperations({
                'some-id': op1,
                'some-intermediate-id': op2,
                'some-other-id': op3,
            })).to.throw('Circular dependency')
        })

        it('should sort into dependency order', function() {
            const op1 = new Operation({
                id: 'op1',
                type: 'type:version',
                op: 'read',
                key: {
                    prop: 'value'
                }
            })
            const op2 = new Operation({
                id: 'op2',
                type: 'type:version',
                op: 'read',
                key: {
                    prop: '${op1:prop}'
                }
            })
            const op3 = new Operation({
                id: 'op3',
                type: 'type:version',
                op: 'create',
                data: {
                    prop: '${op2:prop}'
                }
            })
            const op4 = new Operation({
                id: 'op4',
                type: 'type:version',
                op: 'create',
                data: {
                    prop: '${op2:prop}',
                    otherProp: '${op3:prop}'
                }
            })
            const op5 = new Operation({
                id: 'op5',
                type: 'type:version',
                op: 'archive',
                key: {
                    prop: '${op3:prop}',
                    otherProp: '${op4:prop}'
                }
            })

            const sorter = new OperationSorter({ graph: Graph })
            const sorted = sorter.sortOperations({
                op5, op1, op3, op2, op4
            })
            return sorted.should.have.deep.ordered.members([
                op1, op2, op3, op4, op5
            ])
        })
    })
})
