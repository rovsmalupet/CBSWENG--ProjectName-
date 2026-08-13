/**
 * Input validation. [CSSECDV 2.3.1, 2.3.2, 2.3.3]
 *
 * The rejection cases matter more than the acceptance cases: several of these
 * inputs were previously *repaired* and stored, which is exactly what 2.3.1
 * forbids.
 */

import { suite, test, assert, assertEqual, assertIncludes } from "./_harness.mjs";
import { createPostSchema, addContributionSchema, updatePostStatusSchema } from "../schemas/post.schema.js";
import {
  createPaymentIntentSchema,
  confirmPaymentSchema,
  issueRefundSchema,
  securityLogQuerySchema,
} from "../schemas/misc.schema.js";
import {
  loginSchema,
  registerDonorSchema,
  registerOrganizationSchema,
  changePasswordSchema,
  listUsersSchema,
} from "../schemas/auth.schema.js";
import { emptyRequestSchema } from "../schemas/common.js";

const UUID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const OTHER_UUID = "550e8400-e29b-41d4-a716-446655440000";

/** Run a schema against a request-shaped object. */
const check = (schema, { body = {}, params = {}, query = {} } = {}) =>
  schema.safeParse({ body, params, query });

const accepts = (schema, input, label) => {
  const result = check(schema, input);
  assert(
    result.success,
    `${label ?? "input"} should have been accepted but was rejected: ${
      result.success ? "" : result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" | ")
    }`,
  );
  return result.data;
};

const rejects = (schema, input, label) => {
  const result = check(schema, input);
  assert(!result.success, `${label ?? "input"} should have been rejected but was accepted`);
  return result.error.issues;
};

/* ═══════════════════════════════════════════════════════════════════════════ */

suite("Validation — a valid project is accepted");

const validProject = {
  projectName: "Community Medical Mission",
  description: "Free medical checkup for the barangay.",
  location: "Manila",
  causes: ["goodHealth"],
  priority: "High",
  supportTypes: {
    monetary: { enabled: true, targetAmount: 50000 },
    volunteer: { enabled: false, targetVolunteers: 0 },
    inKind: [{ itemName: "Medical Supplies", targetQuantity: 100, unit: "boxes", pricePerUnit: 250 }],
  },
};

test("a well-formed project passes", () => {
  accepts(createPostSchema, { body: validProject });
});

suite("Validation — rejection replaces silent repair [2.3.1]");

test("a budget breakdown that does not sum to 100 is rejected, not rescaled", () => {
  // WAS: normalizeBudgetBreakdown rescaled the percentages to sum to 100, so
  // the stored budget was not the one submitted.
  const issues = rejects(createPostSchema, {
    body: {
      ...validProject,
      budgetBreakdown: [
        { label: "Food", percentage: 50 },
        { label: "Logistics", percentage: 37 },
      ],
    },
  });
  assertIncludes(issues.map((issue) => issue.message), "add up to exactly 100");
});

test("a budget category with no name is rejected, not dropped", () => {
  rejects(createPostSchema, {
    body: {
      ...validProject,
      budgetBreakdown: [
        { label: "   ", percentage: 100 },
      ],
    },
  });
});

test("a malformed budget breakdown is rejected, not replaced with a default", () => {
  // WAS: any of these silently became a hardcoded 80/10/10 split.
  for (const bad of ["not json at all", 42, {}, []]) {
    rejects(createPostSchema, { body: { ...validProject, budgetBreakdown: bad } }, String(bad));
  }
});

test("an in-kind item with no name is rejected, not filtered out of the list", () => {
  // WAS: buildPostData silently removed items failing its shape check, so a
  // project could be published advertising fewer needs than were submitted.
  rejects(createPostSchema, {
    body: {
      ...validProject,
      supportTypes: {
        ...validProject.supportTypes,
        inKind: [{ itemName: "", targetQuantity: 10, unit: "boxes" }],
      },
    },
  });
});

test("an in-kind item with a zero quantity is rejected, not filtered out", () => {
  rejects(createPostSchema, {
    body: {
      ...validProject,
      supportTypes: {
        ...validProject.supportTypes,
        inKind: [{ itemName: "Rice", targetQuantity: 0, unit: "sacks" }],
      },
    },
  });
});

