import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sitio 100% estático: `next build` genera la carpeta `out/` que publica Netlify.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
