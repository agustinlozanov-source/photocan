import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Superadministrador · Phot8can", template: "%s · Superadmin Phot8can" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
