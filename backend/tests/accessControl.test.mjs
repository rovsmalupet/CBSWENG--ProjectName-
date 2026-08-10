/**
 * Access control policy matcher. [CSSECDV 2.2.1, 2.2.2]
 *
 * The table-driven matrix below is the evidence that authorization is decided
 * in one place and fails closed: every assertion here is a statement about the
 * policy table, not about any controller.
 */

import { suite, test, assert, assertEqual } from "./_harness.mjs";
import { resolvePolicy, POLICIES } from "../security/accessControl.js";

suite("Access control — route matching");

test("public data route wins over the parameterised route that shadows it", () => {
  // "/posts/approved" and "/posts/:postId" both match. Specificity scoring must
  // pick the static one; if it did not, the donor feed would demand a session
  // and, far worse, a request for the post whose id is literally "approved"
  // would be answered by the public policy.
  const match = resolvePolicy("GET", "/posts/approved");
  assert(match !== null, "no policy matched");
  assertEqual(match.policy.path, "/posts/approved");
  assert(match.policy.public === true, "expected the public policy to win");
});

test("parameterised route still matches a real id", () => {
  const match = resolvePolicy("GET", "/posts/9f1c2d3e-0000-4444-8888-abcdefabcdef");
  assert(match !== null);
  assertEqual(match.policy.path, "/posts/:postId");
  assert(!match.policy.public, "single-post reads must require authentication");
});

test("path parameters are extracted for ownership resolvers", () => {
  const match = resolvePolicy("PUT", "/posts/abc-123");
  assertEqual(match.params, { postId: "abc-123" });
});

test("the public policy is scoped to its method — PUT /posts/approved is not public", () => {
  // "approved" is a legal (if nonexistent) post id, so this correctly falls
  // through to PUT /posts/:postId. What matters is that it lands on the
  // authenticated, ownership-checked policy and not the public one; the
  // ownership resolver then denies it because no such post exists.
  const match = resolvePolicy("PUT", "/posts/approved");
  assert(match !== null);
  assertEqual(match.policy.path, "/posts/:postId");
  assert(!match.policy.public, "a public GET must not make the same path public for PUT");
  assert(typeof match.policy.owner === "function");
});

test("a method with no policy at all on a known path is denied", () => {
  assertEqual(resolvePolicy("PATCH", "/posts/approved"), null);
});

suite("Access control — default deny [2.2.2]");

const mustBeDenied = [
  ["GET", "/totally/unknown"],
  ["GET", "/posts/abc/nonsense"],
  ["POST", "/security-logs"], // the log is read-only [2.4.4]
  ["PATCH", "/security-logs"],
  ["PUT", "/security-logs"],
  ["DELETE", "/security-logs"],
  ["DELETE", "/security-logs/some-id"],
  ["POST", "/admin/users/u1/role"], // real route is PATCH
  ["GET", "/"],
];

for (const [method, path] of mustBeDenied) {
  test(`${method} ${path} matches no policy and is therefore denied`, () => {
    assertEqual(resolvePolicy(method, path), null);
  });
}

test("the security log has no write policy of any kind", () => {
  const writes = POLICIES.filter(
    (policy) => policy.path.startsWith("/security-logs") && policy.method !== "GET",
  );
  assertEqual(writes, [], "the audit log must be append-only and read-only over HTTP");
});

suite("Access control — role assignment");

const roleExpectations = [
  ["GET", "/security-logs", ["admin"]], // 2.4.4
  ["GET", "/security-logs/event-types", ["admin"]],
  ["GET", "/posts/admin/all", ["admin"]],
  ["PATCH", "/posts/:postId/status", ["admin"]],
  ["GET", "/organizations/pending", ["admin"]],
  ["PATCH", "/organizations/:id/approve", ["admin"]],
  ["GET", "/admin/users", ["admin"]],
  ["POST", "/posts", ["ngo"]],
  ["PUT", "/posts/:postId", ["ngo"]],
  ["DELETE", "/posts/:postId", ["ngo"]],
  ["GET", "/posts/partnerships/incoming", ["ngo"]],
  ["GET", "/posts/partnerships/me", ["donor"]],
  ["PATCH", "/posts/:postId/contribute", ["donor", "ngo"]],
  ["POST", "/refunds/issue", ["ngo", "admin"]],
];

for (const [method, path, roles] of roleExpectations) {
  test(`${method} ${path} is restricted to ${roles.join(", ")}`, () => {
    const match = resolvePolicy(method, path.replace(/:(\w+)/g, "sample-id"));
    assert(match !== null, "no policy matched");
    assertEqual(match.policy.roles, roles);
  });
}

suite("Access control — ownership required on every IDOR-prone route [2.2.2]");

/**
 * Each of these was exploitable before the refactor: role-gated but with no
 * check on *whose* row was being touched.
 */
