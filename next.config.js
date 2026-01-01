/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",          // needed for static export
  basePath: "/enigma_escape", // <-- your repo name
  images: {
    unoptimized: true,       // disable image optimization for static export
  },
};

module.exports = nextConfig;
