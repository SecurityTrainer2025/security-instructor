'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { FEEDBACK_SURVEY, validateFeedbackSurvey, isFeedbackSurveyApproved } = require('./avs-emrg-2026-feedback-survey');

test('owner-approved workshop feedback survey is available and remains unscored', () => {
  assert.equal(isFeedbackSurveyApproved(), true);
  assert.equal(validateFeedbackSurvey(), true);
  assert.equal(FEEDBACK_SURVEY.questions.length, 10);
  assert.equal(FEEDBACK_SURVEY.scored, false);
  assert.equal(FEEDBACK_SURVEY.affectsCertificateEligibility, false);
});
