class Logger {
    constructor(device = console) {
        this.logDevice = device
    }

    log(message) {
        this.logDevice.log(message)
    }

    error(message) {
        this.logDevice.error(message)
    }
}

module.exports = Logger