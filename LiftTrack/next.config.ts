import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Monorepo: parent folder has another lockfile; trace this app only.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
