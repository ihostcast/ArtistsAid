"use client";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <>
      <footer className="relative z-10 bg-white pt-16 dark:bg-gray-dark md:pt-20 lg:pt-24">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4 md:w-1/2 lg:w-4/12 xl:w-5/12">
              <div className="mb-12 max-w-[360px] lg:mb-16">
                <Link href="/" className="mb-8 inline-block">
                  <Image
                    src="/images/logo/logo-2.svg"
                    alt="ArtistsAid Logo"
                    className="w-full dark:hidden"
                    width={140}
                    height={30}
                    priority={false}
                  />
                  <Image
                    src="/images/logo/logo.svg"
                    alt="ArtistsAid Logo"
                    className="hidden w-full dark:block"
                    width={140}
                    height={30}
                    priority={false}
                  />
                </Link>
                <p className="mb-9 text-base leading-relaxed text-body-color dark:text-body-color-dark">
                  ArtistsAid es tu plataforma integral para la gestión y distribución musical. 
                  Empodera tu carrera artística con herramientas profesionales de distribución, 
                  análisis y monetización.
                </p>
                <div className="flex items-center">
                  <a
                    href="https://facebook.com/artistsaid"
                    aria-label="social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mr-6 text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                  >
                    <svg width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.1 10.4939V7.42705C12.1 6.23984 13.085 5.27741 14.3 5.27741H16.5V2.05296L13.5135 1.84452C10.9664 1.66676 8.8 3.63781 8.8 6.13287V10.4939H5.5V13.7183H8.8V20.1667H12.1V13.7183H15.4L16.5 10.4939H12.1Z" fill="currentColor"/>
                    </svg>
                  </a>
                  <a
                    href="https://twitter.com/artistsaid"
                    aria-label="social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mr-6 text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                  >
                    <svg width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.0714 5.93259C18.9793 5.99252 18.8873 6.04677 18.7952 6.09533C18.9397 5.89295 19.0604 5.67182 19.1667 5.43907C19.2605 5.23776 19.0319 5.07033 18.8333 5.15384C18.1666 5.43907 17.4524 5.64038 16.7143 5.75705C15.9048 4.98544 14.8214 4.5 13.6667 4.5C11.3571 4.5 9.5 6.30932 9.5 8.55705C9.5 8.79548 9.52381 9.03391 9.57143 9.26667C6.88095 9.12726 4.4881 7.87897 2.90476 5.93259C2.78571 5.78182 2.54762 5.78182 2.42857 5.93259C2.19048 6.26038 2 6.64242 2 7.0562C2 7.93157 2.40476 8.73121 3.09524 9.26667C2.95238 9.24866 2.80952 9.21264 2.66667 9.16408C2.47619 9.09847 2.28571 9.25493 2.33333 9.43941C2.69048 10.8205 3.80952 11.9211 5.19048 12.2129C4.97619 12.2669 4.7619 12.2922 4.54762 12.2922C4.38095 12.2922 4.21429 12.2742 4.04762 12.2489C3.83333 12.2129 3.66667 12.4143 3.76191 12.6051C4.35714 13.8067 5.54762 14.6461 6.92857 14.7164C5.80952 15.5267 4.45238 16 3 16C2.80952 16 2.61905 15.9928 2.42857 15.9784C2.11905 15.9496 1.92857 16.3137 2.14286 16.5405C3.80952 18.0693 5.88095 19 8.14286 19C13.6667 19 17.5 14.7668 17.5 9.43941V9.0538C18.2143 8.53033 18.8333 7.89472 19.3333 7.1663C19.4762 6.97614 19.2381 6.73771 19.0714 5.93259Z" fill="currentColor"/>
                    </svg>
                  </a>
                  <a
                    href="https://instagram.com/artistsaid"
                    aria-label="social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mr-6 text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                  >
                    <svg width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 5.60938C8.03437 5.60938 5.60938 8.03437 5.60938 11C5.60938 13.9656 8.03437 16.3906 11 16.3906C13.9656 16.3906 16.3906 13.9656 16.3906 11C16.3906 8.03437 13.9656 5.60938 11 5.60938ZM11 14.5156C9.07187 14.5156 7.48438 12.9281 7.48438 11C7.48438 9.07187 9.07187 7.48438 11 7.48438C12.9281 7.48438 14.5156 9.07187 14.5156 11C14.5156 12.9281 12.9281 14.5156 11 14.5156Z" fill="currentColor"/>
                      <path d="M17.0156 5.375C17.0156 6.14062 16.3906 6.76562 15.625 6.76562C14.8594 6.76562 14.2344 6.14062 14.2344 5.375C14.2344 4.60937 14.8594 3.98438 15.625 3.98438C16.3906 3.98438 17.0156 4.60937 17.0156 5.375Z" fill="currentColor"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12">
              <div className="mb-12 lg:mb-16">
                <h2 className="mb-10 text-xl font-bold text-black dark:text-white">
                  Enlaces Útiles
                </h2>
                <ul>
                  <li>
                    <Link
                      href="/about"
                      className="mb-4 inline-block text-base text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >
                      Nosotros
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/demo"
                      className="mb-4 inline-block text-base text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >
                      Demos
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="mb-4 inline-block text-base text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >
                      Contacto
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-3/12 xl:w-2/12">
              <div className="mb-12 lg:mb-16">
                <h2 className="mb-10 text-xl font-bold text-black dark:text-white">
                  Legal
                </h2>
                <ul>
                  <li>
                    <Link
                      href="/terms"
                      className="mb-4 inline-block text-base text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >
                      Términos y Condiciones
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="mb-4 inline-block text-base text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >
                      Política de Privacidad
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/cookies"
                      className="mb-4 inline-block text-base text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >
                      Política de Cookies
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-3/12 xl:w-3/12">
              <div className="mb-12 lg:mb-16">
                <h2 className="mb-10 text-xl font-bold text-black dark:text-white">
                  Soporte
                </h2>
                <ul>
                  <li>
                    <Link
                      href="/faq"
                      className="mb-4 inline-block text-base text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >
                      Preguntas Frecuentes
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/help"
                      className="mb-4 inline-block text-base text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >
                      Centro de Ayuda
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="mb-4 inline-block text-base text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >
                      Contáctanos
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D2D8E183] to-transparent dark:via-[#959CB183]"></div>
          <div className="py-8">
            <p className="text-center text-base text-body-color dark:text-white">
              {new Date().getFullYear()} ArtistsAid. Todos los derechos reservados. Diseñado y desarrollado con ♥️ para la comunidad artística.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
