import { APIGatewayProxyHandler } from 'aws-lambda';

import { addProduct } from '../helpers/products-service';

const DEFAULT_HEADERS = {
  'Access-Control-Allow-Origin': '*'
};

const postProducts: APIGatewayProxyHandler = async event =>  {
  console.log('Event data: ', event)
  let body;
  let statusCode = 200;

  try {
    const product = JSON.parse(event.body);

    body = await addProduct({ product });

  } catch (err) {
    statusCode = err.statusCode || 500;
    body = err;
  }

  return  ({
    statusCode,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(body)
  });
};


export default postProducts;
