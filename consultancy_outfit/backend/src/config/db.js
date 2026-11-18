import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('⚠️ Warning: MONGO_URI is not defined in environment variables.');
    return;
  }
  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️ Database Connection Warning: ${error.message}`);
    console.error(`👉 Ensure MongoDB Atlas cluster is active and IP 0.0.0.0/0 is allowed`);
  }
};

export default connectDB;
