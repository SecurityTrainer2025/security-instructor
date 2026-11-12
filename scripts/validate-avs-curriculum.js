#!/usr/bin/env node
'use strict';

// Standalone content-integrity checks for AVS-EMRG-2026.
// Run from the repository root: node scripts/validate-avs-curriculum.js
const fs = require('node:fs');
const path = require('node:path');
const file = path.join(__dirname, '..', 'docs', 'courses', 'AVS-EMRG-2026-curriculum.json');
const curriculum = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };

check(curriculum.course?.code === 'AVS-EMRG-2026', 'Unexpected course code.');
check(curriculum.course?.slug === 'civil-airport-safety-emergency-evacuation', 'Unexpected course slug.');
check(Array.isArray(curriculum.screens) && curriculum.screens.length === 15, 'Expected exactly 15 course screens.');
check(Array.isArray(curriculum.finalAssessment?.questions) && curriculum.finalAssessment.questions.length === 20, 'Expected exactly 20 final-assessment questions.');
check(curriculum.finalAssessment?.passPercent === 70, 'Expected proposed 70% pass threshold.');
check(curriculum.finalAssessment?.maxAttempts === 3, 'Expected proposed maximum of 3 attempts.');

const ids = new Set();
for (const [index, screen] of (curriculum.screens || []).entries()) {
  check(typeof screen.id === 'string' && screen.id.length > 0, `Screen ${index + 1}: missing ID.`);
  check(!ids.has(screen.id), `Screen ${index + 1}: duplicate ID ${screen.id}.`);
  ids.add(screen.id);
  check(typeof screen.title?.en === 'string' && screen.title.en.trim(), `Screen ${screen.id}: missing English title.`);
  check(typeof screen.title?.ar === 'string' && screen.title.ar.trim(), `Screen ${screen.id}: missing Arabic title.`);
  if (screen.check) {
    check(typeof screen.check.q?.en === 'string' && screen.check.q.en.trim(), `Screen ${screen.id}: missing English check question.`);
    check(typeof screen.check.q?.ar === 'string' && screen.check.q.ar.trim(), `Screen ${screen.id}: missing Arabic check question.`);
    check(Array.isArray(screen.check.options) && screen.check.options.length >= 2, `Screen ${screen.id}: expected at least two answer options.`);
    check(Number.isInteger(screen.check.correctIndex) && screen.check.correctIndex >= 0 && screen.check.correctIndex < (screen.check.options || []).length, `Screen ${screen.id}: invalid correctIndex.`);
  }
}
const answerPositions = [0, 0, 0, 0];
const questionIds = new Set();
for (const [index, question] of (curriculum.finalAssessment?.questions || []).entries()) {
  check(typeof question.id === 'string' && question.id.trim(), `Final question ${index + 1}: missing ID.`);
  check(!questionIds.has(question.id), `Final question ${index + 1}: duplicate ID ${question.id}.`);
  questionIds.add(question.id);
  check(typeof question.q?.en === 'string' && question.q.en.trim(), `Final question ${index + 1}: missing English prompt.`);
  check(typeof question.q?.ar === 'string' && question.q.ar.trim(), `Final question ${index + 1}: missing Arabic prompt.`);
  check(Array.isArray(question.options) && question.options.length === 4, `Final question ${index + 1}: expected exactly four options.`);
  check(Number.isInteger(question.correctIndex) && question.correctIndex >= 0 && question.correctIndex < (question.options || []).length, `Final question ${index + 1}: invalid correctIndex.`);
  if (Number.isInteger(question.correctIndex) && question.correctIndex >= 0 && question.correctIndex < 4) answerPositions[question.correctIndex]++;
  const optionTexts = (question.options || []).map(option => `${option.en}| ${option.ar}`);
  check(new Set(optionTexts).size === optionTexts.length, `Final question ${index + 1}: duplicate options.`);
  for (const [optionIndex, option] of (question.options || []).entries()) {
    check(typeof option.en === 'string' && option.en.trim(), `Final question ${index + 1}, option ${optionIndex + 1}: missing English text.`);
    check(typeof option.ar === 'string' && option.ar.trim(), `Final question ${index + 1}, option ${optionIndex + 1}: missing Arabic text.`);
  }
}
check(answerPositions.every(count => count > 0), 'Correct answers should not all use the same option position.');

if (errors.length) {
  console.error('AVS curriculum validation FAILED:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('AVS curriculum validation PASSED.');
  console.log(`Screens: ${curriculum.screens.length}; final questions: ${curriculum.finalAssessment.questions.length}; correct-answer position counts: ${answerPositions.join(', ')}.`);
  console.log('Note: content integrity is not a substitute for subject-matter review or server-side assessment security.');
}
