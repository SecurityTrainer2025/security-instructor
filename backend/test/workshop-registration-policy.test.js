'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { isWorkshopRegistrationOpen } = require('../workshop-registration-policy');

test('registration is closed when release environment variables are missing', () => {
  assert.equal(isWorkshopRegistrationOpen({}), false);
});

test('registration remains closed unless both release switches are true', () => {
  assert.equal(isWorkshopRegistrationOpen({ AVS_WORKSHOP_ENABLED: 'true' }), false);
  assert.equal(isWorkshopRegistrationOpen({ AVS_WORKSHOP_REGISTRATION_OPEN: 'true' }), false);
  assert.equal(isWorkshopRegistrationOpen({ AVS_WORKSHOP_ENABLED: 'false', AVS_WORKSHOP_REGISTRATION_OPEN: 'true' }), false);
  assert.equal(isWorkshopRegistrationOpen({ AVS_WORKSHOP_ENABLED: 'true', AVS_WORKSHOP_REGISTRATION_OPEN: 'false' }), false);
});

test('registration opens only when both release switches are exactly true', () => {
  assert.equal(isWorkshopRegistrationOpen({ AVS_WORKSHOP_ENABLED: 'true', AVS_WORKSHOP_REGISTRATION_OPEN: 'true' }), true);
  assert.equal(isWorkshopRegistrationOpen({ AVS_WORKSHOP_ENABLED: 'TRUE', AVS_WORKSHOP_REGISTRATION_OPEN: 'true' }), false);
});
