import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️ Database Connection Warning: ${error.message}`);
    console.error(`👉 Ensure MongoDB is running or check MONGO_URI in .env`);
  }
};

export default connectDB;