/**
 * Validation schemas for payments, refunds, documents, organizations, and the
 * security log. [CSSECDV 2.3.1–2.3.3]
 */

import {
  z,
  request,
  uuid,
  documentType,
  shortText,
  contributionAmount,
  volunteerCount,
  quantity,
} from "./common.js";

/* ═══════════════════════════════════════════════════════════════════════════
 * PAYMENTS
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * WAS: this endpoint accepted `donationAmount`, `monetaryFee`, `volunteerFee`
 * and `inKindFee` from the request body and charged their sum — so
 * `{ donationAmount: 100000, monetaryFee: 1 }` bought a ₱100,000 donation for
 * ₱1 in fees.
 *
 * The fee fields are GONE from the schema, not merely bounded. Because every
 * schema is `.strict()`, sending one is now a 400 rather than being silently
 * ignored — an old client fails loudly instead of appearing to work. What the
 * caller declares is *what they want to give*; what it costs is computed by
 * businessRules.computeFees from the project's own data.
 */
export const createPaymentIntentSchema = request({
  body: z
    .object({
      postId: z.union([uuid, z.literal("admin")], {
        message: "Not a valid project reference.",
      }),
      monetaryAmount: contributionAmount.optional(),
      volunteerCount: volunteerCount.optional(),
      inKindEntries: z
        .array(z.object({ itemId: uuid, quantity }).strict())
        .max(50, "No more than fifty in-kind entries.")
        .optional(),
    })
    .strict()
    .refine(
      (data) =>
        Boolean(data.monetaryAmount) ||
        Boolean(data.volunteerCount) ||
        (data.inKindEntries?.length ?? 0) > 0,
      { message: "Describe what you would like to contribute." },
    ),
});

/**
 * WAS: `postId` was read from the request body and written to the payment row,
 * while the PaymentIntent's own metadata went unchecked — so a caller could
 * confirm someone else's intent and attribute it to any project. The postId is
 * now taken from Stripe's metadata; only the intent reference is accepted here.
 */
export const confirmPaymentSchema = request({
  body: z
    .object({
      paymentIntentId: z
        .string()
        .regex(/^pi_[A-Za-z0-9_]{1,100}$/, "Not a valid payment reference."),
    })
    .strict(),
});

export const paymentIdSchema = request({
  params: z.object({ paymentId: uuid }).passthrough(),
});

export const donorIdSchema = request({
  params: z.object({ donorId: uuid }).passthrough(),
});

export const projectIdSchema = request({
  params: z.object({ projectId: uuid }).passthrough(),
});

/* ═══════════════════════════════════════════════════════════════════════════
 * REFUNDS
 * ═══════════════════════════════════════════════════════════════════════════ */

export const issueRefundSchema = request({
  body: z
    .object({
      paymentId: uuid,
      reason: shortText(500, "Reason").optional(),
      contributionId: uuid.optional(),
    })
    .strict(),
});

export const refundIdSchema = request({
  params: z.object({ refundId: uuid }).passthrough(),
});

/* ═══════════════════════════════════════════════════════════════════════════
 * DOCUMENTS
 * ═══════════════════════════════════════════════════════════════════════════ */

export const uploadDocumentSchema = request({
  // Multipart: multer has populated req.body with the text fields by the time
  // this runs. The file itself is checked in uploadMiddleware.js — extension,
  // declared MIME type, and actual magic bytes must all agree.
  body: z
    .object({
      postId: uuid,
      fileType: documentType,
      description: shortText(500, "Description").optional(),
    })
    .strict(),
});

export const documentIdSchema = request({
  params: z.object({ documentId: uuid }).passthrough(),
});

/* ═══════════════════════════════════════════════════════════════════════════
 * ORGANIZATIONS
 * ═══════════════════════════════════════════════════════════════════════════ */

export const organizationIdSchema = request({
  params: z.object({ id: uuid }).passthrough(),
});

/* ═══════════════════════════════════════════════════════════════════════════
 * SECURITY LOG  [2.4.4]
 *
 * Read-only. Every filter is bounded so a crafted query cannot be used to make
 * the database do unbounded work — the log is the largest table in the system
 * and the one an attacker would most like to slow down.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const securityLogQuerySchema = request({
  query: z
    .object({
      from: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
      to: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
      eventType: z.string().regex(/^[A-Z_]{3,60}$/, "Not a valid event type.").optional(),
      outcome: z.enum(["SUCCESS", "FAILURE"]).optional(),
      severity: z.enum(["INFO", "WARN", "CRITICAL"]).optional(),
      actorEmail: z.string().trim().max(254).toLowerCase().optional(),
      ipAddress: z.string().trim().max(45).optional(),
      targetId: z.string().trim().max(100).optional(),
      q: shortText(200, "Search").optional(),
      page: z.string().regex(/^\d{1,6}$/, "Page must be a number.").optional(),
      limit: z.string().regex(/^\d{1,3}$/, "Page size must be a number.").optional(),
    })
    .strict()
    .refine((data) => !data.from || !data.to || new Date(data.from) <= new Date(data.to), {
      message: "The start of the range must be before the end.",
      path: ["to"],
    }),
});
