/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Add your Supabase storage domain here once you upload media:
  // images: { remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }] },
};

export default nextConfig;
