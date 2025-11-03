const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Received request');
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!');
});

const port = 3005;
server.listen(port, '127.0.0.1', () => {
  console.log(`Basic test server running at http://127.0.0.1:${port}`);
});

// Error handling
server.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});