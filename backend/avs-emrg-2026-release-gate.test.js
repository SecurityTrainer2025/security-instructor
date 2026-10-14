'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { isWorkshopEnabled, createWorkshopReleaseGate } = require('./avs-emrg-2026-release-gate');

test('AVS release gate is closed by default and fails closed for non-exact values', () => {
  assert.equal(isWorkshopEnabled(undefined), false);
  assert.equal(isWorkshopEnabled(''), false);
  assert.equal(isWorkshopEnabled('false'), false);
  assert.equal(isWorkshopEnabled('TRUE'), false);
  assert.equal(isWorkshopEnabled('1'), false);
  assert.equal(isWorkshopEnabled('true'), true);
});

function responseRecorder() {
  return {
    statusCode: null,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; }
  };
}

test('HTTP release middleware returns 503 and workshop-disabled when the gate is closed', () => {
  const gate = createWorkshopReleaseGate(() => false);
  const res = responseRecorder();
  let nextCalled = false;
  gate({}, res, () => { nextCalled = true; });
  assert.equal(res.statusCode, 503);
  assert.deepEqual(res.payload, {
    message: 'AVS workshop is not enabled. Release approval and testing are still pending.',
    reason: 'workshop-disabled'
  });
  assert.equal(nextCalled, false);
});

test('HTTP release middleware passes requests only when explicitly enabled', () => {
  const gate = createWorkshopReleaseGate(() => true);
  const res = responseRecorder();
  let nextCalled = false;
  gate({}, res, () => { nextCalled = true; });
  assert.equal(res.statusCode, null);
  assert.equal(res.payload, null);
  assert.equal(nextCalled, true);
});
