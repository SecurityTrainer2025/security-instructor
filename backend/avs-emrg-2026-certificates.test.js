'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { isCertificateEligible } = require('./avs-emrg-2026-certificates');

const completeChecks = Array.from({ length: 15 }, (_, i) => i + 1);

test('AVS certificate eligibility requires a passed final and all 15 checks', () => {
  assert.equal(isCertificateEligible({ certificateEligible: true, finalPassed: true, completedChecks: completeChecks, revokedAt: null }), true);
  assert.equal(isCertificateEligible({ certificateEligible: true, finalPassed: true, completedChecks: completeChecks.slice(0, 14), revokedAt: null }), false);
  assert.equal(isCertificateEligible({ certificateEligible: true, finalPassed: false, completedChecks: completeChecks, revokedAt: null }), false);
  assert.equal(isCertificateEligible({ certificateEligible: false, finalPassed: true, completedChecks: completeChecks, revokedAt: null }), false);
});

test('AVS certificate eligibility rejects revoked access and duplicate/missing check states', () => {
  assert.equal(isCertificateEligible({ certificateEligible: true, finalPassed: true, completedChecks: completeChecks, revokedAt: new Date() }), false);
  assert.equal(isCertificateEligible({ certificateEligible: true, finalPassed: true, completedChecks: [...completeChecks, 15], revokedAt: null }), false);
  assert.equal(isCertificateEligible(null), false);
  assert.equal(isCertificateEligible({ certificateEligible: true, finalPassed: true, completedChecks: [1, 2], revokedAt: null }), false);
});
