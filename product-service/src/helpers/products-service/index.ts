import { Client } from 'pg';

import CustomError from '../errors';

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

export const addProduct = async ({ product, options = dbOptions }) => {
  const client = new Client(options);
  const { count, title, description, price } = product;

  try {
    if (!count || !title || !description || !price) {
      throw new CustomError('Product data is invalid', 400);
    }

    await client.connect();
    console.log('DB was successfully connected!');

    await client.query('BEGIN');
    console.log('Transaction began!');

    const { rows: [{ id }] } = await client.query(`INSERT INTO products (title, description, price) VALUES ($1, $2, $3) RETURNING id`, [title, description, price]);
    console.log('Product was successfully added!');

    await client.query(`INSERT INTO stocks (product_id, count) VALUES ($1, $2)`, [id, count]);
    console.log('Stock was successfully added!');

    const { rows: products } = await client.query(`SELECT products.*, stocks.count FROM products INNER JOIN stocks ON products.id=stocks.product_id`);
    console.log('Products with count were successfully selected!');

    await client.query('COMMIT')
    client.end();

    return products;
  } catch (err) {
    await client.query('ROLLBACK')
    client.end();
    
    throw err;
  }
};
