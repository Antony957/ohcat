import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // 如果也想跳过 TypeScript 检查
  },
  // 暂时禁用 CSP 用于测试
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         {
  //           key: 'Content-Security-Policy',
  //           value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' 'inline-speculation-rules' data: blob:; style-src 'self' 'unsafe-inline' data:; font-src 'self' data: blob:; img-src 'self' data: blob: https:; media-src 'self' blob: data:; connect-src 'self' wss: ws: https: data: blob:; object-src 'none'; base-uri 'self'; form-action 'self';",
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;
