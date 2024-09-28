const handlers = require('./handlers'),
    { OperationProcessor, OperationSorter, VariableSubstitutor } = require('./lib'),
    { DynamoAdaptor } = require('./adaptors'),
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
        dynamoAdaptor: inj.resolve('dynamoAdaptor'),
    }),
    dynamoAdaptor: inj => new DynamoAdaptor({
        dynamoDBClient: new DynamoDBClient({}),
        dataTableName: process.env['DATA_TABLE_NAME']
    }),
    operationProcessor: inj => new OperationProcessor({
        dynamoAdaptor: inj.resolve('dynamoAdaptor'),
        operationSorter: inj.resolve('operationSorter'),
        variableSubstitutor: inj.resolve('variableSubstitutor')
    }),
    operationSorter: inj => new OperationSorter({
        graph: Graph
    }),
    variableSubstitutor: inj => new VariableSubstitutor()
}