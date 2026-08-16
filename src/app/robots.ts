import type { MetadataRoute } from "next";
import { ADMIN_PATH } from "@/lib/admin-path";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Belt and braces alongside the noindex on the atelier layout.
      disallow: [`${ADMIN_PATH}/`, "/checkout", "/cart", "/order/"],
    },
  };
}
