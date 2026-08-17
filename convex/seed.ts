import { internalMutation } from "./_generated/server";
import {
  ALGERIA_WILAYAS,
  DEFAULT_SETTINGS,
  defaultDeliveryPrices,
} from "./lib/defaults";

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
 * Puts the colours back to the original Contessa palette:
 *   npx convex run seed:resetTheme
 *
 * The dashboard has a Réinitialiser button that does the same thing; this is
 * the version that works when you can't get in, alongside admin:forgotPassword.
 */
export const resetTheme = internalMutation({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();

    if (!row) {
      await ctx.db.insert("settings", DEFAULT_SETTINGS);
      return "Settings created with the default theme.";
    }

    await ctx.db.patch(row._id, { theme: DEFAULT_SETTINGS.theme });
    return "Theme reset to the Contessa palette.";
  },
});

/**
 * Fills the shop with placeholder categories and products so you can see the
 * layout before your own photos are ready:
 *   npx convex run seed:demoCatalogue
 *
 * Products land without images — the cards fall back to the monogram frame.
 * Clear it all again with seed:clearCatalogue.
 */
export const demoCatalogue = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").collect();
    if (existing.length > 0) {
      return "Products already exist — skipped so nothing of yours is touched.";
    }

    const categories: [string, string][] = [
      ["Maquillage", "مكياج"],
      ["Prêt-à-porter", "ملابس"],
      ["Sacs & Accessoires", "حقائب وإكسسوارات"],
    ];

    const categoryIds = [];
    for (const [index, [name, nameAr]] of categories.entries()) {
      categoryIds.push(
        await ctx.db.insert("categories", {
          name,
          nameAr,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          order: index,
          isActive: true,
        }),
      );
    }

    const products: [number, string, number, number | undefined, string[], { name: string; hex: string }[]][] = [
      [0, "Rouge à lèvres Velours", 2400, 3200, [], [
        { name: "Rouge Contessa", hex: "#B5253C" },
        { name: "Nude Rosé", hex: "#C98A78" },
      ]],
      [0, "Palette Ombres Dorées", 4600, undefined, [], []],
      [1, "Robe Longue Satin", 8900, 11500, ["S", "M", "L"], [
        { name: "Émeraude", hex: "#0F5132" },
        { name: "Noir", hex: "#1A1A1A" },
      ]],
      [1, "Blouse Soie Ivoire", 5400, undefined, ["S", "M", "L", "XL"], [
        { name: "Ivoire", hex: "#F3E9DC" },
      ]],
      [2, "Sac à Main Cuir Camel", 7200, 8800, [], [
        { name: "Camel", hex: "#A97B4F" },
      ]],
      [2, "Foulard Soie Imprimé", 2900, undefined, [], []],
    ];

    for (const [
      categoryIndex,
      name,
      price,
      compareAtPrice,
      sizes,
      colors,
    ] of products) {
      await ctx.db.insert("products", {
        name,
        slug: name
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        description:
          "Exemple de description. Remplacez ce texte depuis le tableau de bord.",
        categoryId: categoryIds[categoryIndex],
        price,
        compareAtPrice,
        gallery: [],
        sizes,
        colors,
        stock: 10,
        trackStock: false,
        isActive: true,
        isFeatured: true,
        order: 0,
      });
    }

    return `Created ${categories.length} categories and ${products.length} products.`;
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
