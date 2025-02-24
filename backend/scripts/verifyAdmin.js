const bcrypt = require('bcryptjs');
const { User } = require('../src/models');

async function verifyAdmin() {
  try {
    // Buscar el usuario admin
    const admin = await User.findOne({ 
      where: { email: 'admin@artistsaid.com' },
      raw: true
    });

    if (!admin) {
      console.log('Admin user not found');
      
      // Crear el usuario admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const newAdmin = await User.create({
        name: 'Admin',
        email: 'admin@artistsaid.com',
        password: hashedPassword,
        role: 'admin'
      });

      console.log('Created new admin user:', {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role
      });
    } else {
      console.log('Found existing admin:', {
        id: admin.id,
        email: admin.email,
        role: admin.role
      });

      // Actualizar la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.update(
        { password: hashedPassword },
        { where: { id: admin.id } }
      );

      console.log('Updated admin password');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

verifyAdmin();
