import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'warmup-service'
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  plugins: ['serverless-webpack', 'serverless-plugin-warmup'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    region: 'eu-west-1',
    profile: 'default',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 'lambda:InvokeFunction',
        Resource: '*'
      }
    ]
  },
  functions: {
    getWarmup: {
      handler: 'handler.getWarmup',
      warmup: true,
      events: [
        {
          http: {
            method: 'get',
            path: '/warmup',
          }
        }
      ]
    }
  }
}

module.exports = serverlessConfiguration;
