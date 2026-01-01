/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",          // needed for static export
  // Serve from root on Netlify; remove repo-based basePath
  basePath: '',
  // Optional asset prefix (set via env if you host assets on a CDN)
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',
  images: {
    unoptimized: true,       // disable image optimization for static export
  },
  env: {
    NEXT_PUBLIC_SITE_URL: 'https://enigmae.netlify.app'
  },
};

module.exports = nextConfig;
