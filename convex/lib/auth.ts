import type { GenericDatabaseReader, GenericDatabaseWriter } from "convex/server";
import type { DataModel } from "../_generated/dataModel";

type Reader = GenericDatabaseReader<DataModel>;
type Writer = GenericDatabaseWriter<DataModel>;

export const PBKDF2_ITERATIONS = 210_000;
export const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function randomHex(bytes: number): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return toHex(array.buffer);
}

/**
 * PBKDF2-SHA256 via the Web Crypto API, which Convex's default runtime
 * provides. Deliberately not bcrypt — that needs a native module and would
 * force every auth call into a Node action.
 */
export async function hashPassword(
  password: string,
  salt: string,
  iterations: number = PBKDF2_ITERATIONS,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(salt),
      iterations,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return toHex(bits);
}

/** Length-constant comparison, so a wrong password can't be timed character by character. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Every admin function must call this. Convex functions are public HTTP
 * endpoints — hiding a button in the UI protects nothing, so authorisation
 * has to happen here, on the server, on each individual call.
 */
export async function requireAdmin(
  db: Reader | Writer,
  token: string | undefined,
): Promise<void> {
  if (!token) throw new Error("Not authorised.");

  const session = await db
    .query("adminSessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();

  if (!session) throw new Error("Not authorised.");
  if (session.expiresAt < Date.now()) throw new Error("Session expired.");
}
