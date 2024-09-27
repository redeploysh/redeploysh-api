const chai = require('chai'),
    { createSandbox } = require('sinon'),
    sinonChai = require('sinon-chai'),
    VariableSubstitutor = require('../../src/lib/variable-substitutor')

const sinon = createSandbox()
chai.should()
chai.use(sinonChai)

describe('VariableSubstitutor', function() {
    describe('#isString', function() {
        [
            { type: 'string', value: 'test', expected: true },
            { type: 'string object', value: new String('test'), expected: true },
            { type: 'number', value: 12, expected: false },
            { type: 'array', value: ['a'], expected: false },
            { type: 'object', value: { a: 'a' }, expected: false }
        ].forEach(({ type, value, expected }) => it(`should return ${expected} for a ${type}`, function() {
            const variableSubstitutor = new VariableSubstitutor()
            return variableSubstitutor.isString(value).should.be.eql(expected)
        }))
    })

    describe('#isArray', function() {
        [
            { type: 'string', value: 'test', expected: false },
            { type: 'string object', value: new String('test'), expected: false },
            { type: 'number', value: 12, expected: false },
            { type: 'array', value: ['a'], expected: true },
            { type: 'object', value: { a: 'a' }, expected: false }
        ].forEach(({ type, value, expected }) => it(`should return ${expected} for a ${type}`, function() {
            const variableSubstitutor = new VariableSubstitutor()
            return variableSubstitutor.isArray(value).should.be.eql(expected)
        }))
    })

    describe('#isObject', function() {
        [
            { type: 'string', value: 'test', expected: false },
            { type: 'string object', value: new String('test'), expected: false },
            { type: 'number', value: 12, expected: false },
            { type: 'array', value: ['a'], expected: false },
            { type: 'object', value: { a: 'a' }, expected: true }
        ].forEach(({ type, value, expected }) => it(`should return ${expected} for a ${type}`, function() {
            const variableSubstitutor = new VariableSubstitutor()
            return variableSubstitutor.isObject(value).should.be.eql(expected)
        }))
    })

    describe('#containsSubstitution', function() {
        it('should return false if no variables', function() {
            const variableSubstitutor = new VariableSubstitutor()
            return variableSubstitutor.containsSubstitution('some-value').should.be.false
        })

        it('should return false if repeated number of dollar sign', function() {
            const variableSubstitutor = new VariableSubstitutor()
            return variableSubstitutor.containsSubstitution('some-value$$').should.be.false
        })

        it('should return true if single variable', function() {
            const variableSubstitutor = new VariableSubstitutor()
            return variableSubstitutor.containsSubstitution('some-${substitution}').should.be.true
        })

        it('should return true if multiple variables', function() {
            const variableSubstitutor = new VariableSubstitutor()
            return variableSubstitutor.containsSubstitution('some-${substitution}-${substitution}').should.be.true
        })

        it('should return false if unclosed variable', function() {
            const variableSubstitutor = new VariableSubstitutor()
            return variableSubstitutor.containsSubstitution('some-value${foo').should.be.false
        })
    })

    describe('#substituteInString', function() {
        it('should replace a single variable', function() {
            const variableSubstitutor = new VariableSubstitutor()
            return variableSubstitutor.substituteInString('foo-${varName}-baz', {
                varName: 'bar'
            }).should.be.eql('foo-bar-baz')
        })

        it('should replace multiple variables', function() {
            const variableSubstitutor = new VariableSubstitutor()
            return variableSubstitutor.substituteInString('foo-${var1}-${var2}-bah-${var3}', {
                var1: 'bar',
                var2: 'baz',
                var3: 'boo'
            }).should.be.eql('foo-bar-baz-bah-boo')
        })

        it('should throw error on undefined variable', function() {
            const variableSubstitutor = new VariableSubstitutor()
            return chai.expect(() => variableSubstitutor.substituteInString('foo-${var1}-${var2}-bah-${var3}', {
                var1: 'bar',
                var2: 'baz'
            })).to.throw('Undefined variable in substitution: var3')
        })
    })

    describe('#substituteInArray', function() {
        it('should handle an empty array', function() {
            const variableSubstitutor = new VariableSubstitutor()
            return variableSubstitutor.substituteInArray([], 'store').should.be.eql([])
        })

        it('should handle every element of an array', function() {
            const variableSubstitutor = sinon.createStubInstance(VariableSubstitutor)
            variableSubstitutor.substituteInString.withArgs('${var1}', 'store').returns('val1')
            variableSubstitutor.substituteInString.withArgs('${var2}', 'store').returns('val2')
            variableSubstitutor.isString.callThrough()
            variableSubstitutor.isObject.callThrough()
            variableSubstitutor.containsSubstitution.callThrough()
            variableSubstitutor.substituteInArray.callThrough()
            variableSubstitutor.substituteInObject.callThrough()
            return variableSubstitutor.substituteInArray([
                '${var1}', '${var2}', 'val3', [], {}
            ], 'store').should.be.eql([
                'val1', 'val2', 'val3', [], {}
            ])
                && variableSubstitutor.substituteInString.should.have.been.calledTwice
                && variableSubstitutor.substituteInObject.should.have.been.calledOnce
                && variableSubstitutor.substituteInArray.should.have.been.calledOnce
        })
    })

    describe('#substituteInObject', function() {
        it('should handle an empty object', function() {
            const variableSubstitutor = new VariableSubstitutor()
            return variableSubstitutor.substituteInObject({}, 'store').should.be.eql({})
        })

        it('should handle an object with string properties', function() {
            const variableSubstitutor = sinon.createStubInstance(VariableSubstitutor)
            variableSubstitutor.containsSubstitution.callThrough()
            variableSubstitutor.isString.callThrough()
            variableSubstitutor.substituteInString.withArgs('${var1}', 'store').returns('val1')
            variableSubstitutor.substituteInString.withArgs('${var2}', 'store').returns('val2')
            variableSubstitutor.substituteInString.withArgs('${var3}', 'store').returns('val3')
            variableSubstitutor.substituteInObject.callThrough()
            return variableSubstitutor.substituteInObject({
                key1: '${var1}',
                key2: '${var2}',
                key3: '${var3}',
                key4: 'val4',
                key5: 42
            }, 'store').should.be.eql({
                key1: 'val1',
                key2: 'val2',
                key3: 'val3',
                key4: 'val4',
                key5: 42
            })
                && variableSubstitutor.substituteInString.getCalls().length.should.be.eql(3)
        })

        it('should handle a nested object', function() {
            const variableSubstitutor = sinon.createStubInstance(VariableSubstitutor)
            variableSubstitutor.containsSubstitution.callThrough()
            variableSubstitutor.isString.callThrough()
            variableSubstitutor.isObject.callThrough()
            variableSubstitutor.substituteInString.withArgs('${var1}', 'store').returns('val1')
            variableSubstitutor.substituteInString.withArgs('${var2}', 'store').returns('val2')
            variableSubstitutor.substituteInString.withArgs('${var3}', 'store').returns('val3')
            variableSubstitutor.substituteInObject.callThrough()
            return variableSubstitutor.substituteInObject({
                key1: '${var1}',
                key2: { subkey1: '${var2}' },
                key3: { subkey2: { subkey3: '${var3}' } }
            }, 'store').should.be.eql({
                key1: 'val1',
                key2: { subkey1: 'val2' },
                key3: { subkey2: { subkey3: 'val3' } }
            })
                && variableSubstitutor.substituteInString.getCalls().length.should.be.eql(3)
        })

        it('should handle an object with array properties', function() {
            const variableSubstitutor = sinon.createStubInstance(VariableSubstitutor)
            variableSubstitutor.containsSubstitution.callThrough()
            variableSubstitutor.isString.callThrough()
            variableSubstitutor.isArray.callThrough()
            variableSubstitutor.isObject.callThrough()
            variableSubstitutor.substituteInString.withArgs('${var1}', 'store').returns('val1')
            variableSubstitutor.substituteInString.withArgs('${var2}', 'store').returns('val2')
            variableSubstitutor.substituteInString.withArgs('${var3}', 'store').returns('val3')
            variableSubstitutor.substituteInArray.callThrough()
            variableSubstitutor.substituteInObject.callThrough()
            return variableSubstitutor.substituteInObject({
                key1: '${var1}',
                key2: ['${var2}'],
                key3: [['${var3}']],
            }, 'store').should.be.eql({
                key1: 'val1',
                key2: ['val2'],
                key3: [['val3']]
            })
                && variableSubstitutor.substituteInString.getCalls().length.should.be.eql(3)
        })

    })
})
