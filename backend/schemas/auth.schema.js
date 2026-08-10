/**
 * Validation schemas for authentication endpoints. [CSSECDV 2.3.1–2.3.3]
 *
 * Password *policy* (complexity, re-use, age) is enforced in
 * security/passwordPolicy.js, not here: it needs the user's identity and their
 * password history, and it must apply identically whether the password arrives
 * through registration, an administrator, a self-service change, or a reset.
 * These schemas only enforce shape and bounds.
 */

import {
  z,
  request,
  uuid,
  email,
  password,
  anyPassword,
  personName,
  orgName,
  bio,
  country,
  shortText,
} from "./common.js";
import { SECURITY_QUESTIONS } from "../security/securityQuestions.js";
import config from "../security/env.js";

const questionKeys = SECURITY_QUESTIONS.map((question) => question.key);

const securityAnswer = z
  .object({
    questionKey: z.enum(questionKeys, { message: "Not a recognised security question." }),
    answer: z
      .string()
      .trim()
      .min(4, "Answers must be at least 4 characters.")
      .max(100, "Answers must be 100 characters or fewer."),
  })
  .strict();

/** Exactly N answers — no more, no fewer. */
const securityAnswers = z
  .array(securityAnswer)
  .length(
    config.securityQuestionCount,
    `Please answer exactly ${config.securityQuestionCount} security questions.`,
  );

export const registerDonorSchema = request({
  body: z
    .object({
      firstName: personName,
      surname: personName,
      email,
      password,
      affiliation: z
        .string()
        .trim()
        .min(2, "Affiliation is required.")
        .max(200, "Affiliation must be 200 characters or fewer."),
      country: country.optional(),
      bio: bio.optional(),
      securityAnswers,
    })
    .strict(),
});

export const registerOrganizationSchema = request({
  body: z
    .object({
      firstName: personName,
      surname: personName,
      email,
      password,
      orgName,
      country: country.optional(),
      bio: bio.optional(),
      securityAnswers,
    })
    .strict(),
});

/**
 * Deliberately permissive on the password field.
 *
 * Applying the 12-character minimum here would reject a legacy or wrong
 * password with a *different* response than a wrong-but-well-formed one, and
 * that difference is itself an oracle: it tells an attacker their guess was at
 * least the right shape, and tells them the policy applies to this account.
 * Sign-in accepts any non-empty string and answers every failure identically.
 * [2.1.4]
 */
export const loginSchema = request({
  body: z
    .object({
      email: z.string().trim().min(1).max(254).toLowerCase(),
      password: z.string().min(1).max(200),
    })
    .strict(),
});

export const reauthSchema = request({
  body: z.object({ currentPassword: anyPassword }).strict(),
});

export const changePasswordSchema = request({
  body: z
    .object({
      newPassword: password,
      confirmPassword: z.string().min(1),
    })
    .strict()
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "The two passwords do not match.",
      path: ["confirmPassword"],
    }),
});

export const forgotPasswordSchema = request({
  body: z.object({ email }).strict(),
});

export const verifyResetTokenSchema = request({
  query: z
    .object({
      // 32 random bytes rendered as hex.
      token: z.string().regex(/^[a-f0-9]{64}$/, "Not a valid reset link."),
    })
    .strict(),
});

export const verifyResetAnswersSchema = request({
  body: z
    .object({
      resetToken: z.string().regex(/^[a-f0-9]{64}$/, "Not a valid reset link."),
      answers: securityAnswers,
    })
    .strict(),
});

export const resetPasswordSchema = request({
  body: z
    .object({
      resetToken: z.string().regex(/^[a-f0-9]{64}$/, "Not a valid reset link."),
      newPassword: password,
      confirmPassword: z.string().min(1),
    })
    .strict()
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "The two passwords do not match.",
      path: ["confirmPassword"],
    }),
});

export const setSecurityQuestionsSchema = request({
  body: z.object({ securityAnswers }).strict(),
});

/* ── Administrator account management ─────────────────────────────────────── */

export const createUserSchema = request({
  body: z
    .object({
      email,
      // Only these two. Donors register themselves — enforced again in
      // businessRules.assertAssignableRole so the rule survives a schema edit.
      role: z.enum(["admin", "ngo"], {
        message: "Administrators may only create administrator or organization accounts.",
      }),
      firstName: personName,
      lastName: personName,
      orgName: orgName.optional(),
      country: country.optional(),
    })
    .strict()
    .refine((data) => data.role !== "ngo" || Boolean(data.orgName), {
      message: "An organization name is required for organization accounts.",
      path: ["orgName"],
    }),
});

export const changeRoleSchema = request({
  params: z.object({ id: uuid }).passthrough(),
  body: z.object({ role: z.enum(["admin", "ngo"]) }).strict(),
});

export const accountIdSchema = request({
  params: z.object({ id: uuid }).passthrough(),
});

export const listUsersSchema = request({
  query: z
    .object({
      role: z.enum(["admin", "ngo", "donor"]).optional(),
      status: z.enum(["Active", "Pending", "Disabled", "Rejected"]).optional(),
      search: shortText(254, "Search").optional(),
      page: z.string().regex(/^\d{1,6}$/).optional(),
      limit: z.string().regex(/^\d{1,3}$/).optional(),
    })
    .strict(),
});
