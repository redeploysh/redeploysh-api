const { Router } = require('./framework'),
    handlers = require('./handlers'),
    { DynamoAdaptor, Logger, OperationSorter } = require('./lib'),
    parsers = require('./parsers'),
    { Graph } = require('graph-data-structure'),
    { DynamoDBClient } = require('@aws-sdk/client-dynamodb')

const routes = {
    'GET/v1/types/{type}/{version}': {
        parser: 'ApiGatewayPathParamsParser',
        handler: 'TypeInfoHandler'
    },
    'POST/v1/data': {
        parser: 'ApiGatewayJsonParser',
        handler: 'BatchOperationsHandler'
    }
}

module.exports = {
    logger: () => new Logger(),
    router: inj => new Router({
        routes: inj.resolve('routes')
    }),
    parsers: parsers.map(Parser => (inj => (new Parser({ logger: inj.resolve('logger') })))),
    handlers: {
        NotImplementedHandler: inj => new handlers.NotImplementedHandler({ logger: inj.resolve('logger') }),
        BatchOperationsHandler: inj => new handlers.BatchOperationsHandler({
            logger: inj.resolve('logger'),
            dynamoAdaptor: inj.resolve('dynamoAdaptor'),
            operationSorter: inj.resolve('operationSorter'),
            typeRegistry: inj.resolve('typeRegistry')
        }),
        TypeInfoHandler: inj => new handlers.TypeInfoHandler({
            typeRegistry: typeRegistry,
            logger: inj.resolve('logger')
        })
    },
    routes,
    dynamoAdaptor: inj => new DynamoAdaptor({
        dynamoDBClient: new DynamoDBClient({}),
        typeRegistry: inj.resolve('typeRegistry')
    }),
    operationSorter: new OperationSorter({
        graph: Graph
    }),
    typeRegistry: new TypeRegistry()
}