const axios = require('axios');

exports.getLayer = async (event, _context, callback) => {
  console.log('Event: ', event);

  const { data } = await axios.get('https://official-joke-api.appspot.com/random_joke');

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
}
