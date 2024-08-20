class Injector {
    constructor(dependencies) {
        this.dependencies = dependencies
    }

    resolve(name) {
        return this.dependencies[name](this)
    }
}

module.exports = { Injector }