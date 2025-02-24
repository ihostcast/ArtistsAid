require('dotenv').config();
const crypto = require('crypto');
const { User } = require('../src/models');

async function createSimpleAdmin() {
  try {
    // Eliminar usuarios existentes
    await User.destroy({
      where: { email: 'simple@test.com' }
    });

    // Crear un hash simple
    const password = 'test123';
    const hash = crypto.createHash('sha256').update(password).digest('hex');

    // Crear un nuevo admin
    const admin = await User.create({
      name: 'Simple Admin',
      email: 'simple@test.com',
      password: hash,
      role: 'admin'
    });

    // Verificar que la contraseña se guardó correctamente
    const testHash = crypto.createHash('sha256').update(password).digest('hex');
    const isValid = hash === testHash;
    
    console.log('Simple admin created:', {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      passwordValid: isValid,
      hash
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

createSimpleAdmin();
