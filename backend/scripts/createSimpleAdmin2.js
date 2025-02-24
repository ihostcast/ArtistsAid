require('dotenv').config();
const crypto = require('crypto');
const { User } = require('../src/models');

async function createSimpleAdmin() {
  try {
    // Eliminar usuarios existentes
    await User.destroy({
      where: { email: 'simple@test.com' }
    });

    // Crear un nuevo admin
    const admin = await User.create({
      name: 'Simple Admin',
      email: 'simple@test.com',
      password: 'test123', // El modelo hasheará la contraseña automáticamente
      role: 'admin'
    });

    // Verificar que la contraseña se guardó correctamente
    const isValid = await admin.validatePassword('test123');
    
    console.log('Simple admin created:', {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      passwordValid: isValid,
      storedHash: admin.password
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

createSimpleAdmin();
