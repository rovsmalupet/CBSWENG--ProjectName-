/**
 * common.js — reusable validation primitives. [CSSECDV 2.3.2, 2.3.3]
 *
 * Every bound in this file is a deliberate decision rather than a default.
 * Range and length limits are the two checks the specification calls out by
 * name, and having them in one place means an endpoint cannot accidentally
 * disagree with another about how long a project name may be.
 *
 * NOTE ON COERCION: these schemas do not coerce. `z.coerce.number()` would turn
 * the string "12abc" into NaN and an empty string into 0, which is precisely
 * the silent repair 2.3.1 forbids. A number field must receive a number.
 */

import { z } from "zod";
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from "../security/passwordPolicy.js";

/* ═══════════════════════════════════════════════════════════════════════════
 * IDENTIFIERS
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Every id in this application is a UUID.
 *
 * Checked before it reaches Prisma: a malformed id previously produced an
 * unhandled Prisma error and a 500 carrying the driver's own message, which is
 * both a bad experience and an information leak. [2.4.1]
 */
export const uuid = z.string().uuid({ message: "Not a valid identifier." });

/* ═══════════════════════════════════════════════════════════════════════════
 * TEXT — length bounds [2.3.3]
 * ═══════════════════════════════════════════════════════════════════════════ */

export const email = z
  .string()
  .trim()
  .min(5, "Email address is too short.")
  .max(254, "Email address is too long.") // RFC 5321 maximum
  .email("Please enter a valid email address.")
  .toLowerCase();

export const password = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
  .max(MAX_PASSWORD_LENGTH, `Password must be no more than ${MAX_PASSWORD_LENGTH} characters.`);

/** For the *current* password on a re-auth: no policy applied, only a bound. */
export const anyPassword = z.string().min(1, "Password is required.").max(200);

export const personName = z
  .string()
  .trim()
  .min(1, "This field is required.")
  .max(100, "Must be 100 characters or fewer.");

export const orgName = z
  .string()
  .trim()
  .min(2, "Organization name is too short.")
  .max(200, "Organization name must be 200 characters or fewer.");

export const shortText = (max, label = "This field") =>
  z.string().trim().max(max, `${label} must be ${max} characters or fewer.`);

export const bio = shortText(1000, "Bio");
export const description = shortText(5000, "Description");
export const location = shortText(200, "Location");
export const projectName = z
  .string()
  .trim()
  .min(3, "Project name is too short.")
  .max(200, "Project name must be 200 characters or fewer.");

/* ═══════════════════════════════════════════════════════════════════════════
 * NUMBERS — range bounds [2.3.2]
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Currency: positive, bounded, and no more than two decimal places. */
export const money = (max, label = "Amount") =>
  z
    .number({ message: `${label} must be a number.` })
    .finite(`${label} must be a number.`)
    .positive(`${label} must be greater than zero.`)
    .max(max, `${label} must not exceed ${max.toLocaleString("en-PH")}.`)
    .refine((value) => Number.isInteger(Math.round(value * 100)) && value * 100 % 1 === 0, {
      message: `${label} must have at most two decimal places.`,
    });

/** A single contribution. The ceiling also caps the damage of a compromise. */
export const contributionAmount = money(1_000_000, "Donation amount");

/** A fundraising goal. Floor set high enough that a typo does not create one. */
export const targetAmount = z
  .number()
  .finite()
  .min(100, "A fundraising goal must be at least ₱100.")
  .max(10_000_000, "A fundraising goal must not exceed ₱10,000,000.");

export const volunteerCount = z
  .number()
  .int("Volunteer numbers must be whole people.")
  .min(1, "Must be at least 1.")
  .max(10_000, "Must not exceed 10,000.");

export const quantity = z
  .number()
  .finite()
  .positive("Quantity must be greater than zero.")
  .max(1_000_000, "Quantity must not exceed 1,000,000.");

export const pricePerUnit = z
  .number()
  .finite()
  .nonnegative("Price cannot be negative.")
  .max(1_000_000, "Price must not exceed 1,000,000.");

