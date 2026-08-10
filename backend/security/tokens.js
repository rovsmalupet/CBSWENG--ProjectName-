/**
 * tokens.js — issuing and verifying JWTs.
 *
 * Two distinct token types, and they are not interchangeable:
 *
 *   access  identifies the caller on every request. 30 minutes.
 *   reauth  proves the caller re-entered their password *just now*, required
 *           before critical operations. 5 minutes. [CSSECDV 2.1.13]
 *
 * Each carries a `purpose` claim that is checked on verification, so an access
 * token can never be presented where a re-auth token is demanded. Without that
 * claim, simply being logged in would satisfy the re-authentication
 * requirement — which would make the control decorative.
 *
 * Every token also carries `tv` (tokenVersion). The access-control layer
 * compares it against the account's current value on each request, giving real
 * server-side revocation: logout, a password change, a role change, or an admin
 * disabling the account all invalidate outstanding tokens immediately.
 */

import jwt from "jsonwebtoken";
import config from "./env.js";

const ISSUER = "bayanihub";

export const PURPOSE = Object.freeze({
  ACCESS: "access",
  REAUTH: "reauth",
});

/**
 * @param {object} account  UserAccount row
 * @param {string} profileId  Admin.id / Donor.id / Organization.id
 *
 * `pid` is the profile id and becomes `req.user.id`. Post.orgId,
 * DonorOrganizationPartner.donorId, and Payment.userId all reference profile
 * ids, so keeping that meaning stable is what allowed authentication to be
 * unified without rewriting every controller.
 */
export const issueAccessToken = (account, profileId) =>
  jwt.sign(
    {
      sub: account.id,
      pid: profileId,
      role: account.role,
      tv: account.tokenVersion,
      purpose: PURPOSE.ACCESS,
    },
    config.jwtSecret,
    {
      expiresIn: `${config.accessTokenTtlMinutes}m`,
      issuer: ISSUER,
      algorithm: "HS256",
    },
  );

export const issueReauthToken = (account) =>
  jwt.sign(
    {
      sub: account.id,
      tv: account.tokenVersion,
      purpose: PURPOSE.REAUTH,
    },
    config.jwtSecret,
    {
      expiresIn: `${config.reauthTokenTtlMinutes}m`,
      issuer: ISSUER,
      algorithm: "HS256",
    },
  );

/**
 * Verify a token and confirm it was issued for the purpose being demanded.
 *
 * `algorithms` is pinned to HS256 explicitly. Left unpinned, a token whose
 * header declares `alg: none` — or an asymmetric algorithm confusion attack —
 * can bypass signature checking entirely in some configurations. Naming the
 * algorithm we expect closes that class of attack.
 *
 * @returns {{ valid: true, payload: object } | { valid: false, reason: string }}
 */
export const verifyToken = (token, expectedPurpose) => {
  if (typeof token !== "string" || token.length === 0) {
    return { valid: false, reason: "missing" };
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret, {
      issuer: ISSUER,
      algorithms: ["HS256"],
    });

    if (payload.purpose !== expectedPurpose) {
      return { valid: false, reason: "wrong_purpose" };
    }
    return { valid: true, payload };
  } catch (error) {
    if (error.name === "TokenExpiredError") return { valid: false, reason: "expired" };
    return { valid: false, reason: "invalid" };
  }
};

/** Pull a bearer token out of the Authorization header. */
export const bearerToken = (req) => {
  const header = req.headers?.authorization;
  if (typeof header !== "string" || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
};

/** Re-auth tokens travel in their own header so they cannot be confused with the session. */
export const reauthTokenFrom = (req) => {
  const header = req.headers?.["x-reauth-token"];
  return typeof header === "string" && header.length > 0 ? header.trim() : null;
};

export default {
  PURPOSE,
  issueAccessToken,
  issueReauthToken,
  verifyToken,
  bearerToken,
  reauthTokenFrom,
};
