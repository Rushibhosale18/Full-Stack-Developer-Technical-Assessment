import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export const connectDB = async () => {
  let uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-knowledge-base';
  
  try {
    console.log(`Attempting to connect to MongoDB at ${uri}...`);
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.log(`Failed to connect to ${uri}. Falling back to in-memory MongoDB...`);
    
    try {
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);
      console.log('Note: Data will be lost when the server restarts.');
    } catch (memoryError: any) {
      console.error(`Error starting in-memory DB: ${memoryError.message}`);
      process.exit(1);
    }
  }
};
