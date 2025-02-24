require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User } = require('../src/models');

async function createNewAdmin() {
  try {
    // Eliminar el admin existente
    await User.destroy({
      where: { email: 'admin@artistsaid.com' }
    });

    // Crear un nuevo hash de contraseña
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear un nuevo admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@artistsaid.com',
      password: hashedPassword,
      role: 'admin'
    });

    // Verificar que la contraseña se guardó correctamente
    const isValid = await bcrypt.compare(password, admin.password);
    
    console.log('New admin created:', {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      passwordValid: isValid
    });

    // Mostrar la contraseña hasheada para debug
    console.log('Password hash:', admin.password);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

createNewAdmin();
