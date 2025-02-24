'use client';

import LegalLayout from '@/components/Layout/LegalLayout';

const CookiesPage = () => {
  return (
    <LegalLayout 
      title="Política de Cookies" 
      description="Esta política explica cómo utilizamos las cookies y tecnologías similares en ArtistsAid."
    >
      <div className="space-y-8">
        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            1. ¿Qué son las Cookies?
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Las cookies son pequeños archivos de texto que los sitios web colocan en tu dispositivo para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Recordar tus preferencias</li>
              <li>Entender cómo interactúas con nuestro sitio</li>
              <li>Mejorar tu experiencia de navegación</li>
              <li>Proporcionarte contenido personalizado</li>
            </ul>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            2. Tipos de Cookies que Utilizamos
          </h3>
          <div className="space-y-4">
            <h4 className="font-semibold text-dark dark:text-white">2.1 Cookies Esenciales</h4>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Autenticación y seguridad</li>
              <li>Funcionamiento básico del sitio</li>
              <li>Gestión de sesiones</li>
            </ul>

            <h4 className="font-semibold text-dark dark:text-white mt-6">2.2 Cookies de Rendimiento</h4>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Análisis de uso del sitio</li>
              <li>Estadísticas de visitantes</li>
              <li>Detección de errores</li>
            </ul>

            <h4 className="font-semibold text-dark dark:text-white mt-6">2.3 Cookies de Funcionalidad</h4>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Preferencias de idioma</li>
              <li>Configuración de tema</li>
              <li>Personalización de interfaz</li>
            </ul>

            <h4 className="font-semibold text-dark dark:text-white mt-6">2.4 Cookies de Publicidad</h4>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Seguimiento de intereses</li>
              <li>Medición de efectividad publicitaria</li>
              <li>Personalización de anuncios</li>
            </ul>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            3. Control de Cookies
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Puedes controlar las cookies de varias formas:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Configuración del navegador para rechazar todas o algunas cookies</li>
              <li>Panel de preferencias de cookies en nuestro sitio</li>
              <li>Eliminación de cookies existentes</li>
              <li>Navegación en modo privado/incógnito</li>
            </ul>
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark mt-4">
              Ten en cuenta que bloquear algunas cookies puede afectar la funcionalidad del sitio.
            </p>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            4. Cookies de Terceros
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Utilizamos servicios de terceros que pueden establecer cookies:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Google Analytics - Análisis de uso</li>
              <li>Firebase - Autenticación y funcionalidades</li>
              <li>Stripe - Procesamiento de pagos</li>
              <li>Redes sociales - Compartir contenido</li>
            </ul>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            5. Duración de las Cookies
          </h3>
          <div className="space-y-4">
            <h4 className="font-semibold text-dark dark:text-white">5.1 Cookies de Sesión</h4>
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Se eliminan cuando cierras el navegador.
            </p>

            <h4 className="font-semibold text-dark dark:text-white mt-6">5.2 Cookies Persistentes</h4>
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Permanecen en tu dispositivo por un período específico o hasta que las elimines manualmente.
            </p>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            6. Actualizaciones de la Política
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Podemos actualizar esta política de cookies ocasionalmente. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web.
            </p>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            7. Contacto
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Si tienes preguntas sobre nuestra política de cookies:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Email: privacidad@artistsaid.com</li>
              <li>Formulario de contacto en nuestro sitio web</li>
            </ul>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
};

export default CookiesPage;
