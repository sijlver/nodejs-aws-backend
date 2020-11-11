import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';

import CustomError from '../helpers/errors';

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

const postProducts: APIGatewayProxyHandler = async event =>  {
  console.log('Event data: ', event)
  let body;
  let statusCode = 200;
  const client = new Client(dbOptions);

  try {
    await client.connect();
    console.log('DB was successfully connected!');

    await client.query('BEGIN');
    console.log('Transaction began!');

    const { count, title, description, price } = JSON.parse(event.body);

    if (!count || !title || !description || !price) {
      throw new CustomError('Product data is invalid', 400);
    }

    const { rows: [{ id }] } = await client.query(`INSERT INTO products (title, description, price) VALUES ($1, $2, $3) RETURNING id`, [title, description, price]);
    console.log('Product was successfully added!');

    await client.query(`INSERT INTO stocks (product_id, count) VALUES ($1, $2)`, [id, count]);
    console.log('Stock was successfully added!');

    const { rows: products } = await client.query(`SELECT products.*, stocks.count FROM products INNER JOIN stocks ON products.id=stocks.product_id`);
    console.log('Products with count were successfully selected!');

    body = products;

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Error during database request executing:', err);

    statusCode = err.statusCode || 500;
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


export default postProducts;
