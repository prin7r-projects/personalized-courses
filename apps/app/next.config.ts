import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/app",
  transpilePackages: ["next-auth"],
  serverExternalPackages: ["nodemailer"],
};

export default nextConfig;
