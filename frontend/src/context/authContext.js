/**
 * The auth context object and its hook.
 *
 * Separated from AuthContext.jsx so that file exports only the provider
 * component. Mixing components with other exports breaks React Fast Refresh and
 * is flagged by the project's lint configuration.
 */

import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

/**
 * Read the current session.
 *
 * Throws outside a provider rather than returning null: a component that reads
 * `role` from an undefined context would render as though the user had no
 * permissions — or, with a careless default, as though they had all of them.
 * Failing loudly at development time is the safer default. [CSSECDV 2.2.2]
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
};
