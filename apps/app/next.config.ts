import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["next-auth"],
  serverExternalPackages: ["nodemailer"],
};

export default nextConfig;
