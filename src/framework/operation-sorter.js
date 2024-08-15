const { Graph } = require('graph-data-structure')

class OperationSorter {
    sortOperations(operations) {
        const opsGraph = Graph()
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