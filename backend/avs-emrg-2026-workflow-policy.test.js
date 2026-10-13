'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const policy = require('./avs-emrg-2026-workflow-policy');

const t0 = Date.UTC(2026, 0, 1);
const allChecks = Array.from({ length: 15 }, (_, i) => i + 1);

test('training duration, link expiry, and active-study duration remain separate', () => {
  const progress = policy.createInitialProgress({ accessCreatedAt: t0, activeStudyHours: null });
  assert.equal(policy.TRAINING_HOURS, 8);
  assert.equal(progress.accessExpiresAt, t0 + 120 * 60 * 60 * 1000);
  assert.equal(progress.activeStudyHours, null);
  assert.deepEqual(policy.assertAccessValid(progress, t0 + 119 * 60 * 60 * 1000), { valid: true, reason: null });
  assert.deepEqual(policy.assertAccessValid(progress, t0 + 120 * 60 * 60 * 1000), { valid: false, reason: 'access-expired' });
});

test('active-study expiry is independently enforced when configured', () => {
  const progress = policy.createInitialProgress({ accessCreatedAt: t0, activeStudyHours: 24 });
  progress.activeStudyStartedAt = t0 + 60 * 60 * 1000;
  assert.equal(policy.assertAccessValid(progress, t0 + 24 * 60 * 60 * 1000).valid, true);
  assert.deepEqual(policy.assertAccessValid(progress, t0 + 25 * 60 * 60 * 1000), {
    valid: false, reason: 'active-study-expired'
  });
});

test('learner cannot skip checks and must pass each check with 4 of 5', () => {
  const progress = policy.createInitialProgress({ accessCreatedAt: t0 });
  assert.deepEqual(policy.canOpenScreen(progress, 1, t0), { allowed: true, reason: null });
  assert.deepEqual(policy.canOpenScreen(progress, 2, t0), {
    allowed: false, reason: 'previous-check-not-passed'
  });
  const fail = policy.recordFormativeResult(progress, 1, { correct: 3, total: 5 }, t0);
  assert.equal(fail.passed, false);
  assert.deepEqual(fail.completedChecks, []);
  const pass = policy.recordFormativeResult(progress, 1, { correct: 4, total: 5 }, t0);
  assert.equal(pass.passed, true);
  progress.completedChecks = pass.completedChecks;
  assert.deepEqual(policy.canOpenScreen(progress, 2, t0), { allowed: true, reason: null });
  assert.throws(() => policy.recordFormativeResult(progress, 3, { correct: 5, total: 5 }, t0));
});

test('final assessment requires all 15 checks, strict >70%, and at most three attempts', () => {
  const progress = policy.createInitialProgress({ accessCreatedAt: t0 });
  assert.equal(policy.canStartFinal(progress, t0).reason, 'formative-checks-incomplete');
  progress.completedChecks = allChecks;
  assert.equal(policy.canStartFinal(progress, t0).allowed, true);
  const failed = policy.recordFinalResult(progress, { correct: 21, total: 30 }, t0);
  assert.deepEqual(failed, { finalAttempts: 1, finalPassed: false, certificateEligible: false });
  progress.finalAttempts = failed.finalAttempts;
  const passed = policy.recordFinalResult(progress, { correct: 22, total: 30 }, t0);
  assert.deepEqual(passed, { finalAttempts: 2, finalPassed: true, certificateEligible: true });
  progress.finalAttempts = 3;
  assert.equal(policy.canStartFinal(progress, t0).reason, 'attempt-limit-reached');
});

test('browser-supplied malformed scores are rejected', () => {
  const progress = policy.createInitialProgress({ accessCreatedAt: t0 });
  progress.completedChecks = allChecks;
  assert.throws(() => policy.recordFinalResult(progress, { correct: 99, total: 30 }, t0));
  assert.throws(() => policy.recordFormativeResult(progress, 1, { correct: 4, total: 4 }, t0));
});