const mustHaveOwnershipCheck = [
  ["PUT", "/posts/sample", "any NGO could rewrite any other NGO's project"],
  ["DELETE", "/posts/sample", "any NGO could delete any other NGO's project"],
  ["GET", "/posts/sample", "any user could read unpublished and deleted posts"],
  ["POST", "/refunds/issue", "any NGO could refund any payment on any project"],
  ["GET", "/payments/sample", "any user could read any payment record"],
  ["GET", "/payments/history/sample", "any NGO could read another project's payments"],
  ["GET", "/payments/project/sample", "any NGO could read another project's payments"],
  ["GET", "/payments/donor/sample", "any user could read another donor's history"],
  ["GET", "/refunds/sample", "any user could read any refund"],
  ["GET", "/refunds/history/sample", "any NGO could read another project's refunds"],
  ["GET", "/documents/sample", "any user could list another project's documents"],
  ["GET", "/documents/download/sample", "any user could download any document"],
  ["DELETE", "/documents/sample", "any NGO could delete another project's documents"],
  ["POST", "/documents/upload", "any NGO could attach documents to another project"],
];

for (const [method, path, wasExploitable] of mustHaveOwnershipCheck) {
  test(`${method} ${path} declares an ownership resolver — ${wasExploitable}`, () => {
    const match = resolvePolicy(method, path);
    assert(match !== null, "no policy matched");
    assert(
      typeof match.policy.owner === "function",
      "policy has no owner resolver, so object-level access is unchecked",
    );
  });
}

suite("Access control — re-authentication on critical operations [2.1.13]");

const mustRequireReauth = [
  ["POST", "/auth/change-password", "named by the specification"],
  ["DELETE", "/posts/sample/permanent", "irreversible destruction of data"],
  ["POST", "/refunds/issue", "moves money"],
  ["POST", "/admin/users", "creates a privileged account"],
  ["DELETE", "/admin/users/sample", "disables an account"],
  ["PATCH", "/admin/users/sample/role", "grants or removes administrator rights"],
];

for (const [method, path, why] of mustRequireReauth) {
  test(`${method} ${path} requires re-authentication — ${why}`, () => {
    const match = resolvePolicy(method, path);
    assert(match !== null, "no policy matched");
    assert(match.policy.reauth === true, "policy does not require re-authentication");
  });
}

suite("Access control — the public surface is small and deliberate [2.1.1]");

test("only the expected routes are public", () => {
  const publicRoutes = POLICIES.filter((policy) => policy.public)
    .map((policy) => `${policy.method} ${policy.path}`)
    .sort();

  // Locked down as an exact list: adding a public route should require editing
  // this test, which forces the decision to be made consciously.
  assertEqual(publicRoutes, [
    "GET /auth/security-questions",
    "GET /health",
    "GET /posts/approved",
    "GET /verify-reset-token",
    "POST /forgot-password",
    "POST /login",
    "POST /organizations/register",
    "POST /register",
    "POST /reset-password",
    "POST /reset-password/verify-answers",
  ]);
});

test("the only public route returning application data is the approved-post feed", () => {
  const publicDataRoutes = POLICIES.filter(
    (policy) =>
      policy.public &&
      !policy.path.startsWith("/auth") &&
      !["/health", "/login", "/register", "/organizations/register", "/forgot-password",
        "/verify-reset-token", "/reset-password", "/reset-password/verify-answers"].includes(policy.path),
  );
  assertEqual(publicDataRoutes.map((policy) => policy.path), ["/posts/approved"]);
});

suite("Access control — policy table integrity");

test("no two policies declare the same method and path", () => {
  const seen = new Set();
  const duplicates = [];
  for (const policy of POLICIES) {
    const key = `${policy.method} ${policy.path}`;
    if (seen.has(key)) duplicates.push(key);
    seen.add(key);
  }
  assertEqual(duplicates, []);
});

test("every non-public policy names roles or an ownership resolver", () => {
  const unconstrained = POLICIES.filter(
    (policy) => !policy.public && !policy.roles && typeof policy.owner !== "function",
  ).map((policy) => `${policy.method} ${policy.path}`);

  // These are intentionally open to any signed-in user: session management
  // acts on the caller's own account, and the NGO verification profile is the
  // trust page every donor is meant to consult before giving.
  assertEqual(unconstrained, [
    "GET /auth/me",
    "POST /auth/logout",
    "POST /auth/reauth",
    "POST /auth/security-questions",
    "POST /auth/change-password",
    "GET /organizations/:id/verification",
  ]);
});

test("every ownership resolver is a function", () => {
  for (const policy of POLICIES) {
    if (policy.owner !== undefined) {
      assert(
        typeof policy.owner === "function",
        `${policy.method} ${policy.path} has a non-function owner`,
      );
    }
  }
});