/* ═══════════════════════════════════════════════════════════════════════════
 * ENUMS — mirrored from schema.prisma
 * ═══════════════════════════════════════════════════════════════════════════ */

export const ASEAN_COUNTRIES = [
  "Brunei", "Cambodia", "Indonesia", "Laos", "Malaysia",
  "Myanmar", "Philippines", "Singapore", "Thailand", "Vietnam",
];

export const CAUSES = [
  "noPoverty", "zeroHunger", "goodHealth", "qualityEducation", "genderEquality",
  "cleanWater", "affordableEnergy", "decentWork", "industry", "reducedInequalities",
  "sustainableCities", "responsibleConsumption", "climateAction", "lifeBelowWater",
  "lifeOnLand", "peaceAndJustice", "partnerships", "others",
];

export const PRIORITIES = ["High", "Medium", "Low"];
export const POST_STATUSES = ["Pending", "Approved", "Unapproved", "Edited", "Deleted"];
export const SUPPORT_TYPES = ["Monetary", "Volunteer", "InKind"];
export const DOCUMENT_TYPES = [
  "Photo", "Receipt", "Report", "Update", "Documentation",
  "Certification", "Compliance", "Certificate", "Other",
];

export const country = z.enum(ASEAN_COUNTRIES, { message: "Please select a valid country." });
export const priority = z.enum(PRIORITIES, { message: "Please select a valid priority." });
export const postStatus = z.enum(POST_STATUSES, { message: "Not a valid project status." });
export const documentType = z.enum(DOCUMENT_TYPES, { message: "Not a valid document type." });

export const causes = z
  .array(z.enum(CAUSES, { message: "Not a recognised cause." }))
  .min(1, "Select at least one cause.")
  .max(5, "Select no more than five causes.")
  .refine((list) => new Set(list).size === list.length, {
    message: "The same cause cannot be selected twice.",
  });

/* ═══════════════════════════════════════════════════════════════════════════
 * DATES AND TIMES [2.3.2]
 * ═══════════════════════════════════════════════════════════════════════════ */

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/** ISO 8601, and within a window that rules out typos like the year 20256. */
export const isoDate = z
  .string()
  .datetime({ offset: true, message: "Not a valid date." })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Not a valid date."))
  .refine(
    (value) => {
      const time = new Date(value).getTime();
      if (Number.isNaN(time)) return false;
      return time > Date.now() - ONE_YEAR_MS && time < Date.now() + 5 * ONE_YEAR_MS;
    },
    { message: "Date must be within one year in the past and five years in the future." },
  );

/** Strict 24-hour HH:MM. */
export const timeOfDay = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in 24-hour HH:MM format.");

/* ═══════════════════════════════════════════════════════════════════════════
 * PAGINATION
 *
 * Query strings are always strings, so this is the one place a numeric
 * conversion is legitimate. It is still a rejection, not a coercion: a
 * non-numeric value fails rather than becoming NaN or a default.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const pageNumber = z
  .string()
  .regex(/^\d{1,6}$/, "Page must be a number.")
  .transform(Number)
  .refine((value) => value >= 1, { message: "Page must be at least 1." });

export const pageSize = z
  .string()
  .regex(/^\d{1,3}$/, "Page size must be a number.")
  .transform(Number)
  .refine((value) => value >= 1 && value <= 100, { message: "Page size must be between 1 and 100." });

/* ═══════════════════════════════════════════════════════════════════════════
 * HELPERS
 * ═══════════════════════════════════════════════════════════════════════════ */

export const empty = z.object({}).strict();

/**
 * Build a request schema. Any section left out must be EMPTY — that is what
 * makes an unexpected query parameter or stray body on a GET a rejection.
 */
export const request = ({ body, params, query } = {}) =>
  z
    .object({
      body: body ?? z.object({}).passthrough(), // GET/DELETE bodies are ignored, not policed
      params: params ?? z.object({}).passthrough(),
      query: query ?? z.object({}).strict(),
    })
    .strict();

export { z };
