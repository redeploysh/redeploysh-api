const handlers = require('./handlers'),
    { OperationProcessor, OperationSorter, VariableSubstitutor } = require('./lib'),
    { DynamoAdaptor, TypeRegistry } = require('./adaptors'),
    { ApiGatewayJsonParser, ApiGatewayPathParamsParser } = require('./parsers'),
    { Graph } = require('graph-data-structure'),
    { DynamoDBClient } = require('@aws-sdk/client-dynamodb')

module.exports = {
    apiGatewayJsonParser: inj => new ApiGatewayJsonParser(),
    apiGatewayPathParamsParser: inj => new ApiGatewayPathParamsParser(),
    notImplementedHandler: inj => new handlers.NotImplementedHandler(),
    batchOperationsHandler: inj => new handlers.BatchOperationsHandler({
        dynamoAdaptor: inj.resolve('dynamoAdaptor'),
        operationProcessor: inj.resolve('operationProcessor')
    }),
    typeInfoHandler: inj => new handlers.TypeInfoHandler({
        typeRegistry: inj.resolve('typeRegistry')
    }),
    dynamoAdaptor: inj => new DynamoAdaptor({
        dynamoDBClient: new DynamoDBClient({}),
        typeRegistry: inj.resolve('typeRegistry'),
        dataTableName: process.env['DATA_TABLE_NAME']
    }),
    operationProcessor: inj => new OperationProcessor({
        dynamoAdaptor: inj.resolve('dynamoAdaptor'),
        typeRegistry: inj.resolve('typeRegistry'),
        operationSorter: inj.resolve('operationSorter'),
        variableSubstitutor: inj.resolve('variableSubstitutor')
    }),
    operationSorter: inj => new OperationSorter({
        graph: Graph
    }),
    typeRegistry: inj => new TypeRegistry({
        dynamoAdaptor: inj => inj.resolve('dynamoAdaptor')
    }),
    variableSubstitutor: inj => new VariableSubstitutor()
}