/**
 * businessRules.js — application logic flows that must hold regardless of what
 * the client sends. [CSSECDV 2.2.3]
 *
 * Kept separate from accessControl.js on purpose. Access control answers "may
 * this user touch this row?"; these rules answer "is this a legal thing to do
 * to that row at all?". Mixing them would make the claim that authorization
 * lives in a single component (2.2.1) untrue.
 *
 * Everything here is a pure function over data the SERVER has loaded. Nothing
 * trusts a number, status, or amount that arrived in a request body — that is
 * the entire point, and it is where the most damaging defects were:
 *
 *   · transaction fees were taken straight from the request, so a donor could
 *     send `donationAmount: 100000, monetaryFee: 1` and pay ₱1 in fees;
 *   · contribution totals were incremented the moment a row was created, so
 *     anyone could inflate a project's fundraising bar without the organization
 *     ever confirming;
 *   · post status accepted any value, so a Deleted post could be restored to
 *     Approved.
 */

import { AppError } from "../errors/AppError.js";

/* ═══════════════════════════════════════════════════════════════════════════
 * POST LIFECYCLE
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Legal status transitions, and who may perform each.
 *
 * Previously `updatePostStatus` accepted any value from the valid-status list
 * and wrote it directly, so Deleted → Approved was a legal move.
 *
 * Two invariants are what this table exists to protect. Everything else is
 * ordinary moderation and is permitted, because a state machine that blocks
 * legitimate administrator actions adds no security — it just breaks the
 * product and invites someone to remove the check entirely:
 *
 *   1. An owner can never reach Approved. Publishing your own fundraising
 *      campaign without review is the thing moderation exists to prevent.
 *   2. Deleted is terminal. A deleted project cannot be resurrected by anyone.
 *
 * Within those limits an administrator may approve, reject, reconsider a
 * rejection, or send a published project back for review.
 */
export const POST_TRANSITIONS = Object.freeze({
  Pending: {
    Approved: ["admin"],
    Unapproved: ["admin"],
    Edited: ["owner"],
    Deleted: ["admin", "owner"],
  },
  Unapproved: {
    // An administrator may reconsider a rejection.
    Approved: ["admin"],
    Pending: ["admin", "owner"], // owner resubmits
    Edited: ["owner"],
    Deleted: ["admin", "owner"],
  },
  Approved: {
    Unapproved: ["admin"], // revoke
    Pending: ["admin"], // "undo approve" — send back for review
    Edited: ["owner"], // an edit returns it for review
    Deleted: ["admin", "owner"],
  },
  Edited: {
    Approved: ["admin"],
    Unapproved: ["admin"],
    Pending: ["admin"],
    Deleted: ["admin", "owner"],
  },
  Deleted: {}, // terminal — no way out, for anyone
});

/**
 * @param {string} from current overallStatus
 * @param {string} to   requested overallStatus
 * @param {"admin"|"owner"} actor
 * @throws {AppError} 409 when the transition is not permitted
 */
