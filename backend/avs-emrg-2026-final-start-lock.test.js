'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { FINAL_ATTEMPT_LOCK_STALE_MS, REQUIRED_CHECKS, buildFinalStartLockFilter } = require('./avs-emrg-2026-final-start-lock');

test('final-start lock can only be acquired for eligible, unexpired access with all 15 checks', () => {
  const now = new Date('2026-10-15T10:00:00.000Z');
  const filter = buildFinalStartLockFilter('access-1', now);
  assert.equal(filter._id, 'access-1');
  assert.equal(filter.finalPassed, false);
  assert.deepEqual(filter.finalAttempts, { $lt: 3 });
  assert.deepEqual(filter.completedChecks, { $all: Array.from({ length: 15 }, (_, i) => i + 1), $size: 15 });
  assert.equal(filter.accessExpiresAt.$gt.toISOString(), now.toISOString());
  assert.equal(filter.revokedAt, null);
});

test('final-start lock accepts only an empty or stale lock timestamp', () => {
  const now = new Date('2026-10-15T10:00:00.000Z');
  const filter = buildFinalStartLockFilter('access-1', now);
  assert.deepEqual(filter.$or[0], { finalAttemptStartLockAt: null });
  assert.equal(filter.$or[1].finalAttemptStartLockAt.$lt.getTime(), now.getTime() - FINAL_ATTEMPT_LOCK_STALE_MS);
});

test('lock filter requires a valid access ID and time', () => {
  assert.throws(() => buildFinalStartLockFilter(null), /accessId is required/);
  assert.throws(() => buildFinalStartLockFilter('access-1', 'not-a-time'), /valid current time/);
  assert.equal(REQUIRED_CHECKS.length, 15);
});
