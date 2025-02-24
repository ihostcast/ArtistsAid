'use client';

import LegalLayout from '@/components/Layout/LegalLayout';

const TermsPage = () => {
  return (
    <LegalLayout 
      title="Términos y Condiciones" 
      description="Por favor, lee detenidamente nuestros términos y condiciones antes de usar ArtistsAid."
    >
      <div className="space-y-8">
        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            1. Introducción y Aceptación
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Al acceder y utilizar ArtistsAid, aceptas estar legalmente vinculado por estos Términos y Condiciones, nuestra Política de Privacidad y todas las leyes y regulaciones aplicables.
            </p>
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al servicio.
            </p>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            2. Servicios y Funcionalidades
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              ArtistsAid proporciona una plataforma integral para músicos y artistas que incluye:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Herramientas de gestión y promoción musical</li>
              <li>Servicios de distribución digital</li>
              <li>Análisis y estadísticas de rendimiento</li>
              <li>Conexión con otros artistas y profesionales de la industria</li>
              <li>Recursos educativos y de desarrollo profesional</li>
            </ul>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            3. Cuentas de Usuario
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Al crear una cuenta en ArtistsAid, te comprometes a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Proporcionar información precisa y completa</li>
              <li>Mantener la seguridad de tu cuenta y contraseña</li>
              <li>No compartir tus credenciales de acceso</li>
              <li>Notificar inmediatamente cualquier brecha de seguridad</li>
            </ul>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            4. Contenido y Derechos de Propiedad Intelectual
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Al subir contenido a ArtistsAid:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Mantienes todos los derechos de propiedad intelectual sobre tu contenido</li>
              <li>Otorgas a ArtistsAid una licencia mundial, no exclusiva y libre de regalías para usar, modificar, ejecutar públicamente y distribuir tu contenido</li>
              <li>Garantizas que tienes todos los derechos necesarios sobre el contenido que subes</li>
            </ul>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            5. Pagos y Suscripciones
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Para los servicios premium:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Los pagos se procesan de manera segura a través de proveedores autorizados</li>
              <li>Las suscripciones se renuevan automáticamente al final de cada período</li>
              <li>Puedes cancelar tu suscripción en cualquier momento</li>
              <li>No hay reembolsos por períodos parciales</li>
            </ul>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            6. Limitación de Responsabilidad
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              ArtistsAid no será responsable por:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Pérdidas indirectas o consecuentes</li>
              <li>Pérdida de datos o interrupción del servicio</li>
              <li>Acciones de terceros o usuarios</li>
              <li>Contenido subido por otros usuarios</li>
            </ul>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            7. Modificaciones de los Términos
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              ArtistsAid se reserva el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web.
            </p>
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              El uso continuado de nuestros servicios después de cualquier cambio constituye la aceptación de los nuevos términos.
            </p>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            8. Ley Aplicable
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Estos términos se rigen por las leyes de España. Cualquier disputa relacionada con estos términos estará sujeta a la jurisdicción exclusiva de los tribunales españoles.
            </p>
          </div>
        </section>

        <section className="mb-9">
          <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
            9. Contacto
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
              Si tienes preguntas sobre estos términos, contáctanos en:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body-color dark:text-body-color-dark">
              <li>Email: legal@artistsaid.com</li>
              <li>Dirección: [Tu dirección legal]</li>
              <li>Teléfono: [Tu teléfono de contacto]</li>
            </ul>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
};

export default TermsPage;
