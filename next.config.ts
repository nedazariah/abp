import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next writes an AGENTS.md on startup unless this is off.
  agentRules: false,
}

export default nextConfig
