import Demo from "@/components/Demo";
import Breadcrumb from "@/components/Common/Breadcrumb";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demos | ArtistsAid - Plataforma para Artistas",
  description: "Explora demos de artistas y descubre nuevo talento musical en ArtistsAid.",
};

const DemoPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Demos"
        description="Descubre y comparte demos musicales. Una plataforma para artistas emergentes y establecidos."
      />
      <Demo />
    </>
  );
};

export default DemoPage;
