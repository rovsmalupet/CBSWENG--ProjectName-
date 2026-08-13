import { suite, test, assert, assertEqual } from "./_harness.mjs";
import {
  createBookmarkSchema,
  updateBookmarkSchema,
  bookmarkIdSchema,
  MAX_BOOKMARK_NOTE_LENGTH,
} from "../schemas/bookmark.schema.js";
import { resolvePolicy, invalidPolicyIdentifiers } from "../security/accessControl.js";
import { bookmarkBelongsToAccount } from "../security/owners.js";
import { classifyError } from "../middleware/errorHandler.js";
import { EVENTS } from "../security/securityLog.js";

const PROJECT_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const BOOKMARK_ID = "550e8400-e29b-41d4-a716-446655440000";
const ACCOUNT_ID = "9f1c2d3e-0000-4444-8888-abcdefabcdef";

const parse = (schema, { body = {}, params = {}, query = {} } = {}) =>
  schema.safeParse({ body, params, query });

suite("Donor bookmarks — strict validation");

test("a project id and a note up to 280 characters are accepted", () => {
  assert(parse(createBookmarkSchema, {
    body: { projectId: PROJECT_ID, note: "x".repeat(MAX_BOOKMARK_NOTE_LENGTH) },
  }).success);
});

test("an overlong note is rejected rather than truncated", () => {
  assert(!parse(createBookmarkSchema, {
    body: { projectId: PROJECT_ID, note: "x".repeat(MAX_BOOKMARK_NOTE_LENGTH + 1) },
  }).success);
});

test("a caller cannot submit an account owner or change a bookmark target", () => {
  assert(!parse(createBookmarkSchema, {
    body: { projectId: PROJECT_ID, accountId: ACCOUNT_ID },
  }).success);
  assert(!parse(updateBookmarkSchema, {
    params: { bookmarkId: BOOKMARK_ID },
    body: { note: "private", projectId: PROJECT_ID },
  }).success);
});

test("bookmark identifiers and unsupported control characters are rejected", () => {
  assert(!parse(bookmarkIdSchema, { params: { bookmarkId: "not-a-uuid" } }).success);
  assert(!parse(updateBookmarkSchema, {
    params: { bookmarkId: BOOKMARK_ID },
    body: { note: "hello\u0000world" },
  }).success);
});

suite("Donor bookmarks — least privilege and ownership");

for (const [method, path] of [
  ["GET", "/bookmarks"],
  ["POST", "/bookmarks"],
  ["PATCH", `/bookmarks/${BOOKMARK_ID}`],
  ["DELETE", `/bookmarks/${BOOKMARK_ID}`],
]) {
  test(`${method} ${path} is donor-only`, () => {
    const match = resolvePolicy(method, path);
    assert(match !== null);
    assertEqual(match.policy.roles, ["donor"]);
    assert(match.policy.public !== true);
  });
}

test("create requires an approved-project resolver and a UUID project id", () => {
  const match = resolvePolicy("POST", "/bookmarks");
  assert(typeof match.policy.owner === "function");
  assertEqual(invalidPolicyIdentifiers(match.policy, {}, { projectId: "not-an-id" }), [
    "body.projectId",
  ]);
  assertEqual(invalidPolicyIdentifiers(match.policy, {}, { projectId: PROJECT_ID }), []);
});

test("update and delete both resolve the bookmark owner", () => {
  for (const method of ["PATCH", "DELETE"]) {
    const match = resolvePolicy(method, `/bookmarks/${BOOKMARK_ID}`);
    assert(typeof match.policy.owner === "function");
  }
});

test("the ownership predicate allows only the matching account", () => {
  const record = { id: BOOKMARK_ID, accountId: ACCOUNT_ID, projectId: PROJECT_ID };
  assert(bookmarkBelongsToAccount(record, ACCOUNT_ID));
  assert(!bookmarkBelongsToAccount(record, PROJECT_ID));
  assert(!bookmarkBelongsToAccount(null, ACCOUNT_ID));
});

test("a duplicate database constraint is a safe conflict, not a schema leak", () => {
  const duplicate = new Error("Unique constraint failed on DonorBookmark_accountId_projectId_key");
  duplicate.code = "P2002";
  const safe = classifyError(duplicate, { method: "POST", originalUrl: "/bookmarks" });
  assertEqual(safe.statusCode, 409);
  assertEqual(safe.code, "DATABASE_CONSTRAINT");
  assert(!safe.message.includes("DonorBookmark"));
});

test("successful bookmark mutations have dedicated audit events", () => {
  assertEqual(EVENTS.BOOKMARK_CREATED, "BOOKMARK_CREATED");
  assertEqual(EVENTS.BOOKMARK_UPDATED, "BOOKMARK_UPDATED");
  assertEqual(EVENTS.BOOKMARK_DELETED, "BOOKMARK_DELETED");
});
