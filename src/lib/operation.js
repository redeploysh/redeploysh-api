const readOperations = [
    'read'
]
const writeOperations = [
    'create', 'update', 'archive'
]

class Operation {
    constructor({ id, type, op, key, data }) {
        this.id = id
        this.type = this.splitType(type).type
        this.version = this.splitType(type).version
        this.op = op
        this.key = key
        this.data = data
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
            const substitutions = this.key[keyProperty].match(/(\$\{[\w-]+\:[\w-]+\})/g) || []
            substitutions.forEach(substitution => this.substitutions.push(substitution.match(/\$\{([\w-]+)\:([\w-]+)\}/)[1]))
        })
        Object.keys(this.data || {}).filter((dataProperty) => {
            const substitutions = this.data[dataProperty].match(/(\$\{[\w-]+\:[\w-]+\})/g) || []
            substitutions.forEach(substitution => this.substitutions.push(substitution.match(/\$\{([\w-]+)\:([\w-]+)\}/)[1]))
        })
        return this.substitutions
    }

    splitType(type) {
        return {
            type: type.split(':')[0],
            version: type.split(':')[1]
        }
    }

    dependsOn(otherOperation) {
        const { id } = otherOperation
        const dependencies = this.getDependencies()
        return dependencies.filter(dependency => dependency === id).length > 0
    }
}

module.exports = { Operation }