import type { NextConfig } from "next";

// The browser always calls same-origin `/api/*`; Next proxies it to the FastAPI backend.
// This avoids CORS configuration and keeps the backend URL out of client bundles.
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  },
};

export default nextConfig;
