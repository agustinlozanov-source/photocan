import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://phot8can.com"),
  title: "Phot8can · Agencia creativa",
  description:
    "Phot8can es una agencia creativa que transforma ideas en imagen: fotografía, video, branding y redes sociales. Creamos. Capturamos. Conectamos.",
  icons: { icon: "/marca/favicon.png" },
  openGraph: {
    title: "Phot8can · Agencia creativa",
    description: "Creamos. Capturamos. Conectamos.",
    url: "https://phot8can.com",
    siteName: "Phot8can",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${montserrat.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
