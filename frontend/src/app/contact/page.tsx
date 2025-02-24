import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto | ArtistsAid - Plataforma para Artistas",
  description: "Contáctanos para obtener más información sobre ArtistsAid, nuestra plataforma de distribución musical y servicios para artistas.",
};

const ContactPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Contacto"
        description="¿Tienes preguntas sobre ArtistsAid? Estamos aquí para ayudarte. Contáctanos para obtener más información sobre nuestra plataforma, servicios de distribución musical y cómo podemos ayudarte a hacer crecer tu carrera artística."
      />

      <Contact />
    </>
  );
};

export default ContactPage;
