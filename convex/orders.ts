import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { orderStatus, deliveryType } from "./schema";
import { requireAdmin } from "./lib/auth";
import { randomHex } from "./lib/auth";

/**
 * Placing an order.
 *
 * The client sends only *what* was ordered — product ids, quantities, variant
 * choices. Every dinar is recomputed here from the database. A browser can
 * post anything it likes to a Convex mutation, so a price arriving from the
 * client would be a price the customer got to choose.
 */
export const create = mutation({
  args: {
    customerName: v.string(),
    phone: v.string(),
    wilayaCode: v.number(),
    commune: v.optional(v.string()),
    address: v.optional(v.string()),
    deliveryType,
    note: v.optional(v.string()),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        size: v.optional(v.string()),
        color: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();

    if (settings && !settings.storeOpen) {
      throw new Error("The boutique is not accepting orders right now.");
    }

    if (args.items.length === 0) throw new Error("Your bag is empty.");
    if (args.customerName.trim().length < 2) {
      throw new Error("Please enter your full name.");
    }

    // Algerian mobile numbers: 0[5-7] + 8 digits, spaces and dashes tolerated.
    const phone = args.phone.replace(/[\s-]/g, "");
    if (!/^0[5-7]\d{8}$/.test(phone)) {
      throw new Error("Please enter a valid Algerian phone number (e.g. 0551234567).");
    }

    const wilaya = await ctx.db
      .query("wilayas")
      .withIndex("by_code", (q) => q.eq("code", args.wilayaCode))
      .unique();
    if (!wilaya || !wilaya.isActive) {
      throw new Error("We don't deliver to that wilaya yet.");
    }

    const wantsHome = args.deliveryType === "home";
    if (wantsHome && !wilaya.homeAvailable) {
      throw new Error(`Home delivery isn't available in ${wilaya.name}.`);
    }
    if (!wantsHome && !wilaya.deskAvailable) {
      throw new Error(`Desk delivery isn't available in ${wilaya.name}.`);
    }
    if (wantsHome && !args.address?.trim()) {
      throw new Error("Please enter your delivery address.");
    }

    const items = [];
    let subtotal = 0;

    for (const line of args.items) {
      const quantity = Math.floor(line.quantity);
      if (quantity < 1) throw new Error("Invalid quantity.");

      const product = await ctx.db.get(line.productId);
      if (!product || !product.isActive) {
        throw new Error("One of the items is no longer available.");
      }
      if (product.trackStock && product.stock < quantity) {
        throw new Error(
          `Only ${product.stock} left of ${product.name}.`,
        );
      }
      if (line.size && !product.sizes.includes(line.size)) {
        throw new Error(`"${line.size}" isn't an option for ${product.name}.`);
      }
      if (line.color && !product.colors.some((c) => c.name === line.color)) {
        throw new Error(`"${line.color}" isn't an option for ${product.name}.`);
      }

      subtotal += product.price * quantity;
      items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
        size: line.size,
        color: line.color,
        image: product.cover,
      });
    }

    const threshold = settings?.freeDeliveryThreshold ?? 0;
    const qualifiesFree = threshold > 0 && subtotal >= threshold;
    const deliveryPrice = qualifiesFree
      ? 0
      : wantsHome
        ? wilaya.homePrice
        : wilaya.deskPrice;

    const reference = `CT-${randomHex(3).toUpperCase()}`;

    const orderId = await ctx.db.insert("orders", {
      reference,
      customerName: args.customerName.trim(),
      phone,
      wilayaCode: wilaya.code,
      wilayaName: wilaya.name,
      commune: args.commune?.trim() || undefined,
      address: args.address?.trim() || undefined,
      deliveryType: args.deliveryType,
      deliveryPrice,
      items,
      subtotal,
      total: subtotal + deliveryPrice,
      status: "pending",
      note: args.note?.trim() || undefined,
    });

    for (const line of items) {
      const product = await ctx.db.get(line.productId);
      if (product?.trackStock) {
        await ctx.db.patch(product._id, {
          stock: Math.max(0, product.stock - line.quantity),
        });
      }
    }

    return { orderId, reference };
  },
});

/** Order confirmation page. The reference is unguessable, so this stays public. */
export const getByReference = query({
  args: { reference: v.string() },
  handler: async (ctx, { reference }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_reference", (q) => q.eq("reference", reference))
      .unique();
  },
});

export const list = query({
  args: {
    token: v.optional(v.string()),
    status: v.optional(orderStatus),
  },
  handler: async (ctx, { token, status }) => {
    await requireAdmin(ctx.db, token);

    const rows = status
      ? await ctx.db
          .query("orders")
          .withIndex("by_status", (q) => q.eq("status", status))
          .collect()
      : await ctx.db.query("orders").collect();

    return rows.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const updateStatus = mutation({
  args: { token: v.string(), id: v.id("orders"), status: orderStatus },
  handler: async (ctx, { token, id, status }) => {
    await requireAdmin(ctx.db, token);

    const order = await ctx.db.get(id);
    if (!order) throw new Error("Order not found.");

    // Cancelling releases the reserved stock back to the shelf.
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const line of order.items) {
        const product = await ctx.db.get(line.productId);
        if (product?.trackStock) {
          await ctx.db.patch(product._id, {
            stock: product.stock + line.quantity,
          });
        }
      }
    }

    await ctx.db.patch(id, { status });
    return null;
  },
});

export const remove = mutation({
  args: { token: v.string(), id: v.id("orders") },
  handler: async (ctx, { token, id }) => {
    await requireAdmin(ctx.db, token);
    await ctx.db.delete(id);
    return null;
  },
});
