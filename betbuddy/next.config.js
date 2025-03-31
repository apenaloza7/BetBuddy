/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  // Configure image optimization
  images: {
    domains: [],
    // Next.js doesn't support sizeLimit directly in images config
  },
};

module.exports = nextConfig; 