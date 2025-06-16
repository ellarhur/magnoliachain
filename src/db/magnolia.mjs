import AppError from '../middleware/appError.mjs';
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('MONGO_URI:', process.env.MONGO_URI);
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI är inte definierad i miljövariablerna');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    if (conn) {
      console.log(`MongoDB ansluten: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error('MongoDB anslutningsfel:', error.message);
    throw new AppError(error.message, 500);
  }
};

export default connectDB;
