import { internalMutation } from "./_generated/server";
import { ALGERIA_WILAYAS, DEFAULT_SETTINGS, defaultDeliveryPrices } from "./lib/defaults";

/**
 * One-time bootstrap: writes the settings row and the 58 wilayas.
 *
 * Internal on purpose — it can only be triggered from the CLI or dashboard,
 * never from a browser. Run it with:
 *   npx convex run seed:init
 *
 * Re-running is safe; it skips anything that already exists.
 */
export const init = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existingSettings = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();

    if (!existingSettings) {
      await ctx.db.insert("settings", DEFAULT_SETTINGS);
    }

    const existingWilayas = await ctx.db.query("wilayas").collect();
    const present = new Set(existingWilayas.map((w) => w.code));
    let added = 0;

    for (const [code, name, nameAr] of ALGERIA_WILAYAS) {
      if (present.has(code)) continue;
      await ctx.db.insert("wilayas", {
        code,
        name,
        nameAr,
        ...defaultDeliveryPrices(code),
        homeAvailable: true,
        deskAvailable: true,
        isActive: true,
      });
      added++;
    }

    return {
      settings: existingSettings ? "already present" : "created",
      wilayasAdded: added,
      wilayasTotal: existingWilayas.length + added,
    };
  },
});

/**
 * Wipes catalogue data (products, categories, orders) but keeps your password,
 * settings and delivery prices. Handy after testing:
 *   npx convex run seed:clearCatalogue
 */
export const clearCatalogue = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const table of ["orders", "products", "categories"] as const) {
      const rows = await ctx.db.query(table).collect();
      await Promise.all(rows.map((row) => ctx.db.delete(row._id)));
    }
    return "Catalogue cleared.";
  },
});
