/**
 * Business rule enforcement. [CSSECDV 2.2.3]
 */

import { suite, test, assert, assertEqual, assertIncludes } from "./_harness.mjs";
import {
  POST_TRANSITIONS,
  assertPostTransition,
  assertPostAcceptsContributions,
  assertContributionAllowed,
  assertContributionTransition,
  computeFees,
  computeInKindValue,
  assertPaymentIntentBelongsTo,
  assertRefundable,
  paymentTotal,
  assertNotLastAdmin,
  assertAssignableRole,
  FEE_RULES,
} from "../security/businessRules.js";

/** Assert that `fn` throws, and return the error for further inspection. */
const throws = (fn, expectedCode) => {
  let error = null;
  try {
    fn();
  } catch (caught) {
    error = caught;
  }
  assert(error !== null, "expected the rule to reject this, but it was allowed");
  if (expectedCode) {
    assertEqual(error.code, expectedCode, "wrong rejection code");
  }
  return error;
};

suite("Post lifecycle state machine [2.2.3]");

test("an admin may approve a pending project", () => {
  assertPostTransition("Pending", "Approved", "admin");
});

test("an owner may not approve their own project", () => {
  // The whole point of moderation: an organization must not be able to publish
  // its own fundraising campaign without review.
  throws(() => assertPostTransition("Pending", "Approved", "owner"), "TRANSITION_FORBIDDEN");
});

test("a deleted project cannot be resurrected", () => {
  // Previously `updatePostStatus` accepted any value from the enum, so
  // Deleted → Approved was a legal move for an admin.
  throws(() => assertPostTransition("Deleted", "Approved", "admin"), "INVALID_STATE_TRANSITION");
  throws(() => assertPostTransition("Deleted", "Pending", "admin"), "INVALID_STATE_TRANSITION");
  throws(() => assertPostTransition("Deleted", "Edited", "owner"), "INVALID_STATE_TRANSITION");
});

test("an administrator may send an approved project back for review", () => {
  // The "Undo Approve" action. Permitted: it removes a project from public
  // view rather than granting anything.
  assertPostTransition("Approved", "Pending", "admin");
});

test("an owner cannot send their own project back to pending to re-trigger review", () => {
  throws(() => assertPostTransition("Approved", "Pending", "owner"), "TRANSITION_FORBIDDEN");
});

test("an administrator may reconsider a rejection", () => {
  assertPostTransition("Unapproved", "Approved", "admin");
});

test("INVARIANT: an owner can never reach Approved from any state", () => {
  // The single most important property of this table. Asserted exhaustively so
  // that adding a state or a transition cannot quietly break it.
  for (const from of Object.keys(POST_TRANSITIONS)) {
    const allowed = POST_TRANSITIONS[from].Approved;
    assert(
      !allowed || !allowed.includes("owner"),
      `an owner may move ${from} -> Approved, which lets an organization publish its own campaign`,
    );
  }
});

test("INVARIANT: Deleted is terminal for everyone", () => {
  assertEqual(POST_TRANSITIONS.Deleted, {});
  for (const to of ["Approved", "Pending", "Unapproved", "Edited"]) {
    for (const actor of ["admin", "owner"]) {
      throws(() => assertPostTransition("Deleted", to, actor), "INVALID_STATE_TRANSITION");
    }
  }
});

test("an owner may edit an approved project, which sends it back for review", () => {
  assertPostTransition("Approved", "Edited", "owner");
});

test("either party may delete", () => {
  assertPostTransition("Approved", "Deleted", "owner");
  assertPostTransition("Approved", "Deleted", "admin");
});

test("an unknown status is rejected rather than written through", () => {
  throws(() => assertPostTransition("Pending", "Published", "admin"), "INVALID_STATE_TRANSITION");
  throws(() => assertPostTransition("Nonsense", "Approved", "admin"), "INVALID_STATE_TRANSITION");
});

suite("Contribution eligibility [2.2.3]");

const approvedPost = {
  id: "p1",
  overallStatus: "Approved",
  endDate: null,
  supportOptions: [
    { id: "m1", type: "Monetary", status: "Open" },
    { id: "v1", type: "Volunteer", status: "Open" },
  ],
  inKindItems: [{ id: "i1", itemName: "Rice", status: "Open", pricePerUnit: 50 }],
};

test("an approved, open project accepts contributions", () => {
  assertPostAcceptsContributions(approvedPost);
});