test("a numeric field given a numeric STRING is rejected, not coerced", () => {
  // WAS: parseFloat("50000") happily produced a number, and parseFloat("abc")
  // produced NaN, which then reached the database.
  rejects(createPostSchema, {
    body: {
      ...validProject,
      supportTypes: { ...validProject.supportTypes, monetary: { enabled: true, targetAmount: "50000" } },
    },
  });
});

suite("Validation — unknown keys are rejected, not stripped");

test("an unexpected field in the body is rejected", () => {
  // Mass-assignment defence: controllers previously spread req.body into
  // Prisma writes, so a stray key could reach a column the endpoint never
  // meant to expose.
  const issues = rejects(createPostSchema, {
    body: { ...validProject, overallStatus: "Approved" },
  });
  assertIncludes(issues.map((issue) => issue.code).join(","), "unrecognized_keys");
});

test("a project cannot smuggle in its own orgId", () => {
  rejects(createPostSchema, { body: { ...validProject, orgId: OTHER_UUID } });
});

test("omitted request sections are strict-empty rather than passthrough", () => {
  rejects(emptyRequestSchema, { body: { unexpected: true } });
  rejects(emptyRequestSchema, { params: { unexpected: "value" } });
  rejects(emptyRequestSchema, { query: { unexpected: "value" } });
});

test("non-identity surrounding whitespace is rejected, not trimmed", () => {
  rejects(createPostSchema, { body: { ...validProject, projectName: " Community Mission" } });
  rejects(createPostSchema, { body: { ...validProject, description: "Description " } });
  rejects(createPostSchema, {
    body: {
      ...validProject,
      budgetBreakdown: [{ label: "Food ", percentage: 100 }],
    },
  });
});

suite("Validation — range [2.3.2]");

const rangeCases = [
  ["a negative fundraising goal", { monetary: { enabled: true, targetAmount: -5000 } }],
  ["a fundraising goal above the ceiling", { monetary: { enabled: true, targetAmount: 99_000_000 } }],
  ["a fractional volunteer count", { volunteer: { enabled: true, targetVolunteers: 3.5 } }],
  ["a negative volunteer count", { volunteer: { enabled: true, targetVolunteers: -10 } }],
  ["a volunteer count above the ceiling", { volunteer: { enabled: true, targetVolunteers: 99_999 }}],
  ["a nonzero target on a disabled monetary option", { monetary: { enabled: false, targetAmount: 500 } }],
  ["a nonzero target on a disabled volunteer option", { volunteer: { enabled: false, targetVolunteers: 5 } }],
];

for (const [label, supportOverride] of rangeCases) {
  test(`${label} is rejected`, () => {
    rejects(createPostSchema, {
      body: {
        ...validProject,
        supportTypes: { ...validProject.supportTypes, ...supportOverride },
      },
    });
  });
}

test("an unrecognised cause is rejected", () => {
  rejects(createPostSchema, { body: { ...validProject, causes: ["worldDomination"] } });
});

test("an empty cause list is rejected", () => {
  rejects(createPostSchema, { body: { ...validProject, causes: [] } });
});

test("duplicate causes are rejected", () => {
  rejects(createPostSchema, { body: { ...validProject, causes: ["goodHealth", "goodHealth"] } });
});

test("an unrecognised priority is rejected", () => {
  rejects(createPostSchema, { body: { ...validProject, priority: "Urgent" } });
});

test("an end date before the start date is rejected", () => {
  const issues = rejects(createPostSchema, {
    body: { ...validProject, startDate: "2026-12-01", endDate: "2026-11-01" },
  });
  assertIncludes(issues.map((issue) => issue.message), "on or after the start date");
});

test("a nonsensical date is rejected", () => {
  rejects(createPostSchema, { body: { ...validProject, startDate: "2026-13-45" } });
  rejects(createPostSchema, { body: { ...validProject, startDate: "2026-02-30" } });
  rejects(createPostSchema, { body: { ...validProject, startDate: "not a date" } });
  rejects(createPostSchema, { body: { ...validProject, startDate: "20256-01-01" } });
});

test("a malformed time is rejected", () => {
  rejects(createPostSchema, { body: { ...validProject, startTime: "25:00" } });
  rejects(createPostSchema, { body: { ...validProject, startTime: "9am" } });
});

