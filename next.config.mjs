/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for better-sqlite3 native module
  serverExternalPackages: ['better-sqlite3'],

  // Include the pre-seeded database in the serverless function bundle
  outputFileTracingIncludes: {
    '/api/**': ['./data/**'],
    '/': ['./data/**'],
    '/orders': ['./data/**'],
    '/sales': ['./data/**'],
    '/warehouse': ['./data/**'],
    '/finance': ['./data/**'],
    '/marketing': ['./data/**'],
  },
};

export default nextConfig;
