const chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    { createSandbox, match } = require('sinon'),
    sinonChai = require('sinon-chai'),
    { Operation, OperationProcessor, VariableSubstitutor } = require('../../src/lib'),
    OperationSorter = require('../../src/lib/operation-sorter'),
    { TypeRegistry, DynamoAdaptor } = require('../../src/adaptors'),
    { InvalidOperationError, ReadOperationProcessingError, WriteOperationProcessingError } = require('../../src/errors')

chai.should()
chai.use(chaiAsPromised)
chai.use(sinonChai)

const sinon = createSandbox()

describe('OperationProcessor', function() {
    beforeEach(function() {
        sinon.restore()
    })

    describe('#constructor', function() {
        it('should construct the instance', function() {
            const operationProcessor = new OperationProcessor({})
            return operationProcessor.should.be.an.instanceOf(OperationProcessor)
        })
    })

    describe('#process', function() {
        it('should sort the operations, process the read operations, process the write operations and return the store', function() {
            const operationProcessor = sinon.createStubInstance(OperationProcessor)
            operationProcessor.dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            operationProcessor.typeRegistry = sinon.createStubInstance(TypeRegistry)
            operationProcessor.operationSorter = sinon.createStubInstance(OperationSorter)
            operationProcessor.variableSubstitutor = sinon.createStubInstance(VariableSubstitutor)

            operationProcessor.operationSorter.sortOperations.withArgs([
                { isReadOperation: () => true }
            ]).resolves([
                { isReadOperation: () => true }
            ])

            operationProcessor.processReads.resolves('store')
            operationProcessor.processWrites.resolves()

            operationProcessor.process.callThrough()
            return operationProcessor.process([
                { isReadOperation: () => true },
                { isReadOperation: () => false }
            ]).should.eventually.be.eql('store')
        })
    })

    describe('#processReads', function() {
        it('should process the reads sequentially', async function() {
            const operationProcessor = sinon.createStubInstance(OperationProcessor)
            operationProcessor.processReads.callThrough()
            operationProcessor.processRead.withArgs('op1', {}).resolves('storeAfter1')
            operationProcessor.processRead.withArgs('op2', 'storeAfter1').resolves('storeAfter2')
            operationProcessor.processRead.withArgs('op3', 'storeAfter2').resolves('storeAfter3')
            const result = await operationProcessor.processReads(['op1', 'op2', 'op3'])

            return result.should.be.eql('storeAfter3')
                && operationProcessor.processRead.should.have.been.calledWith('op1', {})
                && operationProcessor.processRead.should.have.been.calledWith('op2', 'storeAfter1')
                && operationProcessor.processRead.should.have.been.calledWith('op3', 'storeAfter2')
        })
    })
    describe('#processRead', function() {
        it('should process the read operation', async function() {
            const operationProcessor = sinon.createStubInstance(OperationProcessor)
            operationProcessor.processRead.callThrough()

            operationProcessor.dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            operationProcessor.variableSubstitutor = sinon.createStubInstance(VariableSubstitutor)

            operationProcessor.variableSubstitutor.substituteInObject
                .withArgs({ "prop": "${var}" }, { "var": "val1" })
                .returns({
                    prop: 'val1'
                })

            operationProcessor.dynamoAdaptor.get
                .withArgs({
                    "key": {
                        "prop": "val1"
                    },
                    "returnValues": {
                        "var2": "prop2"
                    }
                })
                .resolves({
                    prop: 'val1',
                    prop2: 'val2'
                })

            operationProcessor.getProperty
                .withArgs({
                    prop: 'val1',
                    prop2: 'val2'
                }, 'prop2')
                .returns('val2')

            const result = await operationProcessor.processRead({
                key: {
                    prop: '${var}'
                },
                returnValues: {
                    var2: 'prop2'
                }
            }, {
                var: 'val1'
            })

            return result.should.be.eql({
                var: 'val1',
                var2: 'val2'
            })
        })

        it('should fail the read operation if asked to return a non-existent value', async function() {
            const operationProcessor = sinon.createStubInstance(OperationProcessor)
            operationProcessor.processRead.callThrough()

            operationProcessor.dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            operationProcessor.variableSubstitutor = sinon.createStubInstance(VariableSubstitutor)

            operationProcessor.variableSubstitutor.substituteInObject
                .withArgs({ "prop": "${var}" }, { "var": "val1" })
                .returns({
                    prop: 'val1'
                })

            operationProcessor.dynamoAdaptor.get
                .withArgs({
                    "key": {
                        "prop": "val1"
                    },
                    "returnValues": {
                        "var2": "prop3"
                    }
                })
                .resolves({
                    prop: 'val1',
                    prop2: 'val2'
                })

            operationProcessor.getProperty
                .withArgs({
                    prop: 'val1',
                    prop2: 'val2'
                }, 'prop2')
                .returns('val2')

            return operationProcessor.processRead({
                key: {
                    prop: '${var}'
                },
                returnValues: {
                    var2: 'prop3'
                }
            }, {
                var: 'val1'
            }).should.eventually.be.rejectedWith(ReadOperationProcessingError)
        })

        it('should reject with ReadOperationProcessingError if dynamo error occurs', async function() {
            const operationProcessor = sinon.createStubInstance(OperationProcessor)
            operationProcessor.processRead.callThrough()

            operationProcessor.dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            operationProcessor.variableSubstitutor = sinon.createStubInstance(VariableSubstitutor)

            operationProcessor.variableSubstitutor.substituteInObject
                .withArgs({ "prop": "${var}" }, { "var": "val1" })
                .returns({
                    prop: 'val1'
                })

            operationProcessor.dynamoAdaptor.get
                .withArgs({
                    "key": {
                        "prop": "val1"
                    },
                    "returnValues": {
                        "var2": "prop2"
                    }
                })
                .rejects(new Error('message-content'))

            operationProcessor.getProperty
                .withArgs({
                    prop: 'val1',
                    prop2: 'val2'
                }, 'prop2')
                .returns('val2')

            return operationProcessor.processRead({
                key: {
                    prop: '${var}'
                },
                returnValues: {
                    var2: 'prop2'
                }
            }, {
                var: 'val1'
            }).should.eventually.be.rejectedWith(ReadOperationProcessingError)
        })
    })

    describe('#processWrites', function() {
        it('should map the operations and call dynamo', function() {
            const variableSubstitutor = sinon.createStubInstance(VariableSubstitutor)
            variableSubstitutor.substituteInObject.withArgs('data', 'store').returns('final-data')

            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.batchWrite.withArgs([
                {
                    op: 'op',
                    type: 'type',
                    version: 'version',
                    data: 'final-data'
                }
            ]).resolves('result')

            const operationProcessor = new OperationProcessor({ dynamoAdaptor, variableSubstitutor })
            return operationProcessor.processWrites([
                {
                    op: 'op',
                    type: 'type',
                    version: 'version',
                    data: 'data'
                }
            ], 'store').should.eventually.be.eql('result')
        })

        it('should throw a write processing error if dynamo errors', function() {
            const variableSubstitutor = sinon.createStubInstance(VariableSubstitutor)
            variableSubstitutor.substituteInObject.withArgs('data', 'store').returns('final-data')

            const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
            dynamoAdaptor.batchWrite.withArgs([
                {
                    op: 'op',
                    type: 'type',
                    version: 'version',
                    data: 'final-data'
                }
            ]).rejects(new Error('dynamo-err'))

            const operationProcessor = new OperationProcessor({ dynamoAdaptor, variableSubstitutor })
            return operationProcessor.processWrites([
                {
                    op: 'op',
                    type: 'type',
                    version: 'version',
                    data: 'data'
                }
            ], 'store').should.eventually.be.rejectedWith(WriteOperationProcessingError)
        })
    })

    describe('#buildResponse', function() {
        it('should build the response', function() {
            const operationProcessor = sinon.createStubInstance(OperationProcessor)
            operationProcessor.buildResponse.callThrough()
            operationProcessor.variableSubstitutor = sinon.createStubInstance(VariableSubstitutor)
            operationProcessor.variableSubstitutor.substituteInObject.withArgs('response', 'store').returns('final-response')
            return operationProcessor.buildResponse('response', 'store').should.be.eql('final-response')
        })

        it('should return a default response', function() {
            const operationProcessor = sinon.createStubInstance(OperationProcessor)
            operationProcessor.buildResponse.callThrough()
            return operationProcessor.buildResponse(undefined, 'store').should.be.eql({})
        })
    })

    describe('#getProperty', function() {
        it('should return a simple property', function() {
            const operationProcessor = new OperationProcessor({})
            return operationProcessor.getProperty({
                prop: 'value'
            }, 'prop').should.be.eql('value')
        })

        it('should return a nested property', function() {
            const operationProcessor = new OperationProcessor({})
            return operationProcessor.getProperty({
                prop: {
                    subprop1: {
                        subprop2: 'value'
                    }
                }
            }, 'prop.subprop1.subprop2').should.be.eql('value')
        })

        it('should throw error for a non-existent property', function() {
            const operationProcessor = new OperationProcessor({})
            return chai.expect(() => operationProcessor.getProperty({
                prop1: 'value1'
            }, 'prop2')).to.throw(InvalidOperationError)
        })
    })








    // describe('#getProperty', function() {
    //     it('should return a simple property', function() {
    //         const operationProcessor = new OperationProcessor({})
    //         return operationProcessor.getProperty({
    //             prop: 'value'
    //         }, 'prop').should.be.eql('value')
    //     })

    //     it('should return a nested property', function() {
    //         const operationProcessor = new OperationProcessor({})
    //         return operationProcessor.getProperty({
    //             prop: {
    //                 subprop1: {
    //                     subprop2: 'value'
    //                 }
    //             }
    //         }, 'prop.subprop1.subprop2').should.be.eql('value')
    //     })

    //     it('should throw error for a non-existent property', function() {
    //         const operationProcessor = new OperationProcessor({})
    //         return chai.expect(() => operationProcessor.getProperty({
    //             prop1: 'value1'
    //         }, 'prop2')).to.throw(InvalidOperationError)
    //     })
    // })

    // describe('#containsSubsitution', function() {
    //     it('should return false if no variables', function() {
    //         const operationProcessor = new OperationProcessor({})
    //         return operationProcessor.containsSubstitution('some-value').should.be.false
    //     })

    //     it('should return false if repeated number of dollar sign', function() {
    //         const operationProcessor = new OperationProcessor({})
    //         return operationProcessor.containsSubstitution('some-value$$').should.be.false
    //     })

    //     it('should return true if single variable', function() {
    //         const operationProcessor = new OperationProcessor({})
    //         return operationProcessor.containsSubstitution('some-${substitution}').should.be.true
    //     })

    //     it('should return true if multiple variables', function() {
    //         const operationProcessor = new OperationProcessor({})
    //         return operationProcessor.containsSubstitution('some-${substitution}-${substitution}').should.be.true
    //     })

    //     it('should return false if unclosed variable', function() {
    //         const operationProcessor = new OperationProcessor({})
    //         return operationProcessor.containsSubstitution('some-value${foo').should.be.false
    //     })
    // })

    // describe('#substitute', function() {
    //     it('should replace a single variable', function() {
    //         const operationProcessor = new OperationProcessor({})
    //         return operationProcessor.substitute('foo-${varName}-baz', {
    //             varName: 'bar'
    //         }).should.be.eql('foo-bar-baz')
    //     })

    //     it('should replace multiple variables', function() {
    //         const operationProcessor = new OperationProcessor({})
    //         return operationProcessor.substitute('foo-${var1}-${var2}-bah-${var3}', {
    //             var1: 'bar',
    //             var2: 'baz',
    //             var3: 'boo'
    //         }).should.be.eql('foo-bar-baz-bah-boo')
    //     })

    //     it('should throw error on undefined variable', function() {
    //         const operationProcessor = new OperationProcessor({})
    //         return chai.expect(() => operationProcessor.substitute('foo-${var1}-${var2}-bah-${var3}', {
    //             var1: 'bar',
    //             var2: 'baz'
    //         })).to.throw('Undefined variable in substitution: var3')
    //     })
    // })

    // describe('#buildOperationWithValues', function() {
    //     it('should replace the substitutions', function() {
    //         const operationProcessor = sinon.createStubInstance(OperationProcessor)
    //         operationProcessor.buildOperationWithValues.callThrough()
    //         operationProcessor.containsSubstitution.callThrough()
    //         operationProcessor.substitute.callThrough()
    //         const op = {
    //             type: 'user:1.0.0',
    //             op: 'read',
    //             key: {
    //                 email: '${email}'
    //             }
    //         }
    //         return operationProcessor.buildOperationWithValues(op, {
    //             email: 'user.name@domain.com'
    //         }).should.be.eql({
    //             type: 'user:1.0.0',
    //             op: 'read',
    //             key: {
    //                 email: 'user.name@domain.com'
    //             }
    //         })
    //     })
    // })

    // describe('#read', function() {
    //     it('should call dynamo and return the requested values', async function() {
    //         const operationProcessor = sinon.createStubInstance(OperationProcessor)
    //         operationProcessor.read.callThrough()
    //         operationProcessor.getProperty.callThrough()

    //         operationProcessor.buildOperationWithValues.withArgs('operation', 'variables').returns({
    //             returnValues: {
    //                 namedValue: 'emailAddress'
    //             }
    //         })

    //         operationProcessor.dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
    //         operationProcessor.dynamoAdaptor.get.withArgs({
    //             returnValues: {
    //                 namedValue: 'emailAddress'
    //             }
    //         }).resolves({
    //             emailAddress: 'user.name@domain.com'
    //         })

    //         const result = await operationProcessor.read('operation', 'variables')
    //         return result.should.be.eql({
    //             namedValue: 'user.name@domain.com'
    //         })
    //     })

    //     it('should throw error if asked to return a value that is not found', async function() {
    //         const operationProcessor = sinon.createStubInstance(OperationProcessor)
    //         operationProcessor.read.callThrough()
    //         operationProcessor.buildOperationWithValues.returns({
    //             returnValues: {
    //                 key: 'non-existent-field'
    //             }
    //         })
    //         operationProcessor.dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
    //         operationProcessor.dynamoAdaptor.get.withArgs({
    //             returnValues: {
    //                 key: 'non-existent-field'
    //             }
    //         }).resolves('item')
    //         operationProcessor.getProperty.withArgs('item', 'non-existent-field').returns(undefined)

    //         try {
    //             const result = await operationProcessor.read('operation', 'variables')
    //             return chai.expect.fail(`should have thrown`)
    //         } catch (err) {
    //             return err.should.be.instanceOf(ReadOperationProcessingError)
    //         }
    //     })

    //     it('should throw error if unexpected failure', async function() {
    //         const operationProcessor = sinon.createStubInstance(OperationProcessor)
    //         operationProcessor.read.callThrough()
    //         operationProcessor.buildOperationWithValues.returns({
    //             returnValues: {
    //                 key: 'non-existent-field'
    //             }
    //         })
    //         operationProcessor.dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
    //         operationProcessor.dynamoAdaptor.get.throws(new Error('foobar'))
    //         try {
    //             const result = await operationProcessor.read('operation', 'variables')
    //             return chai.expect.fail(`should have thrown`)
    //         } catch (err) {
    //             return err.should.be.instanceOf(ReadOperationProcessingError)
    //         }
    //     })
    // })

    // describe('#processReadOperation', function() {
    //     it('should combine the data', async function() {
    //         const operationProcessor = sinon.createStubInstance(OperationProcessor)
    //         operationProcessor.processReadOperation.callThrough()
    //         operationProcessor.read.withArgs('operation', { key: 'value' }).resolves({ key2: 'value2' })
    //         const result = await operationProcessor.processReadOperation('operation', { key: 'value' })
    //         return result.should.be.eql({
    //             key: 'value',
    //             key2: 'value2'
    //         }) && operationProcessor.read.should.have.been.calledWith('operation', { key: 'value' })
    //     })
    // })

    // describe('#processReadOperations', function() {
    //     it('should call processReadOperation for each operation', async function() {
    //         const operationProcessor = sinon.createStubInstance(OperationProcessor)
    //         operationProcessor.processReadOperations.callThrough()
    //         const op1 = new Operation({
    //             type: 'user:1.0.0',
    //             op: 'read',
    //             key: {
    //                 emailAddress: 'user.name@domain.com'
    //             },
    //             'return': {
    //                 someVariableId: 'emailAddress'
    //             }
    //         }, 'id1')
    //         const op2 = new Operation({
    //             type: 'user:1.0.0',
    //             op: 'read',
    //             key: {
    //                 emailAddress: 'user.name2@domain.com'
    //             },
    //             'return': {
    //                 someVariableId: 'emailAddress'
    //             }
    //         }, 'id2')
    //         operationProcessor.processReadOperation.withArgs(op1, {}).resolves('data1')
    //         operationProcessor.processReadOperation.withArgs(op2, 'data1').resolves('data2')
    //         const result = await operationProcessor.processReadOperations([
    //             op1, op2
    //         ])
    //         return result.should.be.eql('data2') && operationProcessor.processReadOperation.should.be.been.calledTwice
    //     })
    // })

    // describe('#mapWriteOperations', function() {
    //     it('should return empty array if no write operations', function() {
    //         const op = new Operation({
    //             type: 'user:1.0.0',
    //             op: 'read',
    //             key: {}
    //         })

    //         const operationProcessor = sinon.createStubInstance(OperationProcessor)
    //         operationProcessor.mapWriteOperations.callThrough()
    //         return operationProcessor.mapWriteOperations([op], {}).should.be.eql([])
    //     })

    //     it('should return the operations with variable substitutions performed', function() {
    //         const op = new Operation({
    //             type: 'user:1.0.0',
    //             op: 'create',
    //             data: {
    //                 emailAddress: '${someEmail}'
    //             }
    //         }, 'id')

    //         const operationProcessor = sinon.createStubInstance(OperationProcessor)
    //         operationProcessor.containsSubstitution.callThrough()
    //         operationProcessor.substitute.callThrough()
    //         operationProcessor.mapWriteOperations.callThrough()
    //         return operationProcessor.mapWriteOperations([op], {
    //             someEmail: 'some.user@domain.com'
    //         }).should.be.deep.eql([
    //             {
    //                 op: 'create',
    //                 type: 'user',
    //                 version: '1.0.0',
    //                 data: {
    //                     emailAddress: 'some.user@domain.com'
    //                 }
    //             }
    //         ])
    //     })
    // })

    // describe('#process', function() {
    //     it('should process the write operations with the return values provided', async function() {
    //         const operationProcessor = sinon.createStubInstance(OperationProcessor)
    //         operationProcessor.process.callThrough()
    //         const op = new Operation({
    //             op: 'create',
    //             type: 'user:1.0.0',
    //             data: {
    //                 emailAddress: 'some.user@domain.com'
    //             }
    //         }, 'id')
    //         operationProcessor.mapWriteOperations.withArgs([op], 'data').returns('write-items')
    //         operationProcessor.operationSorter = sinon.createStubInstance(OperationSorter)
    //         operationProcessor.operationSorter.sortOperations.returns('sorted-reads')
    //         operationProcessor.processReadOperations.withArgs('sorted-reads').resolves('data')
    //         operationProcessor.dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
    //         operationProcessor.dynamoAdaptor.batchWrite.withArgs('write-items').resolves('write-response')
    //         operationProcessor.processResponse.withArgs('response', 'data').resolves('ok')
    //         const result = await operationProcessor.process([op], 'response')
    //         return result.should.be.eql('ok') && operationProcessor.dynamoAdaptor.batchWrite.should.have.been.calledWith('write-items')
    //     })

    //     it('should return the values if no write operations are specified', async function() {
    //         const operationProcessor = sinon.createStubInstance(OperationProcessor)
    //         operationProcessor.process.callThrough()
    //         operationProcessor.operationSorter = sinon.createStubInstance(OperationSorter)
    //         operationProcessor.operationSorter.sortOperations.returns([])
    //         operationProcessor.processReadOperations.resolves('data')
    //         operationProcessor.mapWriteOperations.returns([])
    //         operationProcessor.processResponse.returns('ok')
    //         operationProcessor.dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
    //         const result = await operationProcessor.process([], 'response')
    //         return result.should.be.eql('ok') && operationProcessor.dynamoAdaptor.batchWrite.should.not.have.been.called
    //     })

    //     it('should throw an error if the write operations fail', async function() {
    //         const operationProcessor = sinon.createStubInstance(OperationProcessor)
    //         operationProcessor.process.callThrough()
    //         const op = new Operation({
    //             op: 'create',
    //             type: 'user:1.0.0',
    //             data: {
    //                 emailAddress: 'some.user@domain.com'
    //             }
    //         }, 'id')
    //         operationProcessor.mapWriteOperations.withArgs([op], 'data').returns('write-items')
    //         operationProcessor.operationSorter = sinon.createStubInstance(OperationSorter)
    //         operationProcessor.operationSorter.sortOperations.returns('sorted-reads')
    //         operationProcessor.processReadOperations.withArgs('sorted-reads').resolves('data')
    //         operationProcessor.dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
    //         operationProcessor.dynamoAdaptor.batchWrite.withArgs('write-items').rejects(new Error())

    //         try {
    //             const result = await operationProcessor.process([op], 'response')
    //             return chai.expect.fail('should have thrown')
    //         } catch (err) {
    //             return err.should.be.instanceOf(WriteOperationProcessingError)
    //         }

    //     })
    // })

    // describe('#processResponse', function() {
    //     it('should build the response from the given data', function() {
    //         const operationProcessor = sinon.createStubInstance(OperationProcessor)
    //         operationProcessor.processResponse.callThrough()

    //         operationProcessor.containsSubstitution.callThrough()
    //         operationProcessor.substitute.callThrough()

    //         return operationProcessor.processResponse({
    //             name1: 'value',
    //             name2: '${reference1}',
    //             name3: ['${reference2}'],
    //             name4: 40
    //         }, {
    //             reference1: 'ref-value-1',
    //             reference2: 'ref-value-2'
    //         }).should.be.eql({
    //             name1: 'value',
    //             name2: 'ref-value-1',
    //             name3: ['ref-value-2'],
    //             name4: 40
    //         })
    //     })

    //     it('should return empty object if no response was requested', function() {
    //         const operationProcessor = sinon.createStubInstance(OperationProcessor)
    //         operationProcessor.processResponse.callThrough()
    //         return operationProcessor.processResponse(undefined, 'data').should.be.eql({})

    //     })
    // })

})
