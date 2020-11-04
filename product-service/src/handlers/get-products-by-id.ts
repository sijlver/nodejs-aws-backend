import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;
const dbOptions = {
    host: PG_HOST,
    port: PG_PORT,
    database: PG_DATABASE,
    user: PG_USERNAME,
    password: PG_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 5000
};
const DEFAULT_HEADERS = {
  'Access-Control-Allow-Origin': '*'
};

const getProductsById: APIGatewayProxyHandler = async event => {
  console.log('Event data: ', event)
  let body;
  let statusCode = 200;
  const client = new Client(dbOptions);

  try {
    await client.connect();
    console.log('DB was successfully connected!');

    const { productId } = event.pathParameters || {};
    const { rows: product } = await client.query(`SELECT * FROM products WHERE id=$1`, [productId]);
    console.log('Product was successfully selected!');

    body = product[0];
  } catch (err) {
    console.error('Error during database request executing:', err);

    statusCode = 500;
    body = err;
  } finally {
    client.end();
  }

  return  ({
    statusCode,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(body)
  });
};


export default getProductsById;
