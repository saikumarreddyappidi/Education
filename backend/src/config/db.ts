import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

const connectDB = async () => {
  try {
    let mongoUri;

    if (process.env.NODE_ENV === 'test' || process.env.USE_MEMORY_DB === 'true') {
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log('Using in-memory MongoDB');
    } else {
      mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error('MONGO_URI or MONGODB_URI not defined in environment variables');
      }
      console.log('Connecting to MongoDB...');
    }

    await mongoose.connect(mongoUri);

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const closeDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      console.log('In-memory MongoDB server stopped.');
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

export { connectDB, closeDB };
