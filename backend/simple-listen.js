const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Listening test');
});

const PORT = 4000;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Listening on http://127.0.0.1:${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error occurred:', err);
});

setInterval(() => {
  // keep process alive for observation
}, 1000);

server.on('close', () => {
  console.log('Server close event fired');
});

process.on('exit', (code) => {
  console.log(`Process exiting with code ${code}`);
});
