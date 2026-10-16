'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { LESSONS, getLesson } = require('../avs-emrg-2026-lessons');
const { FORMATIVE_BANK, validateFormativeBank, getFormativeCheck } = require('../avs-emrg-2026-formative-question-bank');
const { INITIAL_ASSESSMENT, validateInitialAssessment } = require('../avs-emrg-2026-initial-assessment');
const { QUESTIONS: FINAL_QUESTIONS, validateFinalAssessmentBank } = require('../avs-emrg-2026-final-question-bank');

test('workshop has 15 bilingual lessons with learning objectives and content', () => {
  assert.equal(LESSONS.length, 15);
  for (let order = 1; order <= 15; order += 1) {
    const lesson = getLesson(order);
    assert.equal(lesson.order, order);
    assert.ok(lesson.titleEn && lesson.titleAr);
    assert.ok(lesson.objectivesEn.length > 0 && lesson.objectivesAr.length > 0);
    assert.ok(lesson.contentEn.length > 0 && lesson.contentAr.length > 0);
  }
  assert.equal(getLesson(0), null);
  assert.equal(getLesson(16), null);
});

test('formative bank contains 75 unique questions and five per lesson', () => {
  assert.equal(validateFormativeBank(), true);
  assert.equal(FORMATIVE_BANK.length, 75);
  assert.equal(new Set(FORMATIVE_BANK.map(q => q.id)).size, 75);
  for (let screen = 1; screen <= 15; screen += 1) {
    assert.equal(getFormativeCheck(screen).length, 5);
  }
});

test('initial diagnostic contains ten questions and validates', () => {
  assert.equal(INITIAL_ASSESSMENT.questionCount, 10);
  assert.equal(INITIAL_ASSESSMENT.questions.length, 10);
  assert.equal(validateInitialAssessment(), true);
});

test('final assessment contains thirty unique questions and validates', () => {
  assert.equal(FINAL_QUESTIONS.length, 30);
  assert.equal(new Set(FINAL_QUESTIONS.map(q => q.id)).size, 30);
  assert.equal(validateFinalAssessmentBank(), true);
});
