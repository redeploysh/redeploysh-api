class OperationSorter {
    constructor({ graph }) {
        this.graph = graph
    }

    sortOperations(operations) {
        const graph = this.graph()
        operations.forEach((op) => {
            const dependencies = op.getDependencies()
            if (dependencies && dependencies.length > 0) {
                graph.addNode(op.id)
                op.getDependencies().forEach((dependencyName) => {
                    operations.forEach((otherOp) => {
                        if (otherOp.returnValues && Object.keys(otherOp.returnValues).includes(dependencyName)) {
                            graph.addNode(otherOp.id)
                            graph.addEdge(op.id, otherOp.id)
                        }
                    })
                })
            }
        })
        try {
            const independent = operations.filter(op => !graph.nodes().includes(op.id))
            return graph.depthFirstSearch(undefined, true, true).map(id => operations.filter(op => op.id === id)[0]).concat(independent)
        } catch (err) {
            throw new Error('Circular dependency')
        }
    }
}

module.exports = OperationSorter