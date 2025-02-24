const bcrypt = require('bcryptjs');
const { User, Cause } = require('../models');
const sequelize = require('../config/database');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected...');

    // Sync models
    await sequelize.sync({ force: true });
    console.log('Database synced...');

    // Create admin user
    const admin = await User.create({
      email: 'admin@artistsaid.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isVerified: true
    });
    console.log('Admin user created...');

    // Create verifier user
    const verifier = await User.create({
      email: 'verifier@artistsaid.com',
      password: 'verifier123',
      firstName: 'Verifier',
      lastName: 'User',
      role: 'verifier',
      isVerified: true
    });
    console.log('Verifier user created...');

    // Create financial admin
    const financial = await User.create({
      email: 'financial@artistsaid.com',
      password: 'financial123',
      firstName: 'Financial',
      lastName: 'Admin',
      role: 'financial',
      isVerified: true
    });
    console.log('Financial admin created...');

    // Create artist user
    const artist = await User.create({
      email: 'artist@example.com',
      password: 'artist123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'artist',
      artistType: 'musician',
      isVerified: true,
      phoneNumber: '123-456-7890',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001'
      }
    });
    console.log('Artist user created...');

    // Create sample cause
    await Cause.create({
      userId: artist.id,
      title: 'Emergency Medical Support Needed',
      description: 'Seeking support for urgent medical treatment',
      category: 'medical',
      amountRequested: 5000.00,
      status: 'verified',
      evidence: {
        medicalDocuments: 'https://example.com/docs/medical.pdf',
        proofOfCondition: 'https://example.com/docs/proof.pdf'
      },
      verifiedBy: verifier.id,
      verificationDate: new Date(),
      location: {
        city: 'New York',
        state: 'NY'
      }
    });
    console.log('Sample cause created...');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
