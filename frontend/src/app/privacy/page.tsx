'use client';

import LegalLayout from '@/components/Layout/LegalLayout';

const PrivacyPage = () => {
  return (
    <LegalLayout 
      title="Política de Privacidad" 
      description="Tu privacidad es importante para nosotros. Esta política explica cómo recopilamos, usamos y protegemos tu información."
    >
      <div className="space-y-8">
        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            1. Información que Recopilamos
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Recopilamos la siguiente información:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Información de registro (nombre, email, teléfono)</li>
              <li>Información del perfil de artista</li>
              <li>Contenido musical y multimedia</li>
              <li>Datos de uso y analíticas</li>
              <li>Información de dispositivos y navegación</li>
              <li>Comunicaciones con nuestro servicio</li>
            </ul>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            2. Uso de la Información
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Utilizamos tu información para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Proporcionar y mejorar nuestros servicios</li>
              <li>Personalizar tu experiencia</li>
              <li>Procesar pagos y transacciones</li>
              <li>Comunicarnos contigo sobre actualizaciones</li>
              <li>Analizar y mejorar nuestros servicios</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            3. Compartir Información
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Podemos compartir tu información con:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Proveedores de servicios que nos ayudan a operar</li>
              <li>Socios comerciales (con tu consentimiento)</li>
              <li>Autoridades legales cuando sea requerido</li>
              <li>Otros usuarios (según tus configuraciones de privacidad)</li>
            </ul>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            4. Protección de Datos
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Implementamos medidas de seguridad como:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Encriptación de datos sensibles</li>
              <li>Acceso restringido a información personal</li>
              <li>Monitoreo regular de sistemas</li>
              <li>Copias de seguridad periódicas</li>
              <li>Protocolos de seguridad actualizados</li>
            </ul>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            5. Tus Derechos
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Tienes derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Acceder a tu información personal</li>
              <li>Rectificar datos incorrectos</li>
              <li>Solicitar la eliminación de datos</li>
              <li>Oponerte al procesamiento</li>
              <li>Portar tus datos a otros servicios</li>
              <li>Retirar tu consentimiento</li>
            </ul>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            6. Cookies y Tecnologías Similares
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Utilizamos cookies y tecnologías similares para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Mantener tu sesión activa</li>
              <li>Recordar tus preferencias</li>
              <li>Analizar el uso del sitio</li>
              <li>Personalizar el contenido</li>
              <li>Mejorar la seguridad</li>
            </ul>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            7. Menores de Edad
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              No recopilamos intencionalmente información de menores de 16 años. Si eres padre/madre o tutor y crees que tu hijo nos ha proporcionado información, contáctanos para eliminarla.
            </p>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            8. Cambios en la Política
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Podemos actualizar esta política ocasionalmente. Te notificaremos sobre cambios significativos a través de:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Notificaciones en la aplicación</li>
              <li>Correo electrónico</li>
              <li>Avisos en nuestro sitio web</li>
            </ul>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            9. Contacto
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Para ejercer tus derechos o realizar consultas sobre privacidad:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Email: privacidad@artistsaid.com</li>
              <li>Delegado de Protección de Datos: dpo@artistsaid.com</li>
              <li>Dirección: [Tu dirección legal]</li>
              <li>Teléfono: [Tu teléfono de contacto]</li>
            </ul>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
};

export default PrivacyPage;
