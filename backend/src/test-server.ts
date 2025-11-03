import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5003;

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Basic authentication endpoint
app.post('/api/auth/register', (req, res) => {
    res.json({ success: true, message: 'Test registration successful' });
});

app.post('/api/auth/login', (req, res) => {
    res.json({ success: true, message: 'Test login successful' });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});