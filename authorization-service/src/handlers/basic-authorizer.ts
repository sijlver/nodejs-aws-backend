const { TEST_USER, TEST_PASSWORD } = process.env;

const generatePolicy = (principalId, resource, effect = 'Allow') => ({
  principalId,
  policyDocument: {
    Version: '2012-10-17',
    Statement: [{
      Action: 'execute-api:Invoke',
      Effect: effect,
      Resource: resource
    }]
  }
});

const basicAuthorizer = async (event, _, callback) =>  {
  console.log(`Event data: ${JSON.stringify(event)}`);

  try {
    const { authorizationToken, methodArn } = event;
    const encodedCredentials = authorizationToken.split(' ')[1];
    const buffer = Buffer.from(encodedCredentials, 'base64');
    const [ username, password ] = buffer.toString('utf-8').split(':');

    console.log(`Username: ${username}, Password: ${password}`);

    const effect = username === TEST_USER && password === TEST_PASSWORD ? 'Allow' : 'Deny';
    const policy = generatePolicy(encodedCredentials, methodArn, effect);

    console.log(`Policy: ${JSON.stringify(policy)}`);

    callback(null, policy);
  } catch (err) {
    console.log(`Unauthorized: ${err}`);

    callback(`Unauthorized ${err.message}`);
  }
};


export default basicAuthorizer;
