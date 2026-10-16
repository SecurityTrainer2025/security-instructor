'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { LESSONS, getLesson } = require('./avs-emrg-2026-lessons');

test('AVS lesson draft has 15 ordered bilingual screens with objectives and content', () => {
  assert.equal(LESSONS.length, 15);
  LESSONS.forEach((lesson, index) => {
    assert.equal(lesson.order, index + 1);
    assert.ok(lesson.titleEn && lesson.titleAr);
    assert.ok(lesson.objectivesEn.length >= 2);
    assert.ok(lesson.objectivesAr.length >= 2);
    assert.ok(lesson.contentEn.length >= 3);
    assert.ok(lesson.contentAr.length >= 3);
  });
});

test('public lesson projection omits implementation-only fields and flags review status', () => {
  const lesson = getLesson(1);
  assert.equal(lesson.order, 1);
  assert.equal(lesson.reviewStatus, 'draft-needs-subject-matter-review');
  assert.equal(Object.hasOwn(lesson, 'answerKey'), false);
  assert.equal(getLesson(0), null);
  assert.equal(getLesson(16), null);
});
