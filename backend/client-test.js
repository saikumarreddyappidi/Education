const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 3005,
  path: '/',
  method: 'GET',
  timeout: 5000  // 5 second timeout
};

console.log('Attempting to connect...');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    console.log(`Response: ${chunk}`);
  });
});

req.on('error', (error) => {
  console.error(`Error details: ${error.message}`);
  if (error.code) {
    console.error(`Error code: ${error.code}`);
  }
});

req.on('timeout', () => {
  console.error('Request timed out');
  req.destroy();
});

req.end();