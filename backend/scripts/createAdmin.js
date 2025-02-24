const bcrypt = require('bcryptjs');
const { User } = require('../src/models');

async function createAdmin() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@artistsaid.com',
      password: hashedPassword,
      role: 'admin'
    });
    
    console.log('Admin user created:', {
      id: admin.id,
      email: admin.email,
      role: admin.role
    });
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    process.exit();
  }
}

createAdmin();
