require('dotenv').config();
const bcrypt = require('bcrypt');
const { User } = require('../src/models');

async function createTestAdmin() {
  try {
    // Eliminar usuarios existentes
    await User.destroy({
      where: { email: 'test@test.com' }
    });

    // Crear un nuevo hash de contraseña
    const password = 'test123';
    const hashedPassword = await bcrypt.hash(password, 8);

    // Crear un nuevo admin
    const admin = await User.create({
      name: 'Test Admin',
      email: 'test@test.com',
      password: hashedPassword,
      role: 'admin'
    });

    // Verificar que la contraseña se guardó correctamente
    const plainPassword = 'test123';
    const storedHash = admin.password;
    
    console.log('Test values:', {
      plainPassword,
      storedHash
    });

    const isValid = await bcrypt.compare(plainPassword, storedHash);
    
    console.log('Test admin created:', {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      passwordValid: isValid
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

createTestAdmin();
