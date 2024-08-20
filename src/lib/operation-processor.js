class OperationProcessor {
    constructor({ dynamoAdaptor, typeRegistry, operationSorter }) {
        this.dynamoAdaptor = dynamoAdaptor
        this.typeRegistry = typeRegistry
        this.operationSorter = operationSorter
    }

    process(operations) {
        const substitutions = {}
        const reads = operationSorter.sortOperations(operations.filter(op => op.isReadOperation()))
        const readsWithKeys = reads.map((read) => {
            const typeMetadata = this.typeRegistry.getType(read.type, read.version)
            let key = {}
            Object.values(typeMetadata).forEach((keyPropertyName) => {
                key[keyPropertyName] = read.data[keyPropertyName]
            })
            return {
                id: read.id,
                type: read.type,
                version: read.version,
                key
            }
        })



        this.dynamoAdaptor
            .batchRead(readsWithKeys
            }))
            .then((items) => {
                items.forEach((item) => {

                })
            })

        const writes = operations.filter(op => !op.isReadOperation())


    }
}

module.exports = OperationProcessor