test("a project with no support type at all is rejected", () => {
  rejects(createPostSchema, {
    body: {
      ...validProject,
      supportTypes: {
        monetary: { enabled: false, targetAmount: 0 },
        volunteer: { enabled: false, targetVolunteers: 0 },
        inKind: [],
      },
    },
  });
});

suite("Validation — length [2.3.3]");

test("an over-long project name is rejected", () => {
  rejects(createPostSchema, { body: { ...validProject, projectName: "x".repeat(201) } });
});

test("a project name that is too short is rejected", () => {
  rejects(createPostSchema, { body: { ...validProject, projectName: "ab" } });
});

test("an over-long description is rejected", () => {
  rejects(createPostSchema, { body: { ...validProject, description: "x".repeat(5001) } });
});

test("an over-long location is rejected", () => {
  rejects(createPostSchema, { body: { ...validProject, location: "x".repeat(201) } });
});

test("an over-long item name is rejected", () => {
  rejects(createPostSchema, {
    body: {
      ...validProject,
      supportTypes: {
        ...validProject.supportTypes,
        inKind: [{ itemName: "x".repeat(101), targetQuantity: 5, unit: "kg" }],
      },
    },
  });
});

suite("Validation — identifiers reach the database well-formed");

test("a malformed project id is rejected before it reaches Prisma", () => {
  // WAS: a bad id went straight to Prisma, which threw, producing a 500 that
  // carried the driver's own message back to the caller. [2.4.1]
  rejects(updatePostStatusSchema, {
    params: { postId: "'; DROP TABLE Post; --" },
    body: { overallStatus: "Approved" },
  });
  rejects(updatePostStatusSchema, { params: { postId: "123" }, body: { overallStatus: "Approved" } });
  rejects(updatePostStatusSchema, { params: { postId: "" }, body: { overallStatus: "Approved" } });
});

test("a well-formed project id is accepted", () => {
  accepts(updatePostStatusSchema, { params: { postId: UUID }, body: { overallStatus: "Approved" } });
});

test("an unrecognised project status is rejected", () => {
  rejects(updatePostStatusSchema, { params: { postId: UUID }, body: { overallStatus: "Published" } });
});

suite("Validation — payments cannot be priced by the client [2.2.3]");

test("the intent schema has no fee fields at all", () => {
  // Not merely bounded — absent. With .strict(), sending one is a rejection,
  // so an old client fails loudly instead of appearing to work.
  const issues = rejects(createPaymentIntentSchema, {
    body: { postId: UUID, monetaryAmount: 100000, monetaryFee: 1, volunteerFee: 0, inKindFee: 0 },
  });
  assertIncludes(issues.map((issue) => issue.code).join(","), "unrecognized_keys");
});

test("a legitimate intent request is accepted", () => {
  accepts(createPaymentIntentSchema, { body: { postId: UUID, monetaryAmount: 5000 } });
});

test("an empty contribution is rejected", () => {
  rejects(createPaymentIntentSchema, { body: { postId: UUID } });
});

test("a negative donation is rejected", () => {
  rejects(createPaymentIntentSchema, { body: { postId: UUID, monetaryAmount: -100 } });
});

test("a donation above the per-transaction ceiling is rejected", () => {
  rejects(createPaymentIntentSchema, { body: { postId: UUID, monetaryAmount: 5_000_000 } });
});

test("more than two decimal places is rejected", () => {
  rejects(createPaymentIntentSchema, { body: { postId: UUID, monetaryAmount: 100.999 } });
});

test("confirmation accepts only a payment reference — no postId to spoof", () => {
  accepts(confirmPaymentSchema, { body: { paymentIntentId: "pi_3Abc123Def456" } });
  rejects(confirmPaymentSchema, { body: { paymentIntentId: "pi_3Abc123", postId: UUID } });
  rejects(confirmPaymentSchema, { body: { paymentIntentId: "not-an-intent" } });
});

test("refund input cannot attach an unverified contribution id", () => {
  accepts(issueRefundSchema, { body: { paymentId: UUID, reason: "Duplicate charge" } });
  rejects(issueRefundSchema, {
    body: { paymentId: UUID, reason: "Duplicate charge", contributionId: OTHER_UUID },
  });
});

