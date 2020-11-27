import type { Serverless } from 'serverless/aws';

import { DB_CREDENTIALS } from './credentials';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'product-service',
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
      ...DB_CREDENTIALS,
      PG_HOST: 'nodejs-aws-rds-db.cycqq7bcr6uq.eu-west-1.rds.amazonaws.com',
      PG_PORT: 5432,
      PG_DATABASE: 'store',
      SQS_REGION: 'eu-west-1',
      SQS_URL: {
        Ref: 'catalogItemsQueue'
      },
      SNS_REGION: 'eu-west-1',
      SNS_ARN: {
        Ref: 'createProductTopic'
      }
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 'sqs:*',
        Resource: {
          'Fn::GetAtt': [ 'catalogItemsQueue', 'Arn' ]
        }
      },
      {
        Effect: 'Allow',
        Action: 'sns:*',
        Resource: {
          Ref: 'createProductTopic'
        }
      }
    ],
  },
  resources: {
    Resources: {
      catalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalog-items-queue',
          ReceiveMessageWaitTimeSeconds: 20
        }
      },
      createProductTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'create-product-topic'
        }
      },
      createProductDataSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'sijlver@mail.ru',
          Protocol: 'email',
          TopicArn: {
            Ref: 'createProductTopic'
          },
          FilterPolicy: {
            status: ['data']
          }
        }
      },
      createProductEndSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'Igor_Tsialiuk@epam.com',
          Protocol: 'email',
          TopicArn: {
            Ref: 'createProductTopic'
          },
          FilterPolicy: {
            status: ['end']
          }
        }
      }
    },
    Outputs: {
      CatalogItemsQueueUrl: {
        Value: {
          Ref: 'catalogItemsQueue'
        }
      }
    }
  },
  functions: {
    getProductsList: {
      handler: 'handler.getProductsList',
      events: [
        {
          http: {
            method: 'get',
            path: '/products',
            cors: true
          }
        }
      ]
    },
    getProductsById: {
      handler: 'handler.getProductsById',
      events: [
        {
          http: {
            method: 'get',
            path: '/products/{productId}',
            cors: true
          }
        }
      ]
    },
    postProducts: {
      handler: 'handler.postProducts',
      events: [
        {
          http: {
            method: 'post',
            path: '/products',
            cors: true
          }
        }
      ]
    },
    catalogBatchProcess: {
      handler: 'handler.catalogBatchProcess',
      events: [
        {
          sqs: {
            batchSize: 5,
            arn: {
              'Fn::GetAtt': [ 'catalogItemsQueue', 'Arn' ]
            }
          }
        }
      ]
    }
  }
}

module.exports = serverlessConfiguration;
