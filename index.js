/**
 * Compatibility entry point.
 *
 * The application has exactly one server configuration: backend/server.js.
 * Keeping a second Express app here previously bypassed the site-wide access
 * control middleware and referenced an obsolete MongoDB stack. Delegating
 * avoids an accidentally insecure alternate launch path.
 */

import("./backend/server.js").catch((error) => {
  console.error("BayaniHub could not start. Check the backend configuration.");
  if (process.env.NODE_ENV !== "production") console.error(error);
  process.exitCode = 1;
});
