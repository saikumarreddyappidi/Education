import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Default admin user to create
const defaultUsers = [
  {
    registrationNumber: 'ADMIN',
    password: 'Admin@123',
    role: 'staff',
    year: '2025',
    semester: '1',
    subject: 'Administration',
    teacherCode: 'ADMIN123'
  },
  {
    registrationNumber: 'STAFF123',
    password: 'Staff@123',
    role: 'staff',
    year: '2025',
    semester: '1',
    subject: 'Mathematics',
    teacherCode: 'MATH123'
  },
  {
    registrationNumber: 'STU001',
    password: 'Student@123',
    role: 'student',
    year: '2025',
    semester: '1',
    course: 'Computer Science'
  }
];

export async function setupMemoryDatabase() {
  // Start MongoDB memory server
  const mongod = new MongoMemoryServer();
  await mongod.start();
  const uri = mongod.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(uri);
  console.log('Connected to in-memory MongoDB');
  
  // Create admin users
  try {
    // Get the User model
    const User = mongoose.model('User');
    
    // Check if users already exist
    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ registrationNumber: userData.registrationNumber });
      
      if (!existingUser) {
        // Hash the password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        // Create the user
        const newUser = new User({
          ...userData,
          password: hashedPassword
        });
        
        await newUser.save();
        console.log(`Created default user: ${userData.registrationNumber}`);
      }
    }
    
    console.log('Default users setup completed');
  } catch (error) {
    console.error('Error setting up default users:', error);
  }
  
  // Return the mongod instance
  return mongod;
}
