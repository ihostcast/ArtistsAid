import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Generar código de verificación
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Configurar el transportador de email (ajusta con tus credenciales)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Enviar email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verifica tu email - ArtistsAid',
      html: `
        <h1>Verificación de Email</h1>
        <p>Tu código de verificación es: <strong>${verificationCode}</strong></p>
        <p>Este código expirará en 10 minutos.</p>
      `,
    });

    // Aquí deberías guardar el código en tu base de datos junto con un timestamp
    // para validarlo después

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en la verificación de email:', error);
    return NextResponse.json(
      { error: 'Error al enviar el código de verificación' },
      { status: 500 }
    );
  }
}
