import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import Breadcrumb from "@/components/Common/Breadcrumb";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre Nosotros | ArtistsAid - Plataforma para Artistas",
  description: "Conoce más sobre ArtistsAid, tu plataforma integral para la gestión y promoción de contenido artístico.",
};

const AboutPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Sobre Nosotros"
        description="Descubre cómo ArtistsAid está transformando la manera en que los artistas comparten y monetizan su música."
      />
      <AboutSectionOne />
      <AboutSectionTwo />
    </>
  );
};

export default AboutPage;
