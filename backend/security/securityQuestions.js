/**
 * securityQuestions.js — password-reset questions. [CSSECDV 2.1.9]
 *
 * The requirement is that questions "support sufficiently random answers", and
 * it names "favorite book" as the counter-example because the answer space
 * collapses to a handful of titles.
 *
 * The catalogue below was built by asking one question of every candidate:
 * *how many answers are plausible, and how many of them could a stranger find
 * or guess?* Anything whose honest answer space is small, publicly recorded, or
 * inferable from a social profile was rejected — see REJECTED_QUESTIONS at the
 * bottom, which is kept in the source deliberately so the reasoning survives.
 *
 * Answers are credentials. They are normalized, then bcrypt-hashed with the
 * same cost factor as passwords, never logged, and never returned by any
 * endpoint.
 */

import prisma from "../prisma/client.js";
import { hashPassword, verifyPassword, wasteTime } from "./passwordPolicy.js";

/* ═══════════════════════════════════════════════════════════════════════════
 * CATALOGUE
 * ═══════════════════════════════════════════════════════════════════════════ */

export const SECURITY_QUESTIONS = Object.freeze([
  {
    key: "street_age_ten",
    text: "What was the name of the street you lived on when you were ten years old?",
    rationale:
      "Millions of distinct street names; tied to a specific year so it is not the user's current address, which is often on file somewhere.",
  },
  {
    key: "first_concert",
    text: "What was the first live concert or performance you attended?",
    rationale:
      "Very long tail of artists and venues, and rarely posted publicly years after the fact.",
  },
  {
    key: "first_employer",
    text: "What was the name of your first employer?",
    rationale:
      "Long tail of small businesses. A first job is usually absent from a public profile even when later jobs are listed.",
  },
  {
    key: "childhood_phone_last_four",
    text: "What were the last four digits of your childhood telephone number?",
    rationale:
      "10,000 outcomes distributed close to uniformly — the only genuinely random answer in the set, and not derivable from anything public.",
  },
  {
    key: "grade_school_teacher",
    text: "What was the surname of your favourite grade-school teacher?",
    rationale:
      "Large surname space; grade-school staff lists are not indexed the way universities are.",
  },
  {
    key: "first_pet_vet",
    text: "What was the name of the veterinary clinic your first pet went to?",
    rationale:
      "Compound answer (a business name, in a specific locality, at a specific time). 'First pet's name' alone was rejected — people post those.",
  },
  {
    key: "childhood_nickname_relative",
    text: "What nickname did a relative call you as a child that your friends never used?",
    rationale:
      "The qualifier is what makes it work: it deliberately excludes any nickname that circulated socially.",
  },
  {
    key: "first_dish_cooked",
    text: "What was the first dish you learned to cook by yourself?",
    rationale:
      "Broad answer space and specific to the individual. Distinct from 'favourite food', which clusters hard on a few answers.",
  },
]);

const QUESTIONS_BY_KEY = new Map(SECURITY_QUESTIONS.map((q) => [q.key, q]));

export const isValidQuestionKey = (key) => QUESTIONS_BY_KEY.has(key);
export const getQuestionText = (key) => QUESTIONS_BY_KEY.get(key)?.text ?? null;

/**
 * Kept in the source as documentation of the design decision, not as dead code.
 * If someone later proposes adding "mother's maiden name", the reason it was
 * left out is right here.
 */
export const REJECTED_QUESTIONS = Object.freeze([
  {
    question: "What is your favourite book?",
    reason:
      "Named by the specification. Answers cluster catastrophically — 'The Bible', 'Harry Potter', and a handful of school set texts cover most respondents.",
  },
  {
    question: "What is your favourite colour?",
    reason: "Roughly eleven answers in practice. Guessable in a few attempts.",
  },
  {
    question: "What is your mother's maiden name?",
    reason: "A matter of public record in many jurisdictions, and a well-known weak secret.",
  },
  {
    question: "What high school did you attend?",
    reason: "Usually listed on a public social profile; often inferable from the user's home town.",
  },
  {
    question: "What is your favourite food?",
    reason: "Small effective answer space, and frequently posted publicly.",
  },
  {
    question: "What is your pet's name?",
    reason:
      "Extremely commonly shared on social media. Retained only in the narrower 'first pet's veterinary clinic' form.",
  },
  {
    question: "What city were you born in?",
    reason: "Population-weighted, so a few large cities dominate; frequently public.",
  },
]);

/* ═══════════════════════════════════════════════════════════════════════════
 * ANSWERS
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Normalize before hashing so trivial formatting differences do not lock a
 * legitimate user out of their own account — "  Mapagmahal  St " and
 * "mapagmahal st" must verify identically.
 *
 * This is normalization for comparison, not sanitizing for storage: the value
 * is immediately one-way hashed and never used as data. It does not conflict
 * with 2.3.1, which is about accepting invalid input as though it were valid.
 */
