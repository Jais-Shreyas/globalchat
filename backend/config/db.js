import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully!");
  } catch (e) {
    console.error("MongoDB connection failed.");
    throw e;
  }
};
