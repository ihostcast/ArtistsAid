import { Inter } from "next/font/google";
import { Providers } from '@/components/Providers';
import "react-modal-video/css/modal-video.css";
import "../styles/globals.css";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ArtistsAid - Plataforma para Artistas",
  description: "Plataforma para la gestión y promoción de eventos artísticos",
  keywords: ["música", "eventos", "artistas", "conciertos", "shows"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