export const normalizeAnswer = (answer) =>
  String(answer ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

export const MIN_ANSWER_LENGTH = 4;
export const MAX_ANSWER_LENGTH = 100;

/** Answers that would make the question worthless. */
const DEGENERATE_ANSWERS = new Set([
  "n/a", "na", "none", "null", "nil", "test", "testing", "asdf", "asdfasdf",
  "qwerty", "1234", "12345", "123456", "abcd", "abcde", "aaaa", "aaaaa",
  "xxxx", "xxxxx", "idk", "i dont know", "i don't know", "nothing", "no",
  "yes", "answer", "secret", "password", "same", "blank", "empty",
]);

/**
 * @returns {{ valid: boolean, failures: string[] }}
 */
export const validateAnswer = (answer) => {
  const failures = [];
  const normalized = normalizeAnswer(answer);

  if (normalized.length < MIN_ANSWER_LENGTH) {
    failures.push(`Answers must be at least ${MIN_ANSWER_LENGTH} characters long.`);
  }
  if (normalized.length > MAX_ANSWER_LENGTH) {
    failures.push(`Answers must be no more than ${MAX_ANSWER_LENGTH} characters long.`);
  }
  if (DEGENERATE_ANSWERS.has(normalized)) {
    failures.push("That answer is too easy to guess. Please give a real answer.");
  }
  if (normalized.length >= MIN_ANSWER_LENGTH && /^(.)\1+$/.test(normalized.replace(/\s/g, ""))) {
    failures.push("That answer is too easy to guess. Please give a real answer.");
  }

  return { valid: failures.length === 0, failures };
};

/**
 * Validate a full set of question/answer pairs before any of it is stored.
 *
 * @param {Array<{questionKey: string, answer: string}>} pairs
 * @param {number} requiredCount
 * @returns {{ valid: boolean, failures: string[] }}
 */
export const validateAnswerSet = (pairs, requiredCount) => {
  const failures = [];

  if (!Array.isArray(pairs) || pairs.length !== requiredCount) {
    return {
      valid: false,
      failures: [`Please answer exactly ${requiredCount} security questions.`],
    };
  }

  const seen = new Set();
  for (const pair of pairs) {
    if (!isValidQuestionKey(pair?.questionKey)) {
      failures.push("One of the selected questions is not recognised.");
      continue;
    }
    if (seen.has(pair.questionKey)) {
      failures.push("Please choose two different questions.");
    }
    seen.add(pair.questionKey);

    const result = validateAnswer(pair?.answer);
    failures.push(...result.failures);
  }

  // Identical answers to both questions halve the work of guessing them.
  const normalizedAnswers = pairs
    .map((pair) => normalizeAnswer(pair?.answer))
    .filter((answer) => answer.length > 0);
  if (new Set(normalizedAnswers).size !== normalizedAnswers.length) {
    failures.push("Please give a different answer to each question.");
  }

  return { valid: failures.length === 0, failures: [...new Set(failures)] };
};

/* ═══════════════════════════════════════════════════════════════════════════
 * PERSISTENCE
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Replace an account's security answers wholesale. Validate before calling. */
export const setSecurityAnswers = async (accountId, pairs) => {
  const hashed = await Promise.all(
    pairs.map(async (pair) => ({
      accountId,
      questionKey: pair.questionKey,
      answerHash: await hashPassword(normalizeAnswer(pair.answer)),
    })),
  );

  await prisma.$transaction(async (tx) => {
    await tx.securityAnswer.deleteMany({ where: { accountId } });
    for (const record of hashed) {
      await tx.securityAnswer.create({ data: record });
    }
  });
};

/**
 * The question keys and texts for an account — never the answers.
 * Safe to hand to an unauthenticated caller who holds a valid reset token.
 */
export const getQuestionsForAccount = async (accountId) => {
  const rows = await prisma.securityAnswer.findMany({
    where: { accountId },
    select: { questionKey: true },
    orderBy: { createdAt: "asc" },
  });

  return rows
    .filter((row) => isValidQuestionKey(row.questionKey))
    .map((row) => ({ key: row.questionKey, text: getQuestionText(row.questionKey) }));
};

export const hasSecurityQuestions = async (accountId) =>
  (await prisma.securityAnswer.count({ where: { accountId } })) > 0;

/**
 * Verify submitted answers against the stored hashes.
 *
 * ALL answers must be correct. The caller receives one boolean — never which
 * answer was wrong — for the same reason login returns one generic message:
 * telling an attacker that question 1 was right halves the search space.
 *
 * Always compares against every stored answer even after the first mismatch, so
 * response time does not reveal how far the attacker got.
 */
export const verifySecurityAnswers = async (accountId, submitted) => {
  const stored = await prisma.securityAnswer.findMany({
    where: { accountId },
    select: { questionKey: true, answerHash: true },
  });

  if (stored.length === 0 || !Array.isArray(submitted) || submitted.length !== stored.length) {
    await wasteTime();
    return false;
  }

  const submittedByKey = new Map(
    submitted
      .filter((entry) => entry && typeof entry.questionKey === "string")
      .map((entry) => [entry.questionKey, entry.answer]),
  );

  let allCorrect = true;
  for (const record of stored) {
    const candidate = submittedByKey.get(record.questionKey);
    if (candidate === undefined) {
      await wasteTime();
      allCorrect = false;
      continue;
    }
    const matches = await verifyPassword(normalizeAnswer(candidate), record.answerHash);
    if (!matches) allCorrect = false;
  }

  return allCorrect;
};

export default {
  SECURITY_QUESTIONS,
  REJECTED_QUESTIONS,
  isValidQuestionKey,
  getQuestionText,
  normalizeAnswer,
  validateAnswer,
  validateAnswerSet,
  setSecurityAnswers,
  getQuestionsForAccount,
  hasSecurityQuestions,
  verifySecurityAnswers,
};
