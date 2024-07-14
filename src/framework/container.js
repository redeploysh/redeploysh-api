class Container {
    constructor(dependencies) {
        this.dependencies = dependencies
    }

    resolve(name) {
        return this.dependencies[name](this)
    }
}

module.exports = { Container }