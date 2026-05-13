/** @type {import('next').NextConfig} */
// Static export (`output: 'export'`) strips API routes — `/api/*` returns 404 HTML in production,
// so the contact form shows "Network error" after `response.json()` fails. Use full Next.js build
// on Vercel (default). Opt into static export only for hosts that need pure static files:
//   NEXT_STATIC_EXPORT=true npm run build
const useStaticExport = process.env.NEXT_STATIC_EXPORT === 'true';

const nextConfig = {
  ...(useStaticExport ? { output: 'export' } : {}),
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
