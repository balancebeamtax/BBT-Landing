/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — Vercel deploys this as static files; matches old static HTML behavior.
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