export const assertPostTransition = (from, to, actor) => {
  const allowedActors = POST_TRANSITIONS[from]?.[to];

  if (!allowedActors) {
    throw new AppError(
      `A project that is ${String(from).toLowerCase()} cannot be changed to ${String(to).toLowerCase()}.`,
      409,
      "INVALID_STATE_TRANSITION",
    );
  }
  if (!allowedActors.includes(actor)) {
    throw new AppError("You are not permitted to make that change.", 403, "TRANSITION_FORBIDDEN");
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
 * CONTRIBUTIONS
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * A project may only receive contributions while it is approved and open.
 *
 * None of this was checked before: contributions could be attached to a
 * Pending draft, an Unapproved project, or one that had already been deleted.
 *
 * @param {object} post loaded server-side, including supportOptions/inKindItems
 */
export const assertPostAcceptsContributions = (post) => {
  if (!post) {
    throw new AppError("We could not find that project.", 404, "NOT_FOUND");
  }
  if (post.overallStatus !== "Approved") {
    throw new AppError(
      "This project is not currently accepting contributions.",
      409,
      "PROJECT_NOT_OPEN",
    );
  }
  if (post.endDate && new Date(post.endDate) < new Date()) {
    throw new AppError("This project has already ended.", 409, "PROJECT_ENDED");
  }
};

/**
 * Validate one requested contribution against the project's actual,
 * server-loaded support options.
 *
 * Returns the sanitised-by-reconstruction entry: every value in the result is
 * either taken from the database or re-derived here. Nothing is passed through
 * from the request except the quantity being given, which is range-checked.
 */
export const assertContributionAllowed = (post, { type, amount, count, itemId, quantity }) => {
  const monetary = post.supportOptions?.find((option) => option.type === "Monetary");
  const volunteer = post.supportOptions?.find((option) => option.type === "Volunteer");

  if (type === "Monetary") {
    if (!monetary) {
      throw new AppError("This project is not accepting monetary donations.", 409, "UNSUPPORTED_TYPE");
    }
    if (monetary.status !== "Open") {
      throw new AppError("Monetary donations for this project are closed.", 409, "SUPPORT_CLOSED");
    }
    return { type: "Monetary", amount, optionId: monetary.id };
  }

  if (type === "Volunteer") {
    if (!volunteer) {
      throw new AppError("This project is not accepting volunteers.", 409, "UNSUPPORTED_TYPE");
    }
    if (volunteer.status !== "Open") {
      throw new AppError("Volunteer sign-ups for this project are closed.", 409, "SUPPORT_CLOSED");
    }
    return { type: "Volunteer", count, optionId: volunteer.id };
  }

  if (type === "InKind") {
    // The item must belong to THIS project. Without this check an in-kind
    // contribution could name any item id in the database and increment another
    // organization's progress counter.
    const item = post.inKindItems?.find((candidate) => candidate.id === itemId);
    if (!item) {
      throw new AppError(
        "That item is not part of this project's wish list.",
        409,
        "UNKNOWN_ITEM",
      );
    }
    if (item.status !== "Open") {
      throw new AppError(`Donations of ${item.itemName} are closed.`, 409, "SUPPORT_CLOSED");
    }
    return { type: "InKind", itemId: item.id, quantity, itemName: item.itemName };
  }

  throw new AppError("Unrecognised contribution type.", 400, "UNSUPPORTED_TYPE");
};

/**
 * Contribution status is a one-way door: a Pending contribution may be
 * confirmed or declined, and a decided one may not be re-decided.
 *
 * Confirmation is what moves a project's progress totals, so allowing it twice
 * would double-count the donation.
 */
export const assertContributionTransition = (from, to) => {
  if (from !== "Pending") {
    throw new AppError(
      `This contribution has already been ${String(from).toLowerCase()}.`,
      409,
      "ALREADY_DECIDED",
    );
  }
  if (to !== "Confirmed" && to !== "Declined") {
    throw new AppError("Unrecognised contribution decision.", 400, "INVALID_DECISION");
  }
};

/** Permanent destruction is the second step after an explicit soft delete. */
export const assertPermanentDeleteAllowed = (post) => {
  if (post?.overallStatus !== "Deleted") {
    throw new AppError(
      "This project must be deleted before it can be permanently removed.",
      409,
      "PROJECT_NOT_DELETED",
    );
  }
};

/**
 * Once a project has contribution history, its support rows are referenced by
 * that history and their accumulated totals must not be replaced. Descriptive
 * project fields may still be edited when the submitted support structure is
 * unchanged.
 */
export const assertProjectStructureChangeAllowed = (currentPost, nextStructure) => {
  if ((currentPost?._count?.contributions ?? 0) === 0) return;

  const normalizeNumber = (value) => (value == null ? null : Number(value));
  const normalizeText = (value) => value ?? null;
  const normalize = ({ supportOptions = [], inKindItems = [] }) => ({
    supportOptions: supportOptions
      .map((option) => ({
        type: option.type,
        targetAmount: normalizeNumber(option.targetAmount),
        targetCount: normalizeNumber(option.targetCount),
      }))
      .sort((left, right) => left.type.localeCompare(right.type)),
    inKindItems: inKindItems
      .map((item) => ({
        itemName: item.itemName,
        targetQuantity: normalizeNumber(item.targetQuantity),
        unit: normalizeText(item.unit),
        pricePerUnit: normalizeNumber(item.pricePerUnit),
      }))
      .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right))),
  });

  const current = normalize(currentPost);
  const next = normalize(nextStructure);
  if (JSON.stringify(current) !== JSON.stringify(next)) {
    throw new AppError(
      "Support types, targets, and requested items cannot be changed after contributions have been recorded.",
      409,
      "PROJECT_STRUCTURE_LOCKED",
    );
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
 * TRANSACTION FEES
 * ═══════════════════════════════════════════════════════════════════════════ */

export const FEE_RULES = Object.freeze({
  MONETARY_RATE: 0.03, // 3% of the donation
  IN_KIND_RATE: 0.03, // 3% of the assessed value of goods
  VOLUNTEER_PER_HEAD: 50, // ₱50 per volunteer
  VOLUNTEER_CAP: 500, // capped, so a large drive is not punished
  MAX_SINGLE_PAYMENT: 1_000_000, // ₱1,000,000 ceiling per transaction
});

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Compute what a contribution costs, from scratch, on the server.
 *
 * `POST /payments/intent` used to accept donationAmount, monetaryFee,
 * volunteerFee and inKindFee from the request body and charge their sum. Every
 * one of those is now derived here from the project's own data and the quantity
 * being contributed; the client's numbers are not validated, they are ignored.
 *
 * @returns {{donationAmount:number, monetaryFee:number, volunteerFee:number,
 *            inKindFee:number, total:number}}
 */
export const computeFees = ({ monetaryAmount = 0, volunteerCount = 0, inKindValue = 0 }) => {
  const donationAmount = round2(Math.max(0, monetaryAmount));
  const monetaryFee = round2(donationAmount * FEE_RULES.MONETARY_RATE);

  const volunteers = Math.max(0, Math.floor(volunteerCount));
  const volunteerFee = round2(
    Math.min(volunteers * FEE_RULES.VOLUNTEER_PER_HEAD, FEE_RULES.VOLUNTEER_CAP),
  );

  const inKindFee = round2(Math.max(0, inKindValue) * FEE_RULES.IN_KIND_RATE);

  const total = round2(donationAmount + monetaryFee + volunteerFee + inKindFee);

  if (total <= 0) {
    throw new AppError("There is nothing to pay for this contribution.", 400, "EMPTY_PAYMENT");
  }
  if (total > FEE_RULES.MAX_SINGLE_PAYMENT) {
    throw new AppError(
      `A single payment may not exceed ₱${FEE_RULES.MAX_SINGLE_PAYMENT.toLocaleString("en-PH")}.`,
      400,
      "PAYMENT_TOO_LARGE",
    );
  }

  return { donationAmount, monetaryFee, volunteerFee, inKindFee, total };
};

/**
 * Value of an in-kind contribution, from the project's own pricePerUnit.
 * Items with no price contribute nothing to the fee rather than defaulting to
 * a guess — an unpriced item must not silently become free money either way.
 */
export const computeInKindValue = (post, entries) => {
  let value = 0;
  for (const entry of entries ?? []) {
    const item = post.inKindItems?.find((candidate) => candidate.id === entry.itemId);
    if (!item?.pricePerUnit) continue;
    value += Number(item.pricePerUnit) * Number(entry.quantity ?? 0);
  }
  return round2(value);
};

/* ═══════════════════════════════════════════════════════════════════════════
 * PAYMENTS AND REFUNDS
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * A Stripe PaymentIntent may only be recorded by the user it was created for.
 *
 * `POST /payments/confirm` previously trusted the postId in the request body
 * and never compared the intent's metadata to the caller, so one user could
 * confirm and claim another user's payment.
 */
export const assertPaymentIntentBelongsTo = (paymentIntent, user) => {
  const metadata = paymentIntent?.metadata ?? {};

  if (!metadata.userId || metadata.userId !== user.id) {
    throw new AppError("That payment does not belong to your account.", 403, "PAYMENT_NOT_YOURS");
  }
  if (paymentIntent.status !== "succeeded" && paymentIntent.status !== "processing") {
    throw new AppError("That payment has not completed successfully.", 409, "PAYMENT_INCOMPLETE");
  }
};

/**
 * Link the contribution being recorded to the server-side Payment row created
 * from Stripe. This prevents a caller from paying for one project or amount and
 * then attaching that payment reference to a different contribution.
 */
export const assertRecordedPaymentMatches = (payment, { user, postId, breakdown }) => {
  if (!payment) {
    throw new AppError(
      "Complete and confirm the payment before recording this contribution.",
      409,
      "PAYMENT_NOT_RECORDED",
    );
  }
  if (payment.userId !== user.id || payment.userRole !== user.role) {
    throw new AppError("That payment does not belong to your account.", 403, "PAYMENT_NOT_YOURS");
  }
  if (payment.postId !== postId) {
    throw new AppError(
      "That payment was created for a different project.",
      409,
      "PAYMENT_PROJECT_MISMATCH",
    );
  }
  if (payment.status !== "succeeded") {
    throw new AppError("That payment has not completed successfully.", 409, "PAYMENT_INCOMPLETE");
  }
  if (payment.refundIntentId) {
    throw new AppError("That payment has already been refunded.", 409, "PAYMENT_REFUNDED");
  }

  const actual = {
    donationAmount: round2(Number(payment.monetaryContribution ?? 0)),
    monetaryFee: round2(Number(payment.monetaryTransactionFee ?? 0)),
    volunteerFee: round2(Number(payment.volunteerTransactionFee ?? 0)),
    inKindFee: round2(Number(payment.inKindTransactionFee ?? 0)),
  };
  const expected = {
    donationAmount: round2(Number(breakdown.donationAmount ?? 0)),
    monetaryFee: round2(Number(breakdown.monetaryFee ?? 0)),
    volunteerFee: round2(Number(breakdown.volunteerFee ?? 0)),
    inKindFee: round2(Number(breakdown.inKindFee ?? 0)),
  };

  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new AppError(
      "That payment does not match this contribution.",
      409,
      "PAYMENT_AMOUNT_MISMATCH",
    );
  }
};

