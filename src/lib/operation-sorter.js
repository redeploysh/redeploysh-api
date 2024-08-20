class OperationSorter {
    constructor({ graph }) {
        this.graph = graph
    }

    sortOperations(operations) {
        const opsGraph = this.graph()

        operations.forEach((op) => {
            op.getDependencies().forEach((dependencyName) => {
                operations.forEach((otherOp) => {
                    if (otherOp.returnValues && Object.keys(otherOp.returnValues).includes(dependencyName)) {
                        opsGraph.addNode(op.id)
                        opsGraph.addNode(otherOp.id)
                        opsGraph.addEdge(op.id, otherOp.id)
                    }
                })
            })
        })
        try {
            return opsGraph.depthFirstSearch(undefined, true, true).map(id => operations.filter(op => op.id === id)[0])
        } catch (err) {
            throw new Error('Circular dependency')
        }
    }
}

module.exports = { OperationSorter }