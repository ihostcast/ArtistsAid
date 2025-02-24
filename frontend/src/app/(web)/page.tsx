import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Demo from "@/components/Demo";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ArtistsAid - Plataforma para Artistas",
  description: "Plataforma para artistas que buscan compartir y promocionar su música",
};

export default function Home() {
  return (
    <>
      <ScrollUp />
      <Hero />
      <Features />
      <Demo />
      <AboutSectionOne />
      <AboutSectionTwo />
      <Contact />
    </>
  );
}
