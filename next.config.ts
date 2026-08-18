import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/** Next does not re-export RemotePattern, so borrow it off the config type. */
type RemotePatterns = NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
>;

/**
 * Product photos come from Convex file storage, and next/image refuses any
 * host that isn't declared here.
 *
 * Production serves them from *.convex.cloud. A **local** Convex deployment
 * serves from http://127.0.0.1:3210 instead, so the host is derived from the
 * configured deployment URL — that covers local, cloud dev and self-hosted
 * without three hand-written entries.
 */
function convexImagePatterns(): RemotePatterns {
  const patterns: RemotePatterns = [
    { protocol: "https", hostname: "*.convex.cloud" },
    { protocol: "https", hostname: "*.convex.site" },
  ];

  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return patterns;

  try {
    const { protocol, hostname, port } = new URL(url);
    // Mapped rather than string-sliced so the protocol keeps its literal type.
    const scheme =
      protocol === "http:" ? "http" : protocol === "https:" ? "https" : null;
    if (!scheme) return patterns;
    if (hostname.endsWith(".convex.cloud")) return patterns;

    return [...patterns, { protocol: scheme, hostname, port }];
  } catch {
    // A malformed URL shouldn't take the build down.
    return patterns;
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: convexImagePatterns(),
    /*
     * Next refuses to optimise images served from loopback and private
     * addresses. That is a worthwhile SSRF guard, but it also means a local
     * Convex deployment (127.0.0.1:3210) serves product photos that never
     * render while developing — declaring the remote pattern alone is not
     * enough, the address family is rejected first.
     *
     * Opened up for `next dev` only. Production builds keep the protection,
     * and there the photos come from convex.cloud over HTTPS anyway.
     */
    dangerouslyAllowLocalIP: isDev,
    // Product cards are portrait 3:4; these widths cover the grid on phones
    // through desktop without generating sizes nothing requests.
    imageSizes: [48, 64, 80, 96, 128, 200, 256, 384],
  },
};

export default nextConfig;
