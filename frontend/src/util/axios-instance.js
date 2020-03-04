
const axios = require('axios');
const http = require('http');
const https = require('https');

module.exports = axios.create({
  timeout: 600000,
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  maxRedirects: 10,
  maxContentLength: 50 * 1000 * 1000
});