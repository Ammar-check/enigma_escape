/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Uncomment and update this if deploying to a repository subdirectory
  // basePath: '/your-repo-name',
  // assetPrefix: '/your-repo-name/',
};

module.exports = nextConfig;
