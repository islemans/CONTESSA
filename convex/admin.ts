import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import {
  PBKDF2_ITERATIONS,
  SESSION_TTL_MS,
  hashPassword,
  randomHex,
  requireAdmin,
  safeEqual,
} from "./lib/auth";

/** True until the owner has picked a password — drives the first-run screen. */
export const needsSetup = query({
  args: {},
  handler: async (ctx) => {
    const auth = await ctx.db.query("adminAuth").first();
    return auth === null;
  },
});

/**
 * First-run only. Sets the owner password. Once a password exists this throws,
 * so it can't be used to take over the store later.
 */
export const setupPassword = mutation({
  args: { password: v.string() },
  handler: async (ctx, { password }) => {
    const existing = await ctx.db.query("adminAuth").first();
    if (existing) throw new Error("Already configured.");
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const salt = randomHex(16);
    const passwordHash = await hashPassword(password, salt);
    await ctx.db.insert("adminAuth", {
      passwordHash,
      salt,
      iterations: PBKDF2_ITERATIONS,
    });

    return await issueSession(ctx);
  },
});

export const login = mutation({
  args: { password: v.string() },
  handler: async (ctx, { password }) => {
    const auth = await ctx.db.query("adminAuth").first();
    if (!auth) throw new Error("Not configured.");

    const candidate = await hashPassword(password, auth.salt, auth.iterations);
    if (!safeEqual(candidate, auth.passwordHash)) {
      throw new Error("Incorrect password.");
    }

    return await issueSession(ctx);
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (session) await ctx.db.delete(session._id);
    return null;
  },
});

export const checkSession = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, { token }) => {
    if (!token) return false;
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    return session !== null && session.expiresAt > Date.now();
  },
});

export const changePassword = mutation({
  args: { token: v.string(), current: v.string(), next: v.string() },
  handler: async (ctx, { token, current, next }) => {
    await requireAdmin(ctx.db, token);
    if (next.length < 8) {
      throw new Error("New password must be at least 8 characters.");
    }

    const auth = await ctx.db.query("adminAuth").first();
    if (!auth) throw new Error("Not configured.");

    const candidate = await hashPassword(current, auth.salt, auth.iterations);
    if (!safeEqual(candidate, auth.passwordHash)) {
      throw new Error("Current password is incorrect.");
    }

    const salt = randomHex(16);
    await ctx.db.patch(auth._id, {
      salt,
      passwordHash: await hashPassword(next, salt),
      iterations: PBKDF2_ITERATIONS,
    });

    // Signing out everywhere is the point of a password change.
    const sessions = await ctx.db.query("adminSessions").collect();
    await Promise.all(sessions.map((s) => ctx.db.delete(s._id)));

    return null;
  },
});

/**
 * Locked out? This wipes the stored password and every open session, putting
 * the atelier back on its first-run screen so you can choose a new one.
 *
 *   npx convex run admin:forgotPassword
 *
 * Internal, so it can only be run from your own terminal or the Convex
 * dashboard — never from a browser. Add `--prod` to run it against the live
 * shop rather than your local copy.
 */
export const forgotPassword = internalMutation({
  args: {},
  handler: async (ctx) => {
    const auth = await ctx.db.query("adminAuth").first();
    if (auth) await ctx.db.delete(auth._id);

    const sessions = await ctx.db.query("adminSessions").collect();
    await Promise.all(sessions.map((s) => ctx.db.delete(s._id)));

    return "Password cleared. Open the atelier to set a new one.";
  },
});

/** Headline numbers for the dashboard landing page. */
export const overview = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx.db, token);

    const orders = await ctx.db.query("orders").collect();
    const products = await ctx.db.query("products").collect();
    const categories = await ctx.db.query("categories").collect();

    const earned = orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + o.total, 0);

    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      deliveredOrders: orders.filter((o) => o.status === "delivered").length,
      revenue: earned,
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.isActive).length,
      totalCategories: categories.length,
      outOfStock: products.filter((p) => p.trackStock && p.stock <= 0).length,
    };
  },
});

async function issueSession(ctx: MutationCtx) {
  const token = randomHex(32);
  await ctx.db.insert("adminSessions", {
    token,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
}
