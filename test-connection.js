try {
  const http = require('http');
  
  const options = {
    hostname: '127.0.0.1',
    port: 3001,
    path: '/',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    
    res.on('data', (chunk) => {
      console.log(`BODY SNIPPET: ${chunk.toString().substring(0, 100)}...`);
    });
  });
  
  req.on('error', (e) => {
    console.error(`PROBLEM: ${e.message}`);
  });
  
  req.end();
} catch (error) {
  console.error('Error occurred:', error);
}