suite("Validation — contributions submitted as multipart JSON");

test("a valid contribution payload is parsed and accepted", () => {
  const parsed = accepts(addContributionSchema, {
    params: { postId: UUID },
    body: {
      monetary: JSON.stringify([{ donorName: "Maria Santos", amount: 500 }]),
      inKind: JSON.stringify([]),
      volunteer: JSON.stringify([]),
    },
  });
  assert(Array.isArray(parsed.body.monetary), "the JSON string should be parsed into an array");
});

test("unparseable JSON is a 400, not a 500", () => {
  // WAS: JSON.parse threw inside the controller and the parser's message was
  // returned to the caller.
  rejects(addContributionSchema, {
    params: { postId: UUID },
    body: { monetary: "{{{not json", inKind: "[]", volunteer: "[]" },
  });
});

test("JSON that parses but is not a list is rejected", () => {
  rejects(addContributionSchema, {
    params: { postId: UUID },
    body: { monetary: JSON.stringify({ amount: 500 }), inKind: "[]", volunteer: "[]" },
  });
});

test("a negative donation inside the JSON payload is rejected", () => {
  rejects(addContributionSchema, {
    params: { postId: UUID },
    body: { monetary: JSON.stringify([{ donorName: "X", amount: -500 }]), inKind: "[]", volunteer: "[]" },
  });
});

test("an in-kind entry naming a non-UUID item is rejected", () => {
  rejects(addContributionSchema, {
    params: { postId: UUID },
    body: {
      monetary: "[]",
      inKind: JSON.stringify([{ donorName: "X", itemId: "../../etc/passwd", quantity: 1 }]),
      volunteer: "[]",
    },
  });
});

test("a submission with nothing in it is rejected", () => {
  rejects(addContributionSchema, {
    params: { postId: UUID },
    body: { monetary: "[]", inKind: "[]", volunteer: "[]" },
  });
});

test("ignored identity and volunteer schedule fields are rejected", () => {
  rejects(addContributionSchema, {
    params: { postId: UUID },
    body: {
      monetary: JSON.stringify([{ donorName: "Maria", amount: 500 }]),
      donorId: OTHER_UUID,
    },
  });
  rejects(addContributionSchema, {
    params: { postId: UUID },
    body: {
      volunteer: JSON.stringify([
        { donorName: "Maria", count: 1, startDate: "2026-08-20" },
      ]),
    },
  });
});

test("contributor names with surrounding whitespace are rejected, not trimmed", () => {
  rejects(addContributionSchema, {
    params: { postId: UUID },
    body: {
      monetary: JSON.stringify([{ donorName: " Maria Santos", amount: 500 }]),
    },
  });
});

suite("Validation — authentication endpoints");

test("sign-in does not apply the password policy to the submitted password", () => {
  // Applying it would answer a short password differently from a wrong one,
  // which tells an attacker their guess had the right shape. [2.1.4]
  accepts(loginSchema, { body: { email: "someone@example.com", password: "short" } });
});

test("sign-in still bounds the field lengths", () => {
  rejects(loginSchema, { body: { email: "someone@example.com", password: "x".repeat(500) } });
  rejects(loginSchema, { body: { email: "x".repeat(300), password: "whatever" } });
});

test("sign-in rejects extra fields such as a role claim", () => {
  rejects(loginSchema, { body: { email: "a@b.com", password: "x", role: "admin" } });
});

test("email whitespace is rejected before lowercase canonicalisation", () => {
  rejects(loginSchema, { body: { email: " user@example.com", password: "short" } });
  rejects(loginSchema, { body: { email: "user@example.com ", password: "short" } });
  const parsed = accepts(loginSchema, {
    body: { email: "USER@EXAMPLE.COM", password: "short" },
  });
  assertEqual(parsed.body.email, "user@example.com");
  rejects(securityLogQuerySchema, { query: { actorEmail: " admin@example.com" } });
});

