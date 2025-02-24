const nodemailer = require('nodemailer');

// Para desarrollo, usaremos un transportador de prueba
const createTransporter = async () => {
    // Crear una cuenta de prueba de ethereal.email
    let testAccount = await nodemailer.createTestAccount();

    // Crear un transportador reutilizable usando SMTP
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    return transporter;
};

module.exports = {
    createTransporter
};
