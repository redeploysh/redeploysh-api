const handler = (event, context) => {
    return {
        principalId: 'some-user',
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: 'Allow',
                    Resource: event.methodArn
                }
            ]
        }
    }
}

module.exports = { handler }