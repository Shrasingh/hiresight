/** @type {import('next').NextConfig} */
const nextConfig = {
  // Linting is a CI/pre-commit concern, not a production-build concern.
  // Running ESLint inside `next build` is what surfaces the flat-config
  // parser-serialization error on Vercel and can fail the deploy. We lint
  // separately via `npm run lint` (ESLint 9 directly). This does NOT disable
  // type checking or any correctness gate — it only stops the deploy build
  // from invoking ESLint.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
};

export default nextConfig;