test("registration requires exactly two security answers", () => {
  const base = {
    firstName: "Maria",
    surname: "Santos",
    email: "maria@example.com",
    password: "Kalinga!Tulay72",
    affiliation: "Community Group",
  };
  rejects(registerDonorSchema, { body: { ...base, securityAnswers: [] } });
  rejects(registerDonorSchema, {
    body: { ...base, securityAnswers: [{ questionKey: "first_concert", answer: "Eraserheads at Cubao" }] },
  });
  accepts(registerDonorSchema, {
    body: {
      ...base,
      securityAnswers: [
        { questionKey: "first_concert", answer: "Eraserheads at Cubao" },
        { questionKey: "street_age_ten", answer: "Mapagmahal Street" },
      ],
    },
  });
});

test("registration cannot request the administrator role", () => {
  rejects(registerDonorSchema, {
    body: {
      firstName: "Maria",
      surname: "Santos",
      email: "maria@example.com",
      password: "Kalinga!Tulay72",
      affiliation: "Community Group",
      role: "admin",
      securityAnswers: [
        { questionKey: "first_concert", answer: "Eraserheads at Cubao" },
        { questionKey: "street_age_ten", answer: "Mapagmahal Street" },
      ],
    },
  });
});

test("a password change must be confirmed", () => {
  rejects(changePasswordSchema, {
    body: { newPassword: "Kalinga!Tulay72", confirmPassword: "Kalinga!Tulay73" },
  });
  accepts(changePasswordSchema, {
    body: { newPassword: "Kalinga!Tulay72", confirmPassword: "Kalinga!Tulay72" },
  });
});

test("registration identity fields with surrounding whitespace are rejected, not trimmed", () => {
  const securityAnswers = [
    { questionKey: "first_concert", answer: "Eraserheads at Cubao" },
    { questionKey: "street_age_ten", answer: "Mapagmahal Street" },
  ];
  const donor = {
    firstName: "Maria",
    surname: "Santos",
    email: "maria@example.com",
    password: "Kalinga!Tulay72",
    affiliation: "Community Group",
    securityAnswers,
  };

  for (const [field, value] of [
    ["firstName", " Maria"],
    ["surname", "Santos "],
    ["affiliation", " Community Group"],
  ]) {
    rejects(registerDonorSchema, { body: { ...donor, [field]: value } }, field);
  }

  rejects(registerOrganizationSchema, {
    body: {
      firstName: "Maria",
      surname: "Santos",
      email: "ngo@example.com",
      password: "Kalinga!Tulay72",
      orgName: " Community Partners",
      securityAnswers,
    },
  });
});

test("password confirmation has the same maximum length bound", () => {
  rejects(changePasswordSchema, {
    body: { newPassword: "Kalinga!Tulay72", confirmPassword: "x".repeat(65) },
  });
});

suite("Validation — security log filters are bounded [2.4.4]");

test("normal filters are accepted", () => {
  accepts(securityLogQuerySchema, {
    query: { eventType: "LOGIN_FAILURE", outcome: "FAILURE", page: "1", limit: "50" },
  });
});

test("an inverted date range is rejected", () => {
  rejects(securityLogQuerySchema, { query: { from: "2026-08-01", to: "2026-07-01" } });
});

test("an unknown filter key is rejected", () => {
  rejects(securityLogQuerySchema, { query: { orderBy: "actorEmail; DROP TABLE" } });
});

test("an over-large page size is rejected", () => {
  rejects(securityLogQuerySchema, { query: { page: "0" } });
  rejects(securityLogQuerySchema, { query: { limit: "999" } });
  rejects(securityLogQuerySchema, { query: { limit: "9999" } });
});

test("bounded pagination is parsed once for controllers", () => {
  const logQuery = accepts(securityLogQuerySchema, { query: { page: "2", limit: "50" } });
  const usersQuery = accepts(listUsersSchema, { query: { page: "3", limit: "25" } });
  assertEqual(logQuery.query, { page: 2, limit: 50 });
  assertEqual(usersQuery.query, { page: 3, limit: 25 });
  rejects(listUsersSchema, { query: { page: "0" } });
  rejects(listUsersSchema, { query: { limit: "101" } });
});

test("security-log filters reject impossible calendar dates", () => {
  rejects(securityLogQuerySchema, { query: { from: "2026-02-30" } });
});

test("a malformed event type is rejected", () => {
  rejects(securityLogQuerySchema, { query: { eventType: "login failure" } });
});
