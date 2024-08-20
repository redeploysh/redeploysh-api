const handler = (event, context) => {
    console.log(`in authorizer: ${JSON.stringify(event)}`)
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
        },
        context: {
            var: 'value'
        }
    }
}

module.exports = { handler }