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
      PG_DATABASE: 'store'
    },
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
    }
  }
}

module.exports = serverlessConfiguration;
