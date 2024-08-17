class OperationSorter {
    constructor({ graph }) {
        this.graph = graph
    }

    sortOperations(operations) {
        const opsGraph = this.graph()
        Object.values(operations).forEach((op) => {
            opsGraph.addNode(op.id)
            op.getDependencies().forEach((dependencyId) => {
                opsGraph.addNode(dependencyId)
                opsGraph.addEdge(op.id, dependencyId)
            })
        })
        try {
            return opsGraph.depthFirstSearch(undefined, true, true).map(id => operations[id])
        } catch (err) {
            throw new Error('Circular dependency')
        }
    }
}

module.exports = { OperationSorter }