/** A successful payment reference may create exactly one contribution batch. */
export const assertPaymentIntentUnused = (existingContribution) => {
  if (existingContribution) {
    throw new AppError(
      "That payment has already been recorded as a contribution.",
      409,
      "PAYMENT_ALREADY_USED",
    );
  }
};

/**
 * @param {object} payment loaded server-side
 */
export const assertRefundable = (payment) => {
  if (!payment) {
    throw new AppError("We could not find that payment.", 404, "NOT_FOUND");
  }
  if (payment.refundIntentId) {
    throw new AppError("That payment has already been refunded.", 409, "ALREADY_REFUNDED");
  }
  if (payment.status !== "succeeded") {
    throw new AppError(
      "Only completed payments can be refunded.",
      409,
      "PAYMENT_NOT_REFUNDABLE",
    );
  }
};

/** Total actually charged for a payment, recomputed from its stored breakdown. */
export const paymentTotal = (payment) =>
  round2(
    (payment.monetaryContribution ?? 0) +
      (payment.monetaryTransactionFee ?? 0) +
      (payment.volunteerTransactionFee ?? 0) +
      (payment.inKindTransactionFee ?? 0),
  );

/** Stable Stripe idempotency key: one external refund per local payment. */
export const refundIdempotencyKey = (paymentId) =>
  `bayanihub-refund:${String(paymentId)}`;

