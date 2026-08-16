import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

/**
 * Hands back a short-lived URL the browser POSTs the file straight to, so
 * image bytes never travel through a Convex function or a Next.js route.
 */
export const generateUploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx.db, token);
    return await ctx.storage.generateUploadUrl();
  },
});

export const remove = mutation({
  args: { token: v.string(), storageId: v.id("_storage") },
  handler: async (ctx, { token, storageId }) => {
    await requireAdmin(ctx.db, token);
    await ctx.storage.delete(storageId);
    return null;
  },
});
