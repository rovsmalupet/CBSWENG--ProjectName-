/**
 * passwordPolicy.js — the client's mirror of the server password policy.
 * [CSSECDV 2.1.5, 2.1.6]
 *
 * Lives apart from the PasswordField component so both the field and the
 * registration forms can import the rules without either file mixing
 * components and constants.
 *
 * THIS IS NOT THE POLICY. It is a copy of it, for feedback while typing. The
 * authority is backend/security/passwordPolicy.js, which re-checks every rule
 * on every submission and applies several more besides — the common-password
 * denylist, the contextual checks against the user's own name and email, and
 * the re-use and minimum-age rules. Those deliberately stay server-side:
 * shipping a denylist to the browser would tell an attacker exactly what is
 * filtered, and history and age cannot be evaluated without the database.
 */

export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 64;

export const POLICY_RULES = [
  {
    key: "length",
    label: `Between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`,
    test: (value) => value.length >= MIN_PASSWORD_LENGTH && value.length <= MAX_PASSWORD_LENGTH,
  },
  { key: "lower", label: "A lowercase letter", test: (value) => /[a-z]/.test(value) },
  { key: "upper", label: "An uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { key: "digit", label: "A number", test: (value) => /[0-9]/.test(value) },
  {
    key: "symbol",
    label: "A symbol (! ? @ # $ % & *)",
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];