test("a pending project does not", () => {
  throws(
    () => assertPostAcceptsContributions({ ...approvedPost, overallStatus: "Pending" }),
    "PROJECT_NOT_OPEN",
  );
});

test("an unapproved project does not", () => {
  throws(
    () => assertPostAcceptsContributions({ ...approvedPost, overallStatus: "Unapproved" }),
    "PROJECT_NOT_OPEN",
  );
});

test("a deleted project does not", () => {
  throws(
    () => assertPostAcceptsContributions({ ...approvedPost, overallStatus: "Deleted" }),
    "PROJECT_NOT_OPEN",
  );
});

test("a project whose end date has passed does not", () => {
  throws(
    () => assertPostAcceptsContributions({ ...approvedPost, endDate: "2020-01-01" }),
    "PROJECT_ENDED",
  );
});

test("a missing project is a 404, not a crash", () => {
  throws(() => assertPostAcceptsContributions(null), "NOT_FOUND");
});

suite("Contribution type matching [2.2.3]");

test("a monetary donation to a project that accepts money is allowed", () => {
  const result = assertContributionAllowed(approvedPost, { type: "Monetary", amount: 500 });
  assertEqual(result.optionId, "m1");
});

test("a volunteer sign-up to a project with no volunteer option is rejected", () => {
  const noVolunteers = {
    ...approvedPost,
    supportOptions: [{ id: "m1", type: "Monetary", status: "Open" }],
  };
  throws(
    () => assertContributionAllowed(noVolunteers, { type: "Volunteer", count: 3 }),
    "UNSUPPORTED_TYPE",
  );
});

test("a contribution to a closed support option is rejected", () => {
  const closed = {
    ...approvedPost,
    supportOptions: [{ id: "m1", type: "Monetary", status: "Closed" }],
  };
  throws(
    () => assertContributionAllowed(closed, { type: "Monetary", amount: 100 }),
    "SUPPORT_CLOSED",
  );
});

test("an in-kind item belonging to a DIFFERENT project is rejected", () => {
  // This was unchecked: `addContribution` incremented whatever item id it was
  // given, so a donation to project A could advance project B's counter.
  throws(
    () =>
      assertContributionAllowed(approvedPost, {
        type: "InKind",
        itemId: "item-from-another-project",
        quantity: 5,
      }),
    "UNKNOWN_ITEM",
  );
});

test("an in-kind item belonging to this project is accepted", () => {
  const result = assertContributionAllowed(approvedPost, {
    type: "InKind",
    itemId: "i1",
    quantity: 5,
  });
  assertEqual(result.itemName, "Rice");
});

suite("Contribution decisions are one-way [2.2.3]");

test("a pending contribution may be confirmed or declined", () => {
  assertContributionTransition("Pending", "Confirmed");
  assertContributionTransition("Pending", "Declined");
});

test("a confirmed contribution cannot be confirmed again", () => {
  // Confirmation moves the project's progress totals; allowing it twice would
  // double-count the donation.
  throws(() => assertContributionTransition("Confirmed", "Confirmed"), "ALREADY_DECIDED");
});

test("a declined contribution cannot be quietly confirmed later", () => {
  throws(() => assertContributionTransition("Declined", "Confirmed"), "ALREADY_DECIDED");
});

suite("Transaction fees are computed server-side [2.2.3]");

test("a ₱10,000 donation carries a ₱300 fee", () => {
  const fees = computeFees({ monetaryAmount: 10000 });
  assertEqual(fees.monetaryFee, 300);
  assertEqual(fees.total, 10300);
});

test("the client's own fee figures are ignored entirely", () => {
  // The attack: POST /payments/intent used to accept donationAmount and
  // monetaryFee from the body and charge their sum, so this pair charged ₱1 of
  // fees on a ₱100,000 donation. computeFees takes no fee input at all — there
  // is no parameter through which a caller could supply one.
  const fees = computeFees({ monetaryAmount: 100000, monetaryFee: 1, total: 1 });
  assertEqual(fees.monetaryFee, 3000);
  assertEqual(fees.total, 103000);
});

test("volunteer fees are per head and capped", () => {
  assertEqual(computeFees({ volunteerCount: 4 }).volunteerFee, 200);
  assertEqual(computeFees({ volunteerCount: 10 }).volunteerFee, FEE_RULES.VOLUNTEER_CAP);
  assertEqual(computeFees({ volunteerCount: 500 }).volunteerFee, FEE_RULES.VOLUNTEER_CAP);
});

test("negative amounts cannot be used to manufacture a credit", () => {
  throws(() => computeFees({ monetaryAmount: -5000 }), "EMPTY_PAYMENT");
});

test("a fractional volunteer count is floored, not rounded up", () => {
  assertEqual(computeFees({ volunteerCount: 2.9 }).volunteerFee, 100);
});

test("an empty contribution is rejected", () => {
  throws(() => computeFees({}), "EMPTY_PAYMENT");
  throws(() => computeFees({ monetaryAmount: 0, volunteerCount: 0 }), "EMPTY_PAYMENT");
});

test("a payment above the ceiling is rejected", () => {
  throws(() => computeFees({ monetaryAmount: 2_000_000 }), "PAYMENT_TOO_LARGE");
});

test("currency arithmetic rounds to two decimal places", () => {
  const fees = computeFees({ monetaryAmount: 33.33 });
  assertEqual(fees.monetaryFee, 1);
  assertEqual(fees.total, 34.33);
});

test("in-kind value comes from the project's own price list", () => {
  const value = computeInKindValue(approvedPost, [{ itemId: "i1", quantity: 10 }]);
  assertEqual(value, 500);
  assertEqual(computeFees({ inKindValue: value }).inKindFee, 15);
});

test("an unknown item contributes no value", () => {
  assertEqual(computeInKindValue(approvedPost, [{ itemId: "ghost", quantity: 999 }]), 0);
});

suite("Payment confirmation [2.2.3]");

const user = { id: "donor-1", role: "donor" };

test("a payment intent created for this user may be confirmed", () => {
  assertPaymentIntentBelongsTo(
    { status: "succeeded", metadata: { userId: "donor-1", postId: "p1" } },
    user,
  );
});

test("a payment intent belonging to someone else is rejected", () => {
  // Previously confirmPayment never compared the intent's metadata to the
  // caller, so any user could confirm and claim another user's payment.
  throws(
    () =>
      assertPaymentIntentBelongsTo(
        { status: "succeeded", metadata: { userId: "donor-2" } },
        user,
      ),
    "PAYMENT_NOT_YOURS",
  );
});

test("an intent with no user metadata is rejected", () => {
  throws(
    () => assertPaymentIntentBelongsTo({ status: "succeeded", metadata: {} }, user),
    "PAYMENT_NOT_YOURS",
  );
});

test("an unpaid intent cannot be recorded as a payment", () => {
  throws(
    () =>
      assertPaymentIntentBelongsTo(
        { status: "requires_payment_method", metadata: { userId: "donor-1" } },
        user,
      ),
    "PAYMENT_INCOMPLETE",
  );
});

suite("Refunds [2.2.3]");

const succeededPayment = {
  id: "pay1",
  status: "succeeded",
  refundIntentId: null,
  monetaryContribution: 1000,
  monetaryTransactionFee: 30,
  volunteerTransactionFee: 0,
  inKindTransactionFee: 0,
};

test("a completed, unrefunded payment may be refunded", () => {
  assertRefundable(succeededPayment);
});

test("a payment cannot be refunded twice", () => {
  throws(
    () => assertRefundable({ ...succeededPayment, refundIntentId: "re_123" }),
    "ALREADY_REFUNDED",
  );
});

test("a payment that never succeeded cannot be refunded", () => {
  throws(
    () => assertRefundable({ ...succeededPayment, status: "requires_action" }),
    "PAYMENT_NOT_REFUNDABLE",
  );
});

test("the refund amount is recomputed from the stored breakdown", () => {
  assertEqual(paymentTotal(succeededPayment), 1030);
});

suite("Administrator safety interlocks [2.2.3]");

test("the last remaining administrator cannot be demoted or disabled", () => {
  const error = throws(() => assertNotLastAdmin(1, true), "LAST_ADMIN");
  assertIncludes(error.message, "only remaining administrator");
});

test("an administrator may be removed while others remain", () => {
  assertNotLastAdmin(2, true);
});

test("removing a non-administrator is unaffected by the admin count", () => {
  assertNotLastAdmin(1, false);
});

test("an administrator cannot mint a donor account", () => {
  // Donors self-register; the specification assigns account creation for
  // Administrator and Role A only.
  throws(() => assertAssignableRole("donor"), "ROLE_NOT_ASSIGNABLE");
  throws(() => assertAssignableRole("superuser"), "ROLE_NOT_ASSIGNABLE");
});

test("an administrator may create admin and organization accounts", () => {
  assertAssignableRole("admin");
  assertAssignableRole("ngo");
});
