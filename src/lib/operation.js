const readOperations = [
    'read'
]
const writeOperations = [
    'create', 'update', 'archive'
]

class Operation {
    constructor(operation, id) {
        const { type, op, key, data } = operation
        this.type = this.splitType(type).type
        this.version = this.splitType(type).version
        this.op = op
        this.key = key
        this.data = data
        this.returnValues = operation['return']
        this.id = id
    }

    isReadOperation() {
        return readOperations.includes(this.op)
    }

    getDependencies() {
        if (this.substitutions) {
            return this.substitutions
        }
        this.substitutions = []
        Object.keys(this.key || {}).filter((keyProperty) => {
            const substitutions = this.key[keyProperty].match(/(\$\{[\w-]+\})/g) || []
            substitutions.forEach(substitution => this.substitutions.push(substitution.match(/\$\{([\w-]+)\}/)[1]))
        })
        Object.keys(this.data || {}).filter((dataProperty) => {
            const substitutions = this.data[dataProperty].match(/(\$\{[\w-]+\})/g) || []
            substitutions.forEach(substitution => this.substitutions.push(substitution.match(/\$\{([\w-]+)\}/)[1]))
        })
        return this.substitutions
    }

    splitType(type) {
        return {
            type: type.split(':')[0],
            version: type.split(':')[1]
        }
    }
}

module.exports = { Operation }