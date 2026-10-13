'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  FORMATIVE_BANK, getFormativeCheck, validateFormativeBank,
  createFormativeSnapshot, buildPublicFormativeCheck, gradeFormativeCheck
} = require('./avs-emrg-2026-formative-question-bank');
const { FEEDBACK_SURVEY, validateFeedbackSurvey } = require('./avs-emrg-2026-feedback-survey');

test('formative bank contains 75 valid bilingual questions in 15 checks of five', () => {
  assert.equal(validateFormativeBank(), true);
  assert.equal(FORMATIVE_BANK.length, 75);
  for (let i = 1; i <= 15; i += 1) assert.equal(getFormativeCheck(i).length, 5);
  assert.ok(FORMATIVE_BANK.every(q => q.prompt.includes('/') && q.options.length === 4));
});

test('formative check shuffles presentation, hides key, and requires 4 of 5', () => {
  const bank = getFormativeCheck(1);
  const snapshot = createFormativeSnapshot(1, 1, (max) => max - 1);
  const publicQuiz = buildPublicFormativeCheck(1, snapshot);
  assert.equal(publicQuiz.length, 5);
  assert.ok(publicQuiz.every(q => !('correctOptionId' in q)));
  const answers = Object.fromEntries(bank.map(q => [q.id, q.correctOptionId]));
  assert.equal(gradeFormativeCheck(1, snapshot, answers).passed, true);
  const threeCorrect = Object.fromEntries(bank.map((q, i) => [q.id, i < 3 ? q.correctOptionId : q.options.find(o => o.id !== q.correctOptionId).id]));
  assert.equal(gradeFormativeCheck(1, snapshot, threeCorrect).passed, false);
});

test('feedback is a 10-question bilingual opinion survey, unscored and certificate-neutral', () => {
  assert.equal(validateFeedbackSurvey(), true);
  assert.equal(FEEDBACK_SURVEY.questions.length, 10);
  assert.equal(FEEDBACK_SURVEY.scored, false);
  assert.equal(FEEDBACK_SURVEY.affectsCertificateEligibility, false);
  assert.ok(FEEDBACK_SURVEY.questions.every(q => q.prompt.includes('/')));
});
