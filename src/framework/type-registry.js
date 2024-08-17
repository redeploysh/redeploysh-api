const { InvalidTypeError } = require('../errors')

const types = {
    'test-type': {
        'test-version': {
            keyPropertyA: 'some-propA',
            keyPropertyB: 'some-propB'
        }
    },
    'test-type-one-key': {
        'test-version': {
            keyPropertyA: 'some-propA'
        }
    },
    'test-type-three-keys': {
        'test-version': {
            keyPropertyA: 'some-propA',
            keyPropertyB: 'some-propB',
            keyPropertyC: 'some-propC'
        }
    }
}

class TypeRegistry {
    getType(type, version) {
        if (!types[type] || !types[type][version]) {
            throw new InvalidTypeError(type, version)
        }
        return types[type][version]
    }
}

module.exports = TypeRegistry