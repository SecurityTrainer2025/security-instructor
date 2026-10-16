'use strict';

/**
 * Isolated AVS-EMRG-2026 assessment primitives.
 *
 * This module is intentionally not wired into the running app. The caller must
 * persist the returned attempt snapshot server-side before showing a quiz and
 * use that exact snapshot to grade the submission. Never send correctOptionId
 * or the answer key to the browser.
 */
const crypto = require('node:crypto');

const FINAL_QUESTION_COUNT = 30;
const FINAL_PASS_MIN_CORRECT = 22; // Strictly greater than 70% of 30.
const MAX_FINAL_ATTEMPTS = 3;
const FORMATIVE_QUESTION_COUNT = 5;
const FORMATIVE_PASS_MIN_CORRECT = 4;

function assertQuestionBank(questions, expectedCount) {
  if (!Array.isArray(questions) || questions.length !== expectedCount) {
    throw new TypeError(`Expected exactly ${expectedCount} questions.`);
  }
  const questionIds = new Set();
  for (const question of questions) {
    if (!question || typeof question.id !== 'string' || !question.id.trim()) {
      throw new TypeError('Each question must have a non-empty string id.');
    }
    if (questionIds.has(question.id)) throw new TypeError('Question ids must be unique.');
    questionIds.add(question.id);
    if (typeof question.prompt !== 'string' || !question.prompt.trim()) {
      throw new TypeError(`Question ${question.id} needs a prompt.`);
    }
    if (!Array.isArray(question.options) || question.options.length < 2) {
      throw new TypeError(`Question ${question.id} needs at least two options.`);
    }
    const optionIds = new Set();
    for (const option of question.options) {
      if (!option || typeof option.id !== 'string' || !option.id.trim() ||
          typeof option.text !== 'string' || !option.text.trim()) {
        throw new TypeError(`Question ${question.id} has an invalid option.`);
      }
      if (optionIds.has(option.id)) throw new TypeError(`Question ${question.id} has duplicate option ids.`);
      optionIds.add(option.id);
    }
    if (typeof question.correctOptionId !== 'string' || !optionIds.has(question.correctOptionId)) {
      throw new TypeError(`Question ${question.id} has no valid server-side correct option.`);
    }
  }
  return true;
}

function shuffled(values, randomInt = crypto.randomInt) {
  const result = values.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    if (!Number.isInteger(j) || j < 0 || j > i) throw new RangeError('Random source returned an invalid index.');
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Build a per-attempt ordering snapshot. Persist this snapshot server-side;
 * never accept a replacement order from the learner's request.
 */
function createAttemptSnapshot(questions, { expectedCount, attemptNumber, randomInt } = {}) {
  assertQuestionBank(questions, expectedCount);
  if (!Number.isInteger(attemptNumber) || attemptNumber < 1) {
    throw new TypeError('attemptNumber must be a positive integer.');
  }
  const questionOrder = shuffled(questions.map(question => question.id), randomInt);
  const optionOrderByQuestionId = {};
  for (const question of questions) {
    optionOrderByQuestionId[question.id] = shuffled(question.options.map(option => option.id), randomInt);
  }
  return Object.freeze({
    attemptId: crypto.randomUUID(),
    attemptNumber,
    questionOrder: Object.freeze(questionOrder),
    optionOrderByQuestionId: Object.freeze(Object.fromEntries(
      Object.entries(optionOrderByQuestionId).map(([id, order]) => [id, Object.freeze(order)])
    ))
  });
}

/** Create a browser-safe view from the authoritative bank + persisted snapshot. */
function buildPublicQuiz(questions, snapshot) {
  if (!snapshot || !Array.isArray(snapshot.questionOrder) || !snapshot.optionOrderByQuestionId) {
    throw new TypeError('A valid persisted attempt snapshot is required.');
  }
  const byId = new Map(questions.map(question => [question.id, question]));
  if (snapshot.questionOrder.length !== questions.length ||
      new Set(snapshot.questionOrder).size !== questions.length) {
    throw new TypeError('Snapshot question order is invalid.');
  }
  return snapshot.questionOrder.map(questionId => {
    const question = byId.get(questionId);
    const optionOrder = snapshot.optionOrderByQuestionId[questionId];
    if (!question || !Array.isArray(optionOrder) || optionOrder.length !== question.options.length ||
        new Set(optionOrder).size !== question.options.length) {
      throw new TypeError('Snapshot option order is invalid.');
    }
    const optionById = new Map(question.options.map(option => [option.id, option]));
    return {
      id: question.id,
      prompt: question.prompt,
      options: optionOrder.map(optionId => {
        const option = optionById.get(optionId);
        if (!option) throw new TypeError('Snapshot references an unknown option.');
        return { id: option.id, text: option.text };
      })
    };
  });
}

/**
 * Answers are { [questionId]: optionId }. Grade only against the authoritative
 * bank and the exact stored attempt snapshot. Return no correct answers.
 */
function gradeAttempt(questions, snapshot, answers, { passCorrect } = {}) {
  if (!snapshot || !Array.isArray(snapshot.questionOrder) || !snapshot.optionOrderByQuestionId) {
    throw new TypeError('A valid persisted attempt snapshot is required.');
  }
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    throw new TypeError('Answers must be an object keyed by question id.');
  }
  const byId = new Map(questions.map(question => [question.id, question]));
  const expectedIds = snapshot.questionOrder;
  const answerIds = Object.keys(answers);
  if (answerIds.length !== expectedIds.length || answerIds.some(id => !expectedIds.includes(id))) {
    throw new TypeError('Submission must contain exactly one answer for each presented question.');
  }
  let correct = 0;
  for (const questionId of expectedIds) {
    const question = byId.get(questionId);
    const presentedOptionIds = snapshot.optionOrderByQuestionId[questionId];
    const selectedOptionId = answers[questionId];
    if (!question || !Array.isArray(presentedOptionIds) ||
        !presentedOptionIds.includes(selectedOptionId)) {
      throw new TypeError('Submission contains an invalid option for this attempt.');
    }
    if (selectedOptionId === question.correctOptionId) correct += 1;
  }
  const total = expectedIds.length;
  const minimum = passCorrect === undefined ? Math.floor(total * 0.7) + 1 : passCorrect;
  if (!Number.isInteger(minimum) || minimum < 1 || minimum > total) {
    throw new TypeError('passCorrect must be an integer within the assessment range.');
  }
  return Object.freeze({
    correct,
    total,
    percent: Math.round((correct / total) * 10000) / 100,
    passed: correct >= minimum
  });
}

function canStartFinalAttempt(completedAttempts) {
  return Number.isInteger(completedAttempts) &&
    completedAttempts >= 0 &&
    completedAttempts < MAX_FINAL_ATTEMPTS;
}

module.exports = {
  FINAL_QUESTION_COUNT,
  FINAL_PASS_MIN_CORRECT,
  MAX_FINAL_ATTEMPTS,
  FORMATIVE_QUESTION_COUNT,
  FORMATIVE_PASS_MIN_CORRECT,
  assertQuestionBank,
  createAttemptSnapshot,
  buildPublicQuiz,
  gradeAttempt,
  canStartFinalAttempt
};
