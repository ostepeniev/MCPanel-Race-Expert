/** @type {import('next').NextConfig} */
const nextConfig = {
  // Include the pre-computed JSON data files in serverless bundles
  outputFileTracingIncludes: {
    '/api/**': ['./data/api/**'],
  },
};

export default nextConfig;
