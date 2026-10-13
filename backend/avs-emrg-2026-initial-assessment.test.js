'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { INITIAL_ASSESSMENT, validateInitialAssessment, getLearnerQuestionBank } =
  require('./avs-emrg-2026-initial-assessment');

test('initial assessment contains 10 medium bilingual diagnostic questions', () => {
  assert.equal(INITIAL_ASSESSMENT.questionCount, 10);
  assert.equal(INITIAL_ASSESSMENT.difficulty, 'medium');
  assert.equal(INITIAL_ASSESSMENT.requiredToPass, false);
  assert.equal(INITIAL_ASSESSMENT.gatesWorkshopAccess, false);
  assert.equal(INITIAL_ASSESSMENT.affectsCertificateEligibility, false);
  assert.equal(validateInitialAssessment(), true);
});

test('every initial question has four bilingual options and a valid answer key', () => {
  for (const question of INITIAL_ASSESSMENT.questions) {
    assert.ok(question.prompt.en);
    assert.ok(question.prompt.ar);
    assert.equal(question.options.length, 4);
    assert.ok(question.options.some(option => option.id === question.correctOptionId));
    for (const option of question.options) {
      assert.ok(option.text.en);
      assert.ok(option.text.ar);
    }
  }
});

test('learner-safe question bank excludes correct answers', () => {
  const learnerBank = getLearnerQuestionBank();
  assert.equal(learnerBank.length, 10);
  for (const question of learnerBank) {
    assert.equal(Object.hasOwn(question, 'correctOptionId'), false);
    assert.equal(question.options.length, 4);
    for (const option of question.options) {
      assert.equal(Object.hasOwn(option, 'isCorrect'), false);
    }
  }
});

test('question identifiers and option identifiers must be unique', () => {
  const broken = {
    ...INITIAL_ASSESSMENT,
    questions: INITIAL_ASSESSMENT.questions.map(question => ({ ...question }))
  };
  broken.questions[1] = { ...broken.questions[1], id: broken.questions[0].id };
  assert.throws(() => validateInitialAssessment(broken));
});
