import type { Serverless } from 'serverless/aws';

import { USER_CREDENTIALS } from './credentials';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'import-service',
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
      ...USER_CREDENTIALS,
      S3_BUCKET_NAME: 'nodejs-aws-backend-products',
      S3_BUCKET_FOLDER_UPLOADED: 'uploaded',
      S3_BUCKET_FOLDER_PARSED: 'parsed',
      S3_BUCKET_CONTENT_TYPE: 'text/csv',
      S3_BUCKET_REGION: 'eu-west-1',
      S3_BUCKET_SIGNED_URL_EXPIRES: 60
    },
    iamRoleStatements: [{
      Effect: 'Allow',
      Action: 's3:ListBucket',
      Resource: 'arn:aws:s3:::nodejs-aws-backend-products'
    },
    {
      Effect: 'Allow',
      Action: 's3:*',
      Resource: 'arn:aws:s3:::nodejs-aws-backend-products/*'
    }]
  },
  functions: {
    getImportProductsFile: {
      handler: 'handler.getImportProductsFile',
      events: [
        {
          http: {
            method: 'get',
            path: '/import',
            cors: true,
            request: {
              parameters: {
                querystrings: {
                  name: true
                }
              }
            }
          }
        }
      ]
    },
    importFileParser: {
      handler: 'handler.importFileParser',
      events: [{
        s3: {
          bucket: 'nodejs-aws-backend-products',
          event: 's3:ObjectCreated:*',
          rules: [{ prefix: 'uploaded/', suffix: '.csv' }],
          existing: true
        }
      }]
    }
  }
}

module.exports = serverlessConfiguration;
