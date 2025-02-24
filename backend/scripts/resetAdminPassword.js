require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User } = require('../src/models');

async function resetAdminPassword() {
  try {
    // Buscar el usuario admin
    const admin = await User.findOne({ 
      where: { email: 'admin@artistsaid.com' }
    });

    if (!admin) {
      console.log('Admin user not found');
      return;
    }

    // Generar nuevo hash de contraseña
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Guardar la contraseña y verificar
    admin.password = hashedPassword;
    await admin.save();

    // Verificar que la contraseña se guardó correctamente
    const isValid = await bcrypt.compare(password, admin.password);
    
    console.log('Admin password reset:', {
      id: admin.id,
      email: admin.email,
      passwordValid: isValid
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

resetAdminPassword();
