/**
 * Password reset questions. [CSSECDV 2.1.9]
 *
 * The requirement is that questions "support sufficiently random answers", so
 * these tests assert properties of the CATALOGUE as much as of the code.
 */

import { suite, test, assert, assertEqual, assertIncludes } from "./_harness.mjs";
import {
  SECURITY_QUESTIONS,
  REJECTED_QUESTIONS,
  isValidQuestionKey,
  normalizeAnswer,
  validateAnswer,
  validateAnswerSet,
  hasRequiredSecurityQuestionCount,
  MIN_ANSWER_LENGTH,
} from "../security/securityQuestions.js";

suite("Security question catalogue [2.1.9]");

test("the catalogue offers a real choice", () => {
  assert(SECURITY_QUESTIONS.length >= 6, "too few questions to let users pick meaningfully");
});

test("every question has a unique key", () => {
  const keys = SECURITY_QUESTIONS.map((question) => question.key);
  assertEqual(new Set(keys).size, keys.length);
});

test("every question documents why its answer space is large", () => {
  for (const question of SECURITY_QUESTIONS) {
    assert(
      typeof question.rationale === "string" && question.rationale.length > 30,
      `question "${question.key}" has no rationale — the requirement is about answer entropy, so the justification is part of the design`,
    );
  }
});

test("the specification's own bad example is excluded", () => {
  // "favorite book" is named in the rubric as a bad question because
  // "The Bible" is a very common answer.
  const text = SECURITY_QUESTIONS.map((question) => question.text.toLowerCase()).join(" ");
  assert(!text.includes("favourite book"), "'favourite book' must not be offered");
  assert(!text.includes("favorite book"), "'favorite book' must not be offered");
});

test("other low-entropy classics are excluded", () => {
  const text = SECURITY_QUESTIONS.map((question) => question.text.toLowerCase()).join(" ");
  for (const banned of ["favourite colour", "favorite color", "maiden name", "favourite food"]) {
    assert(!text.includes(banned), `"${banned}" must not be offered`);
  }
});

test("the rejected questions and their reasons are documented in the source", () => {
  assert(REJECTED_QUESTIONS.length >= 5);
  assertIncludes(
    REJECTED_QUESTIONS.map((entry) => entry.question.toLowerCase()).join(" "),
    "favourite book",
  );
  for (const entry of REJECTED_QUESTIONS) {
    assert(entry.reason.length > 20, `"${entry.question}" was rejected without a stated reason`);
  }
});

test("unknown question keys are refused", () => {
  assert(isValidQuestionKey("first_concert"));
  assert(!isValidQuestionKey("favourite_book"));
  assert(!isValidQuestionKey(""));
  assert(!isValidQuestionKey(null));
});

suite("Answer normalization");

test("case and surrounding whitespace do not change the answer", () => {
  assertEqual(normalizeAnswer("  Mapagmahal Street "), "mapagmahal street");
  assertEqual(normalizeAnswer("MAPAGMAHAL STREET"), "mapagmahal street");
});

test("runs of internal whitespace collapse", () => {
  // A user who typed two spaces once must not be locked out of their account.
  assertEqual(normalizeAnswer("mapagmahal    street"), "mapagmahal street");
  assertEqual(normalizeAnswer("mapagmahal\tstreet"), "mapagmahal street");
});

test("null and undefined normalize to an empty string rather than throwing", () => {
  assertEqual(normalizeAnswer(null), "");
  assertEqual(normalizeAnswer(undefined), "");
});

suite("Answer validation");

test("a real answer is accepted", () => {
  assert(validateAnswer("Mapagmahal Street").valid);
});

test(`answers shorter than ${MIN_ANSWER_LENGTH} characters are rejected`, () => {
  assert(!validateAnswer("abc").valid);
});

test("degenerate answers are rejected", () => {
  for (const answer of ["n/a", "none", "test", "asdf", "1234", "idk", "i don't know"]) {
    assert(!validateAnswer(answer).valid, `"${answer}" should have been rejected`);
  }
});

test("a repeated character is rejected", () => {
  assert(!validateAnswer("aaaaaaa").valid);
});

test("an over-long answer is rejected", () => {
  assert(!validateAnswer("x".repeat(200)).valid);
});

suite("Answer set validation");

const goodSet = [
  { questionKey: "first_concert", answer: "Eraserheads at Cubao Expo" },
  { questionKey: "street_age_ten", answer: "Mapagmahal Street" },
];

test("a well-formed set of two answers is accepted", () => {
  assert(validateAnswerSet(goodSet, 2).valid);
});

test("the wrong number of answers is rejected", () => {
  assert(!validateAnswerSet([goodSet[0]], 2).valid);
  assert(!validateAnswerSet([...goodSet, goodSet[0]], 2).valid);
  assert(!validateAnswerSet([], 2).valid);
});

test("the same question chosen twice is rejected", () => {
  const result = validateAnswerSet(
    [
      { questionKey: "first_concert", answer: "Eraserheads at Cubao Expo" },
      { questionKey: "first_concert", answer: "Something else entirely" },
    ],
    2,
  );
  assert(!result.valid);
  assertIncludes(result.failures, "two different questions");
});

test("identical answers to both questions are rejected", () => {
  // Reusing one answer halves the work of guessing the pair.
  const result = validateAnswerSet(
    [
      { questionKey: "first_concert", answer: "Mapagmahal Street" },
      { questionKey: "street_age_ten", answer: "mapagmahal   STREET" },
    ],
    2,
  );
  assert(!result.valid);
  assertIncludes(result.failures, "different answer to each question");
});

test("an unrecognised question key is rejected", () => {
  const result = validateAnswerSet(
    [
      { questionKey: "favourite_book", answer: "The Bible" },
      { questionKey: "street_age_ten", answer: "Mapagmahal Street" },
    ],
    2,
  );
  assert(!result.valid);
  assertIncludes(result.failures, "not recognised");
});

test("malformed input is rejected rather than crashing", () => {
  assert(!validateAnswerSet(null, 2).valid);
  assert(!validateAnswerSet("nope", 2).valid);
  assert(!validateAnswerSet([null, undefined], 2).valid);
});

suite("Security-question setup state");

test("only a complete answer set counts as configured", () => {
  assert(!hasRequiredSecurityQuestionCount(0, 2));
  assert(!hasRequiredSecurityQuestionCount(1, 2));
  assert(hasRequiredSecurityQuestionCount(2, 2));
  assert(hasRequiredSecurityQuestionCount(3, 2));
});

test("invalid counts fail closed", () => {
  assert(!hasRequiredSecurityQuestionCount(undefined, 2));
  assert(!hasRequiredSecurityQuestionCount(2, 0));
  assert(!hasRequiredSecurityQuestionCount(2.5, 2));
});
