'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const assessment = require('./avs-emrg-2026-assessment');

function bank(count = 30) {
  return Array.from({ length: count }, (_, index) => ({
    id: `q${index + 1}`,
    prompt: `Question ${index + 1}`,
    options: [
      { id: `q${index + 1}-a`, text: 'Option A' },
      { id: `q${index + 1}-b`, text: 'Option B' },
      { id: `q${index + 1}-c`, text: 'Option C' },
      { id: `q${index + 1}-d`, text: 'Option D' }
    ],
    correctOptionId: `q${index + 1}-c`
  }));
}

function answersFor(questions, snapshot, correctCount) {
  const byId = new Map(questions.map(question => [question.id, question]));
  const answers = {};
  snapshot.questionOrder.forEach((questionId, index) => {
    const question = byId.get(questionId);
    answers[questionId] = index < correctCount
      ? question.correctOptionId
      : question.options.find(option => option.id !== question.correctOptionId).id;
  });
  return answers;
}

test('AVS final policy uses 30 questions, 22 correct, and three attempts', () => {
  assert.equal(assessment.FINAL_QUESTION_COUNT, 30);
  assert.equal(assessment.FINAL_PASS_MIN_CORRECT, 22);
  assert.equal(assessment.MAX_FINAL_ATTEMPTS, 3);
  assert.equal(assessment.canStartFinalAttempt(0), true);
  assert.equal(assessment.canStartFinalAttempt(2), true);
  assert.equal(assessment.canStartFinalAttempt(3), false);
});

test('server-side grading enforces strict greater than 70 percent boundary', () => {
  const questions = bank();
  const snapshot = assessment.createAttemptSnapshot(questions, {
    expectedCount: 30,
    attemptNumber: 1
  });
  const fail = assessment.gradeAttempt(questions, snapshot, answersFor(questions, snapshot, 21), {
    passCorrect: 22
  });
  const pass = assessment.gradeAttempt(questions, snapshot, answersFor(questions, snapshot, 22), {
    passCorrect: 22
  });
  assert.equal(fail.correct, 21);
  assert.equal(fail.percent, 70);
  assert.equal(fail.passed, false);
  assert.equal(pass.correct, 22);
  assert.equal(pass.percent, 73.33);
  assert.equal(pass.passed, true);
  assert.equal(Object.hasOwn(pass, 'answerKey'), false);
});

test('public quiz omits answer keys and preserves only presented options', () => {
  const questions = bank(5);
  const snapshot = assessment.createAttemptSnapshot(questions, {
    expectedCount: 5,
    attemptNumber: 1
  });
  const publicQuiz = assessment.buildPublicQuiz(questions, snapshot);
  assert.equal(publicQuiz.length, 5);
  for (const question of publicQuiz) {
    assert.equal(question.options.length, 4);
    assert.equal(Object.hasOwn(question, 'correctOptionId'), false);
    assert.equal(question.options.every(option => !Object.hasOwn(option, 'isCorrect')), true);
  }
});

test('grading rejects missing, extra, or unpresented answers', () => {
  const questions = bank(5);
  const snapshot = assessment.createAttemptSnapshot(questions, {
    expectedCount: 5,
    attemptNumber: 1
  });
  const valid = answersFor(questions, snapshot, 5);
  const missing = { ...valid };
  delete missing[snapshot.questionOrder[0]];
  assert.throws(() => assessment.gradeAttempt(questions, snapshot, missing, { passCorrect: 4 }));
  assert.throws(() => assessment.gradeAttempt(questions, snapshot, { ...valid, unknown: 'x' }, { passCorrect: 4 }));
  const invalid = { ...valid, [snapshot.questionOrder[0]]: 'not-presented' };
  assert.throws(() => assessment.gradeAttempt(questions, snapshot, invalid, { passCorrect: 4 }));
});

test('formative policy requires 4 of 5 and question banks are validated', () => {
  assert.equal(assessment.FORMATIVE_QUESTION_COUNT, 5);
  assert.equal(assessment.FORMATIVE_PASS_MIN_CORRECT, 4);
  assert.equal(assessment.assertQuestionBank(bank(5), 5), true);
  assert.throws(() => assessment.assertQuestionBank(bank(4), 5));
  const duplicate = bank(5);
  duplicate[1].id = duplicate[0].id;
  assert.throws(() => assessment.assertQuestionBank(duplicate, 5));
});
