const express = require('express');
const fs = require('fs');
const util = require('util');
const path = require('path');

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const app = express();
const port = process.env.PORT || 3000;
const url = path.join(__dirname, './data/index.txt');

app.get('/favicon.ico', (req, res) => res.send(''));

app.get('*', async (req, res) => {
  const data = await readFile(url, { encoding: 'utf-8' }).catch(err => {
    console.log('Read file: ', err);

    return 1;
  });
  const count = Number(data) + 1;

  await writeFile(url, count).catch(console.log);

  res.send(`I'm server! Count: ${count}`);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));