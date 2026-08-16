import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import { ALGERIA_WILAYAS, defaultDeliveryPrices } from "./lib/defaults";

/** Public — used by the checkout wilaya picker. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("wilayas").collect();
    return rows.filter((w) => w.isActive).sort((a, b) => a.code - b.code);
  },
});

export const listAll = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx.db, token);
    const rows = await ctx.db.query("wilayas").collect();
    return rows.sort((a, b) => a.code - b.code);
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("wilayas"),
    name: v.optional(v.string()),
    nameAr: v.optional(v.string()),
    homePrice: v.optional(v.number()),
    deskPrice: v.optional(v.number()),
    homeAvailable: v.optional(v.boolean()),
    deskAvailable: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { token, id, ...patch }) => {
    await requireAdmin(ctx.db, token);

    const clean = Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined),
    );
    await ctx.db.patch(id, clean);
    return null;
  },
});

/** Save the whole delivery grid in one go. */
export const bulkUpdate = mutation({
  args: {
    token: v.string(),
    rows: v.array(
      v.object({
        id: v.id("wilayas"),
        homePrice: v.number(),
        deskPrice: v.number(),
        homeAvailable: v.boolean(),
        deskAvailable: v.boolean(),
        isActive: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, { token, rows }) => {
    await requireAdmin(ctx.db, token);
    await Promise.all(
      rows.map(({ id, ...patch }) => ctx.db.patch(id, patch)),
    );
    return null;
  },
});

/** Apply one price to every wilaya at once — handy for a flat-rate promo. */
export const setAllPrices = mutation({
  args: {
    token: v.string(),
    homePrice: v.optional(v.number()),
    deskPrice: v.optional(v.number()),
  },
  handler: async (ctx, { token, homePrice, deskPrice }) => {
    await requireAdmin(ctx.db, token);

    const rows = await ctx.db.query("wilayas").collect();
    await Promise.all(
      rows.map((w) =>
        ctx.db.patch(w._id, {
          ...(homePrice !== undefined ? { homePrice } : {}),
          ...(deskPrice !== undefined ? { deskPrice } : {}),
        }),
      ),
    );
    return null;
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    code: v.number(),
    name: v.string(),
    nameAr: v.optional(v.string()),
    homePrice: v.optional(v.number()),
    deskPrice: v.optional(v.number()),
  },
  handler: async (ctx, { token, code, name, nameAr, homePrice, deskPrice }) => {
    await requireAdmin(ctx.db, token);

    const clash = await ctx.db
      .query("wilayas")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (clash) throw new Error(`Code ${code} is already used by ${clash.name}.`);

    const fallback = defaultDeliveryPrices(code);
    return await ctx.db.insert("wilayas", {
      code,
      name,
      nameAr: nameAr ?? "",
      homePrice: homePrice ?? fallback.homePrice,
      deskPrice: deskPrice ?? fallback.deskPrice,
      homeAvailable: true,
      deskAvailable: true,
      isActive: true,
    });
  },
});

export const remove = mutation({
  args: { token: v.string(), id: v.id("wilayas") },
  handler: async (ctx, { token, id }) => {
    await requireAdmin(ctx.db, token);
    await ctx.db.delete(id);
    return null;
  },
});

/**
 * Adds any of the 58 official wilayas that are missing. Safe to re-run: it
 * never touches prices you've already set.
 */
export const restoreOfficialList = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx.db, token);

    const existing = await ctx.db.query("wilayas").collect();
    const present = new Set(existing.map((w) => w.code));
    let added = 0;

    for (const [code, name, nameAr] of ALGERIA_WILAYAS) {
      if (present.has(code)) continue;
      const prices = defaultDeliveryPrices(code);
      await ctx.db.insert("wilayas", {
        code,
        name,
        nameAr,
        ...prices,
        homeAvailable: true,
        deskAvailable: true,
        isActive: true,
      });
      added++;
    }

    return added;
  },
});
