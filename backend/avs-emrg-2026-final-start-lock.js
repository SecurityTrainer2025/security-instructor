'use strict';

const FINAL_ATTEMPT_LOCK_STALE_MS = 2 * 60 * 1000;
const REQUIRED_CHECKS = Object.freeze(Array.from({ length: 15 }, (_, i) => i + 1));

function buildFinalStartLockFilter(accessId, now = new Date()) {
  if (!accessId) throw new TypeError('accessId is required.');
  const timestamp = now instanceof Date ? now.getTime() : Number(now);
  if (!Number.isFinite(timestamp)) throw new TypeError('A valid current time is required.');
  return {
    _id: accessId,
    finalPassed: false,
    finalAttempts: { $lt: 3 },
    completedChecks: { $all: [...REQUIRED_CHECKS], $size: 15 },
    accessExpiresAt: { $gt: new Date(timestamp) },
    revokedAt: null,
    $or: [
      { finalAttemptStartLockAt: null },
      { finalAttemptStartLockAt: { $lt: new Date(timestamp - FINAL_ATTEMPT_LOCK_STALE_MS) } }
    ]
  };
}

module.exports = { FINAL_ATTEMPT_LOCK_STALE_MS, REQUIRED_CHECKS, buildFinalStartLockFilter };
