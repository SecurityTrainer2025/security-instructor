'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  INITIAL_ASSESSMENT,
  validateInitialAssessment,
  getLearnerQuestionBank,
  createInitialAssessmentSnapshot,
  buildPublicInitialAssessment,
  gradeInitialAssessment
} = require('./avs-emrg-2026-initial-assessment');

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

test('questions and options are shuffled per attempt with order stored in snapshot', () => {
  const sequence = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  let cursor = 0;
  const randomInt = max => sequence[cursor++] % max;
  const snapshot = createInitialAssessmentSnapshot(INITIAL_ASSESSMENT, randomInt);
  assert.equal(snapshot.questionOrder.length, 10);
  assert.equal(new Set(snapshot.questionOrder).size, 10);
  for (const q of INITIAL_ASSESSMENT.questions) {
    assert.equal(snapshot.optionOrderByQuestionId[q.id].length, 4);
    assert.equal(new Set(snapshot.optionOrderByQuestionId[q.id]).size, 4);
  }
  const publicQuiz = buildPublicInitialAssessment(INITIAL_ASSESSMENT, snapshot);
  assert.equal(publicQuiz.length, 10);
  assert.equal(Object.hasOwn(publicQuiz[0], 'correctOptionId'), false);
  assert.equal(Object.hasOwn(publicQuiz[0].options[0], 'isCorrect'), false);
});

test('diagnostic grading uses answer IDs after randomization and does not impose a pass mark', () => {
  const snapshot = createInitialAssessmentSnapshot(INITIAL_ASSESSMENT);
  const answers = {};
  for (const question of INITIAL_ASSESSMENT.questions) {
    answers[question.id] = question.correctOptionId;
  }
  const result = gradeInitialAssessment(INITIAL_ASSESSMENT, snapshot, answers);
  assert.equal(result.correct, 10);
  assert.equal(result.total, 10);
  assert.equal(result.percent, 100);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.passed, null);
});

test('diagnostic grading rejects incomplete or invalid submissions', () => {
  const snapshot = createInitialAssessmentSnapshot(INITIAL_ASSESSMENT);
  assert.throws(() => gradeInitialAssessment(INITIAL_ASSESSMENT, snapshot, {}));
  const answers = Object.fromEntries(INITIAL_ASSESSMENT.questions.map(q => [q.id, q.correctOptionId]));
  answers[INITIAL_ASSESSMENT.questions[0].id] = 'not-an-option';
  assert.throws(() => gradeInitialAssessment(INITIAL_ASSESSMENT, snapshot, answers));
});


test('randomized order changes displayed option positions without changing answer identity', () => {
  // Always selecting index zero in Fisher-Yates produces a predictable non-identity permutation.
  const snapshot = createInitialAssessmentSnapshot(INITIAL_ASSESSMENT, () => 0);
  const publicQuiz = buildPublicInitialAssessment(INITIAL_ASSESSMENT, snapshot);
  const originalFirstQuestion = INITIAL_ASSESSMENT.questions[0];
  const displayedFirstQuestion = publicQuiz.find(q => q.id === originalFirstQuestion.id);
  assert.notDeepEqual(
    displayedFirstQuestion.options.map(option => option.id),
    originalFirstQuestion.options.map(option => option.id)
  );

  const answers = Object.fromEntries(INITIAL_ASSESSMENT.questions.map(q => [q.id, q.correctOptionId]));
  const result = gradeInitialAssessment(INITIAL_ASSESSMENT, snapshot, answers);
  assert.equal(result.correct, 10);
  assert.equal(result.percent, 100);
});

test('question identifiers and option identifiers must be unique', () => {
  const broken = {
    ...INITIAL_ASSESSMENT,
    questions: INITIAL_ASSESSMENT.questions.map(question => ({ ...question }))
  };
  broken.questions[1] = { ...broken.questions[1], id: broken.questions[0].id };
  assert.throws(() => validateInitialAssessment(broken));
});
