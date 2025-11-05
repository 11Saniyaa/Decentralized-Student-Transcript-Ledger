import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Remove deprecated options
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error; // Re-throw so caller can handle it
  }
};

