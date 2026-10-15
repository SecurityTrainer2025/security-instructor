'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  FORMATIVE_BANK, FORMATIVE_PASS_MIN_CORRECT, getFormativeCheck,
  validateFormativeBank, createFormativeSnapshot, buildPublicFormativeCheck, gradeFormativeCheck
} = require('./avs-emrg-2026-formative-question-bank');
const { FEEDBACK_SURVEY, validateFeedbackSurvey, isFeedbackSurveyApproved } = require('./avs-emrg-2026-feedback-survey');

test('formative bank contains 75 bilingual questions grouped into 15 checks of five', () => {
  assert.equal(FORMATIVE_BANK.length, 75);
  assert.equal(validateFormativeBank(), true);
  assert.equal(FORMATIVE_PASS_MIN_CORRECT, 4);
  for (let n = 1; n <= 15; n++) {
    const group = getFormativeCheck(n);
    assert.equal(group.length, 5);
    assert.ok(group.every(q => q.prompt.includes(' / ') && q.options.length === 4));
    assert.equal(new Set(group.map(q => q.id)).size, 5);
  }
});

test('formative public view hides the answer key and grading uses the persisted order', () => {
  const group = getFormativeCheck(1);
  const snapshot = createFormativeSnapshot(1, 1);
  const publicView = buildPublicFormativeCheck(1, snapshot);
  assert.equal(publicView.length, 5);
  assert.equal(JSON.stringify(publicView).includes('correctOptionId'), false);
  const correct = Object.fromEntries(publicView.map(q => [q.id, group.find(item => item.id === q.id).correctOptionId]));
  assert.equal(gradeFormativeCheck(1, snapshot, correct).correct, 5);
  assert.equal(gradeFormativeCheck(1, snapshot, correct).passed, true);
  const fourCorrect = { ...correct };
  const firstId = publicView[0].id;
  fourCorrect[firstId] = group.find(q => q.id === firstId).options.find(o => o.id !== group.find(q => q.id === firstId).correctOptionId).id;
  assert.equal(gradeFormativeCheck(1, snapshot, fourCorrect).correct, 4);
  assert.equal(gradeFormativeCheck(1, snapshot, fourCorrect).passed, true);
  const threeCorrect = { ...fourCorrect };
  const secondId = publicView.find(q => q.id !== firstId).id;
  threeCorrect[secondId] = group.find(q => q.id === secondId).options.find(o => o.id !== group.find(q => q.id === secondId).correctOptionId).id;
  assert.equal(gradeFormativeCheck(1, snapshot, threeCorrect).correct, 3);
  assert.equal(gradeFormativeCheck(1, snapshot, threeCorrect).passed, false);
});

test('feedback survey is ten bilingual opinion questions and never affects grading or certificates', () => {
  assert.equal(FEEDBACK_SURVEY.questions.length, 10);
  assert.equal(validateFeedbackSurvey(), true);
  assert.equal(FEEDBACK_SURVEY.status, 'draft-pending-owner-approval');
  assert.equal(FEEDBACK_SURVEY.scored, false);
  assert.equal(FEEDBACK_SURVEY.affectsCertificateEligibility, false);
  assert.ok(FEEDBACK_SURVEY.questions.every(q => q.prompt.includes(' / ')));
  assert.equal(new Set(FEEDBACK_SURVEY.questions.map(q => q.id)).size, 10);
  assert.ok(FEEDBACK_SURVEY.questions.every(q =>
    (q.type === 'rating-1-to-5' && Array.isArray(q.scale) && q.scale.length === 5) ||
    (q.type === 'text' && Number.isInteger(q.maxLength) && q.maxLength > 0)
  ));
});


test('feedback survey remains inaccessible until explicit owner approval', () => {
  assert.equal(isFeedbackSurveyApproved(), false);
  assert.equal(isFeedbackSurveyApproved({ status: 'draft-pending-owner-approval' }), false);
  assert.equal(isFeedbackSurveyApproved({ status: 'approved' }), true);
});
