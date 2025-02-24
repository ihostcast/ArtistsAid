// Para desarrollo, simularemos el envío de SMS
const sendVerificationCode = async (phoneNumber) => {
    // En desarrollo, siempre usaremos el código '123456'
    const code = '123456';
    console.log(`[DEV] Código de verificación enviado a ${phoneNumber}: ${code}`);
    return code;
};

const checkVerificationCode = async (phoneNumber, code) => {
    // En desarrollo, cualquier código '123456' es válido
    return code === '123456';
};

module.exports = {
    sendVerificationCode,
    checkVerificationCode
};
