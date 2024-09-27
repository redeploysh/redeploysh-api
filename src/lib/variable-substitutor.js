const { InvalidOperationError } = require('../errors')

class VariableSubstitutor {

    isString(value) {
        return (typeof value === 'string' || value instanceof String)
    }

    isArray(value) {
        return (typeof value === 'array') || Array.isArray(value)
    }

    isObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]'
    }

    containsSubstitution(stringValue) {
        const re = /\$\{[-\w]+\}/
        return (stringValue.match(re) != null)
    }

    substituteInString(stringValue, store) {
        const substitutions = {}
        Object.keys(store).forEach((variableReference) => {
            substitutions[variableReference] = store[variableReference]
        })
        const re = new RegExp(`\\$\\{[-\\w]+\\}`, "g")
        return stringValue.replace(re, (matched) => {
            const key = matched.match(/\$\{(.+)\}/)[1]
            if (!key || !substitutions[key]) {
                throw new InvalidOperationError(`Undefined variable in substitution: ${key}`)
            }
            return substitutions[key]
        })
    }

    substituteInObject(obj, store) {
        let result = {}
        Object.keys(obj).forEach((key) => {
            if (this.isString(obj[key])) {
                result[key] = (this.containsSubstitution(obj[key]))
                    ? this.substituteInString(obj[key], store)
                    : obj[key]
            } else if (this.isArray(obj[key])) {
                result[key] = this.substituteInArray(obj[key], store)
            } else if (this.isObject(obj[key])) {
                result[key] = this.substituteInObject(obj[key], store)
            } else {
                result[key] = obj[key]
            }
        })
        return result
    }

    substituteInArray(arr, store) {
        return arr.map((elem) => {
            if (this.isString(elem)) {
                return (this.containsSubstitution(elem))
                    ? this.substituteInString(elem, store)
                    : elem
            } else if (this.isArray(elem)) {
                return this.substituteInArray(elem, store)
            } else if (this.isObject(elem)) {
                return this.substituteInObject(elem, store)
            } else {
                return elem
            }
        })
    }
}

module.exports = VariableSubstitutor