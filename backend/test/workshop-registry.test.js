'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  RELEASE_GATE_KEYS,
  AVS_WORKSHOP,
  createWorkshopRegistry
} = require('../workshop-registry');

test('AVS workshop is registered but remains closed until release gates pass', () => {
  const registry = createWorkshopRegistry();
  assert.equal(registry.getByCode('AVS-EMRG-2026').slug, 'avs-emrg-2026');
  assert.equal(registry.getBySlug('AVS-EMRG-2026').code, 'AVS-EMRG-2026');
  assert.equal(registry.isReleaseReady('AVS-EMRG-2026'), false);
  assert.equal(registry.canOpenRegistration('AVS-EMRG-2026'), false);
});

test('registry supports adding another workshop without duplicating registry logic', () => {
  const futureWorkshop = {
    ...AVS_WORKSHOP,
    code: 'SI-SEC-2027',
    slug: 'si-sec-2027',
    title: { en: 'Security Operations Workshop', ar: 'ورشة العمليات الأمنية' },
    releaseGates: Object.fromEntries(RELEASE_GATE_KEYS.map(key => [key, false]))
  };
  const registry = createWorkshopRegistry([AVS_WORKSHOP, futureWorkshop]);
  assert.equal(registry.list().length, 2);
  assert.equal(registry.getByCode('si-sec-2027').code, 'SI-SEC-2027');
  assert.equal(registry.getBySlug('SI-SEC-2027').code, 'SI-SEC-2027');
});

test('duplicate workshop codes and slugs are rejected', () => {
  assert.throws(() => createWorkshopRegistry([AVS_WORKSHOP, AVS_WORKSHOP]), /Duplicate workshop code/);
  const duplicateSlug = { ...AVS_WORKSHOP, code: 'SI-OTHER-2027' };
  assert.throws(() => createWorkshopRegistry([AVS_WORKSHOP, duplicateSlug]), /Duplicate workshop slug/);
});

test('all release gates are required before registration can open', () => {
  const gates = Object.fromEntries(RELEASE_GATE_KEYS.map(key => [key, true]));
  const approved = { ...AVS_WORKSHOP, enabled: true, registrationOpen: true, releaseGates: gates };
  const registry = createWorkshopRegistry([approved]);
  assert.equal(registry.isReleaseReady('AVS-EMRG-2026'), true);
  assert.equal(registry.canOpenRegistration('AVS-EMRG-2026'), true);
  const oneGateMissing = { ...approved, releaseGates: { ...gates, certificateTested: false } };
  const blocked = createWorkshopRegistry([oneGateMissing]);
  assert.equal(blocked.isReleaseReady('AVS-EMRG-2026'), false);
  assert.equal(blocked.canOpenRegistration('AVS-EMRG-2026'), false);
});

test('invalid workshop metadata is rejected', () => {
  assert.throws(() => createWorkshopRegistry([{ ...AVS_WORKSHOP, durationHours: 0 }]), /durationHours/);
  assert.throws(() => createWorkshopRegistry([{ ...AVS_WORKSHOP, title: { en: '', ar: 'عنوان' } }]), /titles/);
});
