'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { DEFAULT_FRONTEND_URL, buildWorkshopAccessUrl } = require('./avs-workshop-access-url');

test('uses the existing production learner page as the safe default', () => {
  assert.equal(buildWorkshopAccessUrl('abc'), DEFAULT_FRONTEND_URL + '?token=abc');
});

test('uses a configured staging learner page without changing the production fallback', () => {
  assert.equal(
    buildWorkshopAccessUrl('staging-token', 'https://security-instructor-staging.onrender.com/staging/avs-emrg-2026.html'),
    'https://security-instructor-staging.onrender.com/staging/avs-emrg-2026.html?token=staging-token'
  );
});

test('URL-encodes access tokens and rejects non-HTTPS configured URLs', () => {
  assert.equal(buildWorkshopAccessUrl('a b&c', 'https://example.com/staging/workshop.html'), 'https://example.com/staging/workshop.html?token=a%20b%26c');
  assert.throws(() => buildWorkshopAccessUrl('token', 'http://example.com/workshop.html'), /must be an https URL/);
});
