import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tu pago · Phot8can", robots: { index: false, follow: false } };

export default function PagoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
