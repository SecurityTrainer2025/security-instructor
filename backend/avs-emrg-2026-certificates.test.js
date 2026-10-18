'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { isCertificateEligible } = require('./avs-emrg-2026-certificate-policy');

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

test('AVS certificate IDs use a fixed, non-identifying format', () => {
  const { isCertificateId } = require('./avs-emrg-2026-certificate-policy');
  assert.equal(isCertificateId('SI-AVS-2026-012345ABCDEF'), true);
  assert.equal(isCertificateId('SI-AVS-2026-short'), false);
  assert.equal(isCertificateId('SI-AVS-2026-012345abcdef'), false);
});

test('AVS certificate verification URL preserves the issuing API environment', () => {
  const { buildVerificationUrl } = require('./avs-emrg-2026-certificates');
  const url = new URL(buildVerificationUrl('SI-AVS-2026-012345ABCDEF', 'https://security-instructor-staging.onrender.com/'));
  assert.equal(url.searchParams.get('certificateId'), 'SI-AVS-2026-012345ABCDEF');
  assert.equal(url.searchParams.get('apiBase'), 'https://security-instructor-staging.onrender.com');
});
