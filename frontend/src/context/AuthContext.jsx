/**
 * AuthContext — the session, as the SERVER understands it.
 *
 * The old `RequireRole` read `localStorage.getItem("userRole")` and let the
 * user in if it matched. Anyone could open devtools, set
 * `localStorage.userRole = "admin"`, and reach the admin dashboard. The backend
 * still refused every request, so no data leaked — but the app appeared to
 * grant access, which is both alarming and a bug.
 *
 * Here the role comes from `GET /auth/me`. Editing localStorage now achieves
 * nothing: the token is what the server checks, and the role it returns is read
 * from the database on every call.
 *
 * This is defence in depth, not the control itself. The backend remains
 * authoritative — see security/accessControl.js. [CSSECDV 2.1.1, 2.2.1]
 */

import { useEffect, useState, useCallback } from "react";
import {
  apiGet,
  apiPost,
  clearSession,
  getToken,
  setUnauthorizedHandler,
  setReauthToken,
  clearReauthToken,
} from "../config/api.js";
import { AuthContext } from "./authContext.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  /** Populated at sign-in and shown once as a banner. [2.1.12] */
  const [previousAccess, setPreviousAccess] = useState(null);

  /** Confirm the session against the server. */
  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const data = await apiGet("/auth/me");
      setUser(data.user);
      return data.user;
    } catch {
      // Expired, revoked, or the account was disabled. apiFetch has already
      // cleared the session on a 401.
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // A 401 from ANY request ends the session, wherever it happened.
    setUnauthorizedHandler(() => {
      setUser(null);
      setPreviousAccess(null);
    });
    refresh();
  }, [refresh]);

  /**
   * Restores the banner after a page reload so a user who lands on their
   * dashboard and refreshes does not lose the notice that someone tried to
   * sign in as them.
   */
  useEffect(() => {
    const stored = localStorage.getItem("previousAccess");
    if (stored) {
      try {
        setPreviousAccess(JSON.parse(stored));
      } catch {
        localStorage.removeItem("previousAccess");
      }
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiPost("/login", { email, password });

    localStorage.setItem("token", data.token);
    // Convenience copies for existing pages. Nothing security-relevant is
    // decided from these — the role that matters comes from /auth/me.
    localStorage.setItem("userRole", data.user.role);
    localStorage.setItem("userId", data.user.id ?? "");
    localStorage.setItem("userFirstName", data.user.firstName ?? "User");
    localStorage.setItem("userCountry", data.user.country ?? "Philippines");
    localStorage.setItem("previousAccess", JSON.stringify(data.previousAccess ?? {}));

    setUser(data.user);
    setPreviousAccess(data.previousAccess ?? null);
    return data.user;
  }, []);

  /**
   * Signing out tells the SERVER, which increments the account's token version
   * and invalidates every outstanding session. Previously logout only cleared
   * localStorage, so a copied token stayed valid for its full seven-day life.
   */
  const logout = useCallback(async () => {
    try {
      await apiPost("/auth/logout", {});
    } catch {
      // Already expired or unreachable — clear locally regardless.
    }
    clearSession();
    setUser(null);
    setPreviousAccess(null);
  }, []);

  /** Exchange the current password for a short-lived re-auth token. [2.1.13] */
  const reauthenticate = useCallback(async (currentPassword) => {
    const data = await apiPost("/auth/reauth", { currentPassword });
    setReauthToken(data.reauthToken);
    return data;
  }, []);

  const dismissPreviousAccess = useCallback(() => {
    setPreviousAccess(null);
    localStorage.removeItem("previousAccess");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        loading,
        isAuthenticated: Boolean(user),
        previousAccess,
        dismissPreviousAccess,
        login,
        logout,
        refresh,
        reauthenticate,
        clearReauthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
