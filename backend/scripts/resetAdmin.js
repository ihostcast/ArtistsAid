require('dotenv').config();
const { User } = require('../src/models');

async function resetAdmin() {
  try {
    // Eliminar todos los usuarios admin existentes
    console.log('Deleting all existing admin users...');
    await User.destroy({
      where: {
        role: 'admin'
      }
    });

    // Crear un nuevo admin
    console.log('Creating new admin user...');
    const admin = await User.create({
      name: 'Administrator',
      email: 'admin@artaid.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true
    });

    // Verificar que la contraseña se guardó correctamente
    const isValid = await admin.validatePassword('admin123');
    
    console.log('\nNew admin created successfully!');
    console.log('=================================');
    console.log('Login Credentials:');
    console.log('Email: admin@artaid.com');
    console.log('Password: admin123');
    console.log('=================================');
    console.log('User Details:', {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isVerified: admin.isVerified,
      passwordValid: isValid
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

resetAdmin();
