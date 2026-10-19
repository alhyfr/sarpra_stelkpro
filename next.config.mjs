/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '**',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
    ],
    // Matikan optimizer di semua environment.
    // Preview file storage (AFile, slider) kalau lewat /_next/image
    // membuat proses Next mengunduh gambar lagi; di production ini
    // tercatat sebagai 500/499 dan menahan request lain di origin yang sama.
    unoptimized: true,
  },
};

export default nextConfig;