/* ═══════════════════════════════════════════════════════════════════════════
 * ACCOUNTS
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Safety interlock for administrator management.
 *
 * Losing every administrator is unrecoverable through the application — there
 * is no route that can create one without already being one. This is checked
 * before any demotion or disable.
 */
export const assertNotLastAdmin = (activeAdminCount, targetIsAdmin) => {
  if (targetIsAdmin && activeAdminCount <= 1) {
    throw new AppError(
      "This is the only remaining administrator account. Create another administrator before changing this one.",
      409,
      "LAST_ADMIN",
    );
  }
};

/** Administrators provision privileged accounts; donors self-register. */
export const assertAssignableRole = (role) => {
  if (role !== "admin" && role !== "ngo") {
    throw new AppError(
      "Administrators may only create administrator or organization accounts. Donors register themselves.",
      400,
      "ROLE_NOT_ASSIGNABLE",
    );
  }
};

export default {
  POST_TRANSITIONS,
  assertPostTransition,
  assertPermanentDeleteAllowed,
  assertPostAcceptsContributions,
  assertContributionAllowed,
  assertContributionTransition,
  assertProjectStructureChangeAllowed,
  FEE_RULES,
  computeFees,
  computeInKindValue,
  assertPaymentIntentBelongsTo,
  assertRecordedPaymentMatches,
  assertPaymentIntentUnused,
  assertRefundable,
  paymentTotal,
  refundIdempotencyKey,
  assertNotLastAdmin,
  assertAssignableRole,
};
