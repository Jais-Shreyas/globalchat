import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.VITE_MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully!");
  } catch (e) {
    console.error("MongoDB connection failed.");
    throw e;
  }
};
