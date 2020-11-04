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

const getProductsList: APIGatewayProxyHandler = async event =>  {
  console.log('Event data: ', event);
  let body;
  let statusCode = 200;
  const client = new Client(dbOptions);

  try {
    await client.connect();
    console.log('DB was successfully connected!');

    const { rows: products } = await client.query(`SELECT products.*, stocks.count FROM products INNER JOIN stocks ON products.id=stocks.product_id`);
    console.log('Products with count were successfully selected!');

    body = products;
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


export default getProductsList;
