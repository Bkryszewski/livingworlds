/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Living Worlds renders inside a SamCart iframe AND full-screen on Vercel.
  // No special config is required for the iframe embed; the SamCart wrapper
  // controls sizing via the optional postMessage height listener.
};
export default nextConfig;
