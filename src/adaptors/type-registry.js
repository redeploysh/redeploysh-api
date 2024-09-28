const { InvalidTypeError } = require('../errors')

const types = {
    'type': {
        '1.0.0': {
            keyPropertyA: 'type',
            keyPropertyB: 'version'
        }
    }
}

class TypeRegistry {

    constructor({ dynamoAdaptor }) {
        this.dynamoAdaptor = dynamoAdaptor
    }

    async getType(type, version) {
        if (types[type] && types[type][version]) {
            return {
                keyProperties: types[type][version]
            }
        }

        const typeData = await this.dynamoAdaptor.get({
            'type': 'type',
            'version': '1.0.0',
            key: {
                type,
                version
            }
        })

        if (!typeData) {
            throw new InvalidTypeError(type, version)
        }

        return {
            keyProperties: typeData.keyProperties
        }
    }

    async createTypes(definitions) {
        const writeOperations = definitions.map((def) => {
            return {
                op: 'create',
                type: 'type',
                version: '1.0.0',
                data: {
                    type: def.type,
                    version: def.version,
                    keyProperties: def.keyProperties
                }
            }
        })

        return await this.dynamoAdaptor.batchWrite(writeOperations)
    }
}

module.exports = TypeRegistry