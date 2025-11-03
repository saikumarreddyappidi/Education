// src/index.ts
import dotenv from 'dotenv';
import path from 'path';

// Configure dotenv to load the .env file from the `backend` directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Dynamically import the server to ensure env vars are loaded first
import('./server').then(serverModule => {
  serverModule.startServer();
}).catch(err => {
  console.error('Failed to start server from index.ts:', err);
  process.exit(1);
});
