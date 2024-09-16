const { InvalidTypeError } = require('../errors')

const types = {
    'user': {
        '1.0.0': {
            keyPropertyA: 'emailAddress'
        }
    },
    'deployment': {
        '1.0.0': {
            keyPropertyA: 'id'
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