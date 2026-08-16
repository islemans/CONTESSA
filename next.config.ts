import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Product photos are served from Convex file storage.
      { protocol: "https", hostname: "*.convex.cloud" },
      { protocol: "https", hostname: "*.convex.site" },
    ],
    // Product cards are portrait 3:4; these widths cover the grid on phones
    // through desktop without generating sizes nothing requests.
    imageSizes: [48, 64, 80, 96, 128, 200, 256, 384],
  },
};

export default nextConfig;
