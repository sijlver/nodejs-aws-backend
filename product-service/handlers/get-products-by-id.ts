import { APIGatewayProxyHandler } from 'aws-lambda';

import productsList from '../mocks/productList.json';

const DEFAULT_HEADERS = {
  'Access-Control-Allow-Origin': '*'
};
let products = null;

const getProduct = productId => {
  if (!products) {
    products = productsList.reduce((acc, item) => {
      acc[item.id] = item;

      return acc;
    }, {});
  }

  const product = products[productId];

  if (!product) {
    const error = new Error("Bad request!");

    error.statusCode = 400;
    error.message = "Product wasn't found found!";

    throw error;
  }

  return product;
}

const getProductsById: APIGatewayProxyHandler = async (event) => {
  try {
    const { productId } = event.pathParameters || {};
    const product = getProduct(productId);

    return ({
      statusCode: 200,
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(product)
    });
  } catch(err) {
    return ({
      statusCode: err.statusCode || 500,
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        message: err.message || 'Internal Server Error!'
      })
    })
  };
};


export default getProductsById;
