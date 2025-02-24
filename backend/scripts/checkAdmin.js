const { User } = require('../src/models');

async function checkAdmin() {
  try {
    const admin = await User.findOne({ where: { email: 'admin@artistsaid.com' } });
    console.log('Admin user:', admin ? admin.toJSON() : 'Not found');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkAdmin();
