"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery } from "convex/react";
import { api } from "@cvx/_generated/api";

const STORAGE_KEY = "contessa.admin.session";

type AdminSession = {
  token: string | null;
  /** undefined while the stored token is still being checked. */
  authenticated: boolean | undefined;
  signIn: (token: string) => void;
  signOut: () => void;
};

const AdminSessionContext = createContext<AdminSession | null>(null);

export function AdminSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem(STORAGE_KEY));
    setLoaded(true);
  }, []);

  // The token is only a claim until Convex says otherwise — every admin
  // function re-checks it server-side regardless of what this returns.
  const valid = useQuery(
    api.admin.checkSession,
    loaded ? { token: token ?? undefined } : "skip",
  );

  const signIn = useCallback((next: string) => {
    localStorage.setItem(STORAGE_KEY, next);
    setToken(next);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  }, []);

  // An expired or revoked token shouldn't linger in storage.
  useEffect(() => {
    if (loaded && token && valid === false) {
      localStorage.removeItem(STORAGE_KEY);
      setToken(null);
    }
  }, [loaded, token, valid]);

  const value = useMemo<AdminSession>(
    () => ({
      token: valid ? token : null,
      authenticated: !loaded || valid === undefined ? undefined : valid,
      signIn,
      signOut,
    }),
    [token, valid, loaded, signIn, signOut],
  );

  return (
    <AdminSessionContext.Provider value={value}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  const context = useContext(AdminSessionContext);
  if (!context) {
    throw new Error("useAdminSession must be used inside <AdminSessionProvider>.");
  }
  return context;
}

/**
 * Token for mutation arguments. Throws rather than sending `undefined`, which
 * would surface as a confusing "Not authorised" from the server.
 */
export function useAdminToken(): string {
  const { token } = useAdminSession();
  if (!token) throw new Error("Session expired — please sign in again.");
  return token;
}
