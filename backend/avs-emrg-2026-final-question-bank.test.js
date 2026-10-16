'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { QUESTIONS, validateFinalAssessmentBank } = require('./avs-emrg-2026-final-question-bank');
const {
  FINAL_QUESTION_COUNT,
  FINAL_PASS_MIN_CORRECT,
  MAX_FINAL_ATTEMPTS,
  createAttemptSnapshot,
  buildPublicQuiz,
  gradeAttempt
} = require('./avs-emrg-2026-assessment');

test('AVS final question bank has 30 bilingual questions and varied correct positions', () => {
  assert.equal(QUESTIONS.length, FINAL_QUESTION_COUNT);
  assert.equal(validateFinalAssessmentBank(), true);
  assert.ok(new Set(QUESTIONS.map(q => q.correctOptionId)).size > 1);
  for (const question of QUESTIONS) {
    assert.match(question.prompt, /\//);
    assert.equal(question.options.length, 4);
    assert.ok(question.options.some(option => option.id === question.correctOptionId));
  }
});

test('final attempt shuffles question and option orders without exposing the answer key', () => {
  const snapshot = createAttemptSnapshot(QUESTIONS, { expectedCount: 30, attemptNumber: 1 });
  const quiz = buildPublicQuiz(QUESTIONS, snapshot);
  assert.equal(quiz.length, 30);
  assert.equal(new Set(snapshot.questionOrder).size, 30);
  for (const q of quiz) {
    assert.equal(q.options.length, 4);
    assert.equal(Object.hasOwn(q, 'correctOptionId'), false);
    assert.ok(!q.options.some(option => Object.hasOwn(option, 'isCorrect')));
  }
});

test('final grading respects the strict greater-than-70-percent threshold', () => {
  const snapshot = createAttemptSnapshot(QUESTIONS, { expectedCount: 30, attemptNumber: 1 });
  const answers = {};
  const byId = new Map(QUESTIONS.map(q => [q.id, q]));
  snapshot.questionOrder.forEach((id, index) => {
    const q = byId.get(id);
    answers[id] = index < 21
      ? q.correctOptionId
      : q.options.find(option => option.id !== q.correctOptionId).id;
  });
  assert.equal(gradeAttempt(QUESTIONS, snapshot, answers).passed, false);
  snapshot.questionOrder.forEach((id, index) => {
    if (index === 21) answers[id] = byId.get(id).correctOptionId;
  });
  const result = gradeAttempt(QUESTIONS, snapshot, answers);
  assert.equal(result.correct, 22);
  assert.equal(result.passed, true);
});

test('final assessment attempt policy remains three attempts maximum', () => {
  assert.equal(FINAL_PASS_MIN_CORRECT, 22);
  assert.equal(MAX_FINAL_ATTEMPTS, 3);
});
