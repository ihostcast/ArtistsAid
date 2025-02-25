'use client';

import { useEffect, useCallback } from 'react';
import { useScript } from '@/hooks/useScript';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      render: (container: string | HTMLElement, options: any) => number;
    };
    onRecaptchaLoad: () => void;
  }
}

interface ReCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

const ReCaptcha = ({ siteKey, onVerify }: ReCaptchaProps) => {
  // Verificar que tenemos una clave de sitio válida
  if (!siteKey) {
    console.error('Error: reCAPTCHA site key no está configurada');
    return null;
  }

  // Usar reCAPTCHA v3
  const scriptUrl = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
  const status = useScript(scriptUrl);

  const handleReCaptchaVerify = useCallback(() => {
    if (!window.grecaptcha) {
      console.error('Error: reCAPTCHA no está cargado correctamente');
      return;
    }

    try {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(siteKey, {
            action: 'REGISTER'
          });
          console.log('reCAPTCHA token generado exitosamente');
          onVerify(token);
        } catch (error) {
          console.error('Error al ejecutar reCAPTCHA:', error);
          // Si hay un error específico con el ID del cliente, probablemente la clave es incorrecta
          if (error instanceof Error && error.message.includes('Invalid reCAPTCHA client id')) {
            console.error('La clave del sitio de reCAPTCHA parece ser inválida. Verifica que la clave sea correcta.');
          }
        }
      });
    } catch (error) {
      console.error('Error al inicializar reCAPTCHA:', error);
    }
  }, [siteKey, onVerify]);

  useEffect(() => {
    if (status === 'ready') {
      handleReCaptchaVerify();
    } else if (status === 'error') {
      console.error('Error al cargar el script de reCAPTCHA');
    }
  }, [status, handleReCaptchaVerify]);

  // Renderizar un div contenedor para reCAPTCHA
  return <div id="recaptcha-container" className="hidden"></div>;
};

export default ReCaptcha;
