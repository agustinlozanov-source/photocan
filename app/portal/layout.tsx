import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Portal de cliente · Phot8can", template: "%s · Portal Phot8can" },
  description: "Tu página, tus cambios, tus pagos y tu briefing en un solo lugar.",
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
