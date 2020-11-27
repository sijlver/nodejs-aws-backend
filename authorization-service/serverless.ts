import type { Serverless } from 'serverless/aws';

import { DB_CREDENTIALS } from './credentials';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'authorization-service',
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    region: 'eu-west-1',
    profile: 'default',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      ...DB_CREDENTIALS
    }
  },
  resources: {
    Resources: {},
    Outputs: {
      basicAuthorizerArn: {
        Value: {
          'Fn::GetAtt': ['BasicAuthorizerLambdaFunction', 'Arn'],
        }
      }
    }
  },
  functions: {
    basicAuthorizer: {
      handler: 'handler.basicAuthorizer'
    }
  }
}

module.exports = serverlessConfiguration;
