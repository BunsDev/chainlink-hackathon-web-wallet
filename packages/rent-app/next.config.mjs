/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ hostname: 'placehold.co' }, { hostname: 'ipfs.io' }],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
