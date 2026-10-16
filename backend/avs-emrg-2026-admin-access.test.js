'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { adminAccessView, revokedAccessView } = require('./avs-emrg-2026-admin-access');

test('admin invitation view exposes operational status but never token material', () => {
  const view = adminAccessView({
    _id: 'abc123',
    workshopCode: 'AVS-EMRG-2026',
    learnerName: 'Test Learner',
    learnerEmail: 'test@example.com',
    accessCreatedAt: new Date('2026-10-16T00:00:00Z'),
    accessExpiresAt: new Date('2026-10-21T00:00:00Z'),
    activeStudyHours: null,
    completedChecks: [1, 2],
    finalAttempts: 1,
    finalPassed: false,
    certificateEligible: false,
    revokedAt: null,
    token: 'MUST_NOT_LEAK',
    tokenHash: 'MUST_NOT_LEAK',
    sessionTokenHash: 'MUST_NOT_LEAK'
  });
  assert.equal(view.id, 'abc123');
  assert.equal(view.learnerEmail, 'test@example.com');
  assert.equal(view.completedChecksCount, 2);
  assert.equal(view.revoked, false);
  assert.doesNotMatch(JSON.stringify(view), /MUST_NOT_LEAK|tokenHash|sessionTokenHash/);
});

test('revocation response is minimal and does not expose token material', () => {
  const view = revokedAccessView({
    _id: 'abc123',
    learnerName: 'Test Learner',
    learnerEmail: 'test@example.com',
    revokedAt: new Date(),
    tokenHash: 'MUST_NOT_LEAK',
    sessionTokenHash: 'MUST_NOT_LEAK'
  });
  assert.equal(view.revoked, true);
  assert.equal(view.id, 'abc123');
  assert.doesNotMatch(JSON.stringify(view), /MUST_NOT_LEAK|tokenHash|sessionTokenHash/);
});
