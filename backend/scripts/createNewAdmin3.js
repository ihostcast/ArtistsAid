require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User } = require('../src/models');

async function createNewAdmin() {
  try {
    // Eliminar el admin existente
    await User.destroy({
      where: { email: 'admin@artaid.com' }
    });

    // Crear un nuevo admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@artaid.com',
      password: 'admin123',
      role: 'admin'
    });

    // Verificar que la contraseña se guardó correctamente
    const isValid = await bcrypt.compare('admin123', admin.password);
    
    console.log('New admin created:', {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      passwordValid: isValid
    });

    console.log('Try logging in with:');
    console.log('Email: admin@artaid.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

createNewAdmin();
