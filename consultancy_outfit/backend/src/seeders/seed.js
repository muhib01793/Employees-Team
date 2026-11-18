import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Company from '../models/Company.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clean existing data
    await User.deleteMany({});
    await Company.deleteMany({});

    // Create Admin User
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      phone: '+1234567890',
      designation: 'Platform Admin',
      role: 'admin',
    });

    // Create Demo Company
    const demoCompany = await Company.create({
      name: 'Acme Consultancy',
      slug: 'acme-consultancy',
      description: 'Professional Tech & Strategy Consultancy',
      owner: adminUser._id,
      members: [
        {
          user: adminUser._id,
          role: 'admin',
        },
      ],
    });

    adminUser.companies.push(demoCompany._id);
    await adminUser.save();

    console.log('✅ Seeding completed successfully!');
    console.log('-----------------------------------');
    console.log('📧 Demo Email:    admin@example.com');
    console.log('🔑 Demo Password: password123');
    console.log('-----------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
