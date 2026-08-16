import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { themeTokens } from "./schema";
import { requireAdmin } from "./lib/auth";
import { DEFAULT_SETTINGS } from "./lib/defaults";

/**
 * Public. Falls back to the built-in defaults when the row doesn't exist yet,
 * so the storefront renders correctly before the first seed.
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();
    return row ?? DEFAULT_SETTINGS;
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    siteName: v.optional(v.string()),
    tagline: v.optional(v.string()),
    announcement: v.optional(v.string()),
    announcementActive: v.optional(v.boolean()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    instagram: v.optional(v.string()),
    facebook: v.optional(v.string()),
    tiktok: v.optional(v.string()),
    storeOpen: v.optional(v.boolean()),
    freeDeliveryThreshold: v.optional(v.number()),
  },
  handler: async (ctx, { token, ...patch }) => {
    await requireAdmin(ctx.db, token);

    const row = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();

    const clean = Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined),
    );

    if (row) {
      await ctx.db.patch(row._id, clean);
    } else {
      await ctx.db.insert("settings", { ...DEFAULT_SETTINGS, ...clean });
    }
    return null;
  },
});

/** The theme controller. Writes here repaint the storefront live. */
export const updateTheme = mutation({
  args: {
    token: v.string(),
    defaultMode: v.optional(v.union(v.literal("light"), v.literal("dark"))),
    allowUserToggle: v.optional(v.boolean()),
    radius: v.optional(v.string()),
    light: v.optional(themeTokens),
    dark: v.optional(themeTokens),
  },
  handler: async (ctx, { token, ...patch }) => {
    await requireAdmin(ctx.db, token);

    const row = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();

    const base = row?.theme ?? DEFAULT_SETTINGS.theme;
    const theme = {
      defaultMode: patch.defaultMode ?? base.defaultMode,
      allowUserToggle: patch.allowUserToggle ?? base.allowUserToggle,
      radius: patch.radius ?? base.radius,
      light: patch.light ?? base.light,
      dark: patch.dark ?? base.dark,
    };

    if (row) {
      await ctx.db.patch(row._id, { theme });
    } else {
      await ctx.db.insert("settings", { ...DEFAULT_SETTINGS, theme });
    }
    return null;
  },
});

export const resetTheme = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx.db, token);
    const row = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();
    if (row) await ctx.db.patch(row._id, { theme: DEFAULT_SETTINGS.theme });
    return null;
  },
});
