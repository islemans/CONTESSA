import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Colour tokens for one theme mode. Stored in the DB so the owner can restyle
 * the whole storefront from the dashboard without a redeploy.
 */
export const themeTokens = v.object({
  bg: v.string(),
  surface: v.string(),
  ink: v.string(),
  muted: v.string(),
  accent: v.string(),
  accentInk: v.string(),
  gold: v.string(),
  border: v.string(),
});

export const orderStatus = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("shipped"),
  v.literal("delivered"),
  v.literal("cancelled"),
);

export const deliveryType = v.union(v.literal("home"), v.literal("desk"));

export default defineSchema({
  categories: defineTable({
    name: v.string(),
    nameAr: v.optional(v.string()),
    slug: v.string(),
    description: v.optional(v.string()),
    image: v.optional(v.id("_storage")),
    order: v.number(),
    isActive: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"]),

  products: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    categoryId: v.id("categories"),
    /** Price in Algerian dinar (DZD), stored as a whole number. */
    price: v.number(),
    /** Optional "was" price — renders struck through next to the sale price. */
    compareAtPrice: v.optional(v.number()),
    cover: v.optional(v.id("_storage")),
    gallery: v.array(v.id("_storage")),
    sizes: v.array(v.string()),
    colors: v.array(v.object({ name: v.string(), hex: v.string() })),
    stock: v.number(),
    trackStock: v.boolean(),
    isActive: v.boolean(),
    isFeatured: v.boolean(),
    order: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["categoryId"])
    .index("by_active", ["isActive"])
    .index("by_featured", ["isFeatured"]),

  /**
   * One row per wilaya. Prices are editable from the dashboard, and the list
   * itself is data-driven so wilayas can be added or removed to match whatever
   * list the carrier actually uses.
   */
  wilayas: defineTable({
    code: v.number(),
    name: v.string(),
    nameAr: v.string(),
    homePrice: v.number(),
    deskPrice: v.number(),
    homeAvailable: v.boolean(),
    deskAvailable: v.boolean(),
    isActive: v.boolean(),
  }).index("by_code", ["code"]),

  orders: defineTable({
    reference: v.string(),
    customerName: v.string(),
    phone: v.string(),
    wilayaCode: v.number(),
    wilayaName: v.string(),
    commune: v.optional(v.string()),
    address: v.optional(v.string()),
    deliveryType,
    deliveryPrice: v.number(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        size: v.optional(v.string()),
        color: v.optional(v.string()),
        image: v.optional(v.id("_storage")),
      }),
    ),
    subtotal: v.number(),
    total: v.number(),
    status: orderStatus,
    note: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_reference", ["reference"]),

  /** Singleton row, always keyed "site". */
  settings: defineTable({
    key: v.string(),
    siteName: v.string(),
    tagline: v.string(),
    announcement: v.string(),
    announcementActive: v.boolean(),
    phone: v.string(),
    email: v.string(),
    instagram: v.string(),
    facebook: v.string(),
    tiktok: v.string(),
    storeOpen: v.boolean(),
    /** Order subtotal above which delivery is free. 0 disables it. */
    freeDeliveryThreshold: v.number(),
    theme: v.object({
      defaultMode: v.union(v.literal("light"), v.literal("dark")),
      allowUserToggle: v.boolean(),
      radius: v.string(),
      light: themeTokens,
      dark: themeTokens,
    }),
  }).index("by_key", ["key"]),

  /** Singleton row holding the owner's password hash. Never sent to a client. */
  adminAuth: defineTable({
    passwordHash: v.string(),
    salt: v.string(),
    iterations: v.number(),
  }),

  adminSessions: defineTable({
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),
});
