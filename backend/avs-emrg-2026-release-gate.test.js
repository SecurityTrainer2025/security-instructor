'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { isWorkshopEnabled } = require('./avs-emrg-2026-release-gate');

test('AVS release gate is closed by default and fails closed for non-exact values', () => {
  assert.equal(isWorkshopEnabled(undefined), false);
  assert.equal(isWorkshopEnabled(''), false);
  assert.equal(isWorkshopEnabled('false'), false);
  assert.equal(isWorkshopEnabled('TRUE'), false);
  assert.equal(isWorkshopEnabled('1'), false);
  assert.equal(isWorkshopEnabled('true'), true);
});
