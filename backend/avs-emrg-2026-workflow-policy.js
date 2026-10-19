'use strict';

/**
 * AVS-EMRG-2026 workflow policy primitives.
 * Pure policy only: not a persistence layer or registered HTTP route.
 * Callers must load and save authoritative learner state server-side.
 */
const SCREEN_COUNT = 15;
const ACCESS_LINK_HOURS = 120;
const TRAINING_HOURS = 8;
const FINAL_ATTEMPT_LIMIT = 3;
const FINAL_PASS_MIN_CORRECT = 22;
const FORMATIVE_PASS_MIN_CORRECT = 4;
const FORMATIVE_QUESTIONS_PER_CHECK = 5;

function createInitialProgress({ accessCreatedAt, activeStudyHours = null } = {}) {
  const createdAt = accessCreatedAt instanceof Date ? accessCreatedAt.getTime() : Number(accessCreatedAt);
  if (!Number.isFinite(createdAt)) throw new TypeError('A valid accessCreatedAt timestamp is required.');
  if (activeStudyHours !== null &&
      (!Number.isFinite(activeStudyHours) || activeStudyHours <= 0)) {
    throw new TypeError('activeStudyHours must be a positive number or null.');
  }
  return {
    accessCreatedAt: createdAt,
    accessExpiresAt: createdAt + ACCESS_LINK_HOURS * 60 * 60 * 1000,
    activeStudyHours,
    activeStudyStartedAt: null,
    completedChecks: [],
    viewedLessons: [],
    finalAttempts: 0,
    finalPassed: false,
    certificateEligible: false
  };
}

function startActiveStudy(progress, now = Date.now()) {
  if (!progress || !Number.isFinite(progress.accessExpiresAt)) {
    throw new TypeError('Valid server-side access state is required.');
  }
  if (!Number.isFinite(now)) throw new TypeError('now must be a timestamp.');
  if (progress.activeStudyHours === null) return { activeStudyStartedAt: null, started: false };
  if (progress.activeStudyStartedAt !== null) {
    return { activeStudyStartedAt: progress.activeStudyStartedAt, started: false };
  }
  return { activeStudyStartedAt: now, started: true };
}

function assertAccessValid(progress, now = Date.now()) {
  if (!progress || !Number.isFinite(progress.accessExpiresAt)) {
    throw new TypeError('Valid server-side access state is required.');
  }
  if (!Number.isFinite(now)) throw new TypeError('now must be a timestamp.');
  if (now >= progress.accessExpiresAt) return { valid: false, reason: 'access-expired' };
  if (progress.activeStudyHours !== null) {
    if (!Number.isFinite(progress.activeStudyHours) || progress.activeStudyHours <= 0) {
      throw new TypeError('activeStudyHours must be a positive number or null.');
    }
    if (progress.activeStudyStartedAt !== null &&
        (!Number.isFinite(progress.activeStudyStartedAt) ||
         now >= progress.activeStudyStartedAt + progress.activeStudyHours * 60 * 60 * 1000)) {
      return { valid: false, reason: 'active-study-expired' };
    }
  }
  return { valid: true, reason: null };
}

function canOpenScreen(progress, screenNumber, now = Date.now()) {
  if (!Number.isInteger(screenNumber) || screenNumber < 1 || screenNumber > SCREEN_COUNT) {
    return { allowed: false, reason: 'invalid-screen' };
  }
  const access = assertAccessValid(progress, now);
  if (!access.valid) return { allowed: false, reason: access.reason };
  if (!Array.isArray(progress.completedChecks)) {
    throw new TypeError('Valid server-side formative progress is required.');
  }
  for (let required = 1; required < screenNumber; required += 1) {
    if (!progress.completedChecks.includes(required)) {
      return { allowed: false, reason: 'previous-check-not-passed' };
    }
  }
  return { allowed: true, reason: null };
}

function canStartFormative(progress, screenNumber, now = Date.now()) {
  const lessonGate = canOpenScreen(progress, screenNumber, now);
  if (!lessonGate.allowed) return lessonGate;
  if (!Array.isArray(progress.viewedLessons) || !progress.viewedLessons.includes(screenNumber)) {
    return { allowed: false, reason: 'lesson-content-not-viewed' };
  }
  return { allowed: true, reason: null };
}

function recordFormativeResult(progress, screenNumber, result, now = Date.now()) {
  if (!progress || !Array.isArray(progress.completedChecks)) throw new TypeError('Valid progress is required.');
  const gate = canOpenScreen(progress, screenNumber, now);
  if (!gate.allowed) throw new Error('Cannot record this check: ' + gate.reason);
  if (!result || result.total !== FORMATIVE_QUESTIONS_PER_CHECK ||
      !Number.isInteger(result.correct) || result.correct < 0 || result.correct > result.total) {
    throw new TypeError('A valid server-graded result for exactly five questions is required.');
  }
  if (result.correct < FORMATIVE_PASS_MIN_CORRECT) {
    return { passed: false, completedChecks: progress.completedChecks.slice() };
  }
  const completedChecks = [...new Set([...progress.completedChecks, screenNumber])].sort((a, b) => a - b);
  return { passed: true, completedChecks };
}

function canStartFinal(progress, now = Date.now()) {
  const access = assertAccessValid(progress, now);
  if (!access.valid) return { allowed: false, reason: access.reason };
  if (!Array.isArray(progress.completedChecks) ||
      progress.completedChecks.length !== SCREEN_COUNT ||
      Array.from({ length: SCREEN_COUNT }, (_, i) => i + 1).some(n => !progress.completedChecks.includes(n))) {
    return { allowed: false, reason: 'formative-checks-incomplete' };
  }
  if (progress.finalPassed) return { allowed: false, reason: 'already-passed' };
  if (!Number.isInteger(progress.finalAttempts) || progress.finalAttempts < 0) {
    throw new TypeError('finalAttempts must be a non-negative integer.');
  }
  if (progress.finalAttempts >= FINAL_ATTEMPT_LIMIT) {
    return { allowed: false, reason: 'attempt-limit-reached' };
  }
  return { allowed: true, reason: null };
}

function recordFinalResult(progress, result, now = Date.now()) {
  const gate = canStartFinal(progress, now);
  if (!gate.allowed) throw new Error('Cannot record final assessment: ' + gate.reason);
  if (!result || result.total !== 30 || !Number.isInteger(result.correct) ||
      result.correct < 0 || result.correct > 30) {
    throw new TypeError('A valid server-graded result for exactly 30 questions is required.');
  }
  const finalAttempts = progress.finalAttempts + 1;
  const finalPassed = result.correct >= FINAL_PASS_MIN_CORRECT;
  return {
    finalAttempts,
    finalPassed,
    certificateEligible: finalPassed && progress.completedChecks.length === SCREEN_COUNT
  };
}

module.exports = {
  SCREEN_COUNT,
  ACCESS_LINK_HOURS,
  TRAINING_HOURS,
  FINAL_ATTEMPT_LIMIT,
  FINAL_PASS_MIN_CORRECT,
  FORMATIVE_PASS_MIN_CORRECT,
  FORMATIVE_QUESTIONS_PER_CHECK,
  createInitialProgress,
  startActiveStudy,
  assertAccessValid,
  canOpenScreen,
  canStartFormative,
  recordFormativeResult,
  canStartFinal,
  recordFinalResult
};
