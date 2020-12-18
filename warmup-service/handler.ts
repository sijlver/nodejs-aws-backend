import axios from 'axios';

export const getWarmup = async (event, _context, callback) => {
  if (event.source === 'serverless-plugin-warmup') {
    console.log('WarmUP - Lambda is warm!');

    return callback(null, 'Lambda is warm!');
  }

  const { data } = await axios.get('https://official-joke-api.appspot.com/random_joke');

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
}
