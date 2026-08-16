/**
 * Convex wraps thrown errors with its own framing, e.g.
 *   [CONVEX M(orders:create)] [Request ID: abc] Server Error
 *   Uncaught Error: Please enter a valid Algerian phone number.
 *     at handler (../convex/orders.ts:41:7)
 *
 * Customers should see the sentence, not the stack.
 */
export function cleanConvexError(error: unknown): string {
  if (!(error instanceof Error)) return "Une erreur est survenue.";

  const line =
    error.message
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.includes("Uncaught Error:")) ?? error.message;

  return (
    line
      .replace(/^\[.*?\]\s*/g, "")
      .replace(/^Uncaught Error:\s*/, "")
      .replace(/\s+at\s+.*$/, "")
      .trim() || "Une erreur est survenue."
  );
}
