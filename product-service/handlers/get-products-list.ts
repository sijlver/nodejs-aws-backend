import { APIGatewayProxyHandler } from 'aws-lambda';
// import axios from 'axios';

import productsList from '../mocks/productList.json';

const DEFAULT_HEADERS = {
  'Access-Control-Allow-Origin': '*'
};

const getProductsList: APIGatewayProxyHandler = async () =>  {
  // const response = await axios.get('https://official-joke-api.appspot.com/random_joke');

  return  ({
      statusCode: 200,
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(productsList)
  })
};


export default getProductsList;
