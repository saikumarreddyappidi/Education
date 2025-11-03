const express = require('express');
const cors = require('cors');
const http = require('http');

const app = express();
const PORT = 5003;

// Enable CORS and JSON parsing
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() });
});

// Create HTTP server
const server = http.createServer(app);

// Handle errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.log('Port is already in use. Trying again...');
        setTimeout(() => {
            server.close();
            server.listen(PORT);
        }, 1000);
    }
});

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Prevent immediate exit
process.stdin.resume();

// Handle shutdown gracefully
function shutdown() {
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
}

// Handle various ways to terminate the process
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGHUP', shutdown);