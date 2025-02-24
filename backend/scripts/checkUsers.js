require('dotenv').config();
const { User } = require('../src/models');

async function checkUsers() {
  try {
    // Buscar todos los usuarios
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'password'],
      raw: true
    });

    console.log('=== Users in Database ===');
    users.forEach(user => {
      console.log('\nUser:', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        passwordHash: user.password.substring(0, 20) + '...' // Solo mostrar parte del hash por seguridad
      });
    });

    // Buscar específicamente el usuario admin
    const admin = await User.findOne({
      where: { email: 'admin@artaid.com' },
      raw: true
    });

    if (admin) {
      console.log('\n=== Admin User Details ===');
      console.log('ID:', admin.id);
      console.log('Name:', admin.name);
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Password Hash:', admin.password);
    } else {
      console.log('\nAdmin user not found!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkUsers();
