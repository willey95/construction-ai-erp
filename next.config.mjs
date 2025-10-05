/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 프로덕션 빌드 시 ESLint 경고 무시
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 프로덕션 빌드 시 타입 체크 경고를 무시하지 않음 (이미 수정됨)
    ignoreBuildErrors: false,
  },
  // 실험적 기능
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
