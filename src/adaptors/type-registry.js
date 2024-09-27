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
            let keyProperties = {
                keyPropertyA: def.keyProperties.keyPropertyA
            }
            if (def.keyProperties.keyPropertyB) {
                keyProperties.keyPropertyB = def.keyProperties.keyPropertyB
            }
            if (def.keyProperties.keyPropertyC) {
                keyProperties.keyPropertyC = def.keyProperties.keyPropertyC
            }

            return {
                op: 'create',
                type: 'type',
                version: '1.0.0',
                data: {
                    type: def.type,
                    version: def.version,
                    keyProperties
                    // ,
                    // validations: def.validations.map((validation) => {
                    //     if (validation.expression) {
                    //         return {
                    //             property: validation.property,
                    //             expression: validation.expression
                    //         }
                    //     } else if (validation.validators) {
                    //         return {
                    //             property: validation.property,
                    //             validators: validation.validators
                    //         }
                    //     } else {
                    //         throw new InvalidTypeError(`Specify 'expression' or 'validators' in your definitions if 'validations' is present`)
                    //     }
                    // })
                }
            }
        })

        return await this.dynamoAdaptor.batchWrite(writeOperations)
    }
}

module.exports = TypeRegistry