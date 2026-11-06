import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PhotoCan — Estudio de fotografía",
  description: "Retrato, producto y eventos. Fotografía con intención, luz y carácter.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
