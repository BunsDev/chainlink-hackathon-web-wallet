const dotenv = require('dotenv');

dotenv.config();

// tiny wrapper with default env vars
module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3001,
  COINGECKO_API_KEY: process.env.COINGECKO_API_KEY,
};
