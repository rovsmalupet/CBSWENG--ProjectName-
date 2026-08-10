/**
 * Validation schemas for project (post) endpoints. [CSSECDV 2.3.1–2.3.3]
 *
 * These replace behaviour that previously *repaired* bad input. See the
 * comments marked "WAS:" — each one describes a silent rewrite that is now a
 * rejection, which is the change 2.3.1 requires.
 */

import {
  z,
  request,
  uuid,
  projectName,
  description,
  location,
  causes,
  priority,
  postStatus,
  targetAmount,
  volunteerCount,
  quantity,
  pricePerUnit,
  contributionAmount,
  isoDate,
  timeOfDay,
  shortText,
} from "./common.js";

/**
 * WAS: `normalizeBudgetBreakdown` accepted anything. Bad JSON, a non-array, an
 * empty array, or entries with no label all silently became a hardcoded
 * 80/10/10 Food–Logistics–Operations split, and percentages that did not sum to
 * 100 were quietly rescaled. A project's published budget could therefore be
 * something its organization never entered.
 */
const budgetBreakdown = z
  .array(
    z
      .object({
        label: z
          .string()
          .trim()
          .min(1, "Each budget category needs a name.")
          .max(60, "Category names must be 60 characters or fewer."),
        percentage: z
          .number()
          .int("Percentages must be whole numbers.")
          .min(1, "Each category must be at least 1%.")
          .max(100, "A category cannot exceed 100%."),
      })
      .strict(),
  )
  .min(1, "Provide at least one budget category.")
  .max(10, "Provide no more than ten budget categories.")
  .refine(
    (items) => items.reduce((sum, item) => sum + item.percentage, 0) === 100,
    { message: "Budget percentages must add up to exactly 100." },
  )
  .refine(
    (items) => new Set(items.map((item) => item.label.toLowerCase())).size === items.length,
    { message: "Budget categories must be unique." },
  );

/**
 * WAS: in-kind items that failed a shape check were silently filtered out of
 * the array, so a project could be created advertising fewer needs than were
 * submitted, with no error shown.
 */
const inKindItem = z
  .object({
    itemName: z
      .string()
      .trim()
      .min(1, "Item name is required.")
      .max(100, "Item names must be 100 characters or fewer."),
    targetQuantity: quantity,
    unit: shortText(20, "Unit").nullable().optional(),
    pricePerUnit: pricePerUnit.nullable().optional(),
  })
  .strict();

const supportTypes = z
  .object({
    monetary: z
      .object({
        enabled: z.boolean(),
        targetAmount: z.number().finite(),
      })
      .strict()
      .optional(),
    volunteer: z
      .object({
        enabled: z.boolean(),
        targetVolunteers: z.number().finite(),
      })
      .strict()
      .optional(),
    inKind: z.array(inKindItem).max(50, "No more than fifty in-kind items.").optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    // Bounds only apply to a support type that is actually switched on — the
    // frontend sends `{ enabled: false, targetAmount: 0 }` for unused options.
    if (value.monetary?.enabled) {
      const result = targetAmount.safeParse(value.monetary.targetAmount);
      if (!result.success) {
        ctx.addIssue({
          code: "custom",
          path: ["monetary", "targetAmount"],
          message: result.error.issues[0].message,
        });
      }
    }
    if (value.volunteer?.enabled) {
      const result = volunteerCount.safeParse(value.volunteer.targetVolunteers);
      if (!result.success) {
        ctx.addIssue({
          code: "custom",
          path: ["volunteer", "targetVolunteers"],
          message: result.error.issues[0].message,
        });
      }
    }

    const hasSupport =
      value.monetary?.enabled ||
      value.volunteer?.enabled ||
      (value.inKind?.length ?? 0) > 0;
    if (!hasSupport) {
      ctx.addIssue({
        code: "custom",
        path: ["monetary"],
        message: "Choose at least one way for people to support this project.",
      });
    }
  });

const postBody = z
  .object({
    projectName,
    description: description.nullable().optional(),
    location: location.nullable().optional(),
    causes,
    priority,
    budgetBreakdown: budgetBreakdown.optional(),
    startDate: isoDate.nullable().optional(),
    endDate: isoDate.nullable().optional(),
    startTime: timeOfDay.nullable().optional(),
    endTime: timeOfDay.nullable().optional(),
    supportTypes,
  })
  .strict()
  .refine(
    (data) =>
      !data.startDate || !data.endDate || new Date(data.startDate) <= new Date(data.endDate),
    { message: "The end date must be on or after the start date.", path: ["endDate"] },
  )
  .refine((data) => !data.endTime || Boolean(data.startTime), {
    message: "Provide a start time as well as an end time.",
    path: ["startTime"],
  });

export const createPostSchema = request({ body: postBody });

export const updatePostSchema = request({
  params: z.object({ postId: uuid }).passthrough(),
  body: postBody,
});

export const postIdSchema = request({
  params: z.object({ postId: uuid }).passthrough(),
});

/**
 * WAS: any value from the status enum was written straight through, so
 * Deleted → Approved was legal. The state machine in businessRules.js now
 * governs which transitions are permitted; this only checks the shape.
 */
export const updatePostStatusSchema = request({
  params: z.object({ postId: uuid }).passthrough(),
  body: z.object({ overallStatus: postStatus }).strict(),
});

export const contributionDecisionSchema = request({
  params: z.object({ contributionId: uuid }).passthrough(),
  body: z
    .object({
      status: z.enum(["Confirmed", "Declined"], {
        message: "A contribution can only be confirmed or declined.",
      }),
      note: shortText(500, "Note").optional(),
    })
    .strict(),
});

/* ═══════════════════════════════════════════════════════════════════════════
 * CONTRIBUTIONS
 *
 * Submitted as multipart/form-data (a proof-of-donation file may be attached),
 * so the three arrays arrive as JSON strings. They are parsed here and then
 * validated properly.
 *
 * WAS: `JSON.parse(monetary || "[]")` — malformed JSON threw inside the
 * controller and surfaced as a 500 carrying the parser's message. An unparseable
 * field is now a clean 400.
 * ═══════════════════════════════════════════════════════════════════════════ */

const jsonArray = (itemSchema, label) =>
  z
    .string()
    .max(20_000, `${label} data is too large.`)
    .transform((raw, ctx) => {
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
          ctx.addIssue({ code: "custom", message: `${label} must be a list.` });
          return z.NEVER;
        }
        return parsed;
      } catch {
        ctx.addIssue({ code: "custom", message: `${label} data could not be read.` });
        return z.NEVER;
      }
    })
    .pipe(z.array(itemSchema).max(100, `No more than 100 ${label} entries at once.`))
    .optional();

const donorName = z
  .string()
  .trim()
  .min(1, "A donor name is required.")
  .max(150, "Donor names must be 150 characters or fewer.");

export const addContributionSchema = request({
  params: z.object({ postId: uuid }).passthrough(),
  body: z
    .object({
      monetary: jsonArray(
        z.object({ donorName, amount: contributionAmount }).strict(),
        "Monetary",
      ),
      inKind: jsonArray(
        z.object({ donorName, itemId: uuid, quantity }).strict(),
        "In-kind",
      ),
      volunteer: jsonArray(
        z
          .object({
            donorName,
            count: volunteerCount,
            startDate: z.string().max(40).nullish(),
            endDate: z.string().max(40).nullish(),
            startTime: z.string().max(10).nullish(),
            endTime: z.string().max(10).nullish(),
          })
          .strict(),
        "Volunteer",
      ),
      paymentIntentId: z
        .string()
        .regex(/^pi_[A-Za-z0-9_]{1,100}$/, "Not a valid payment reference.")
        .optional(),
      // Sent by the frontend but never trusted: the acting donor is taken from
      // the session, not from the request body.
      donorId: z.string().max(100).optional(),
    })
    .strict()
    .refine(
      (data) =>
        (data.monetary?.length ?? 0) +
          (data.inKind?.length ?? 0) +
          (data.volunteer?.length ?? 0) >
        0,
      { message: "Add at least one contribution before submitting." },
    ),
});
