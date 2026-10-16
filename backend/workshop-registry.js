'use strict';

/**
 * Shared registry for SI workshops.
 *
 * This registry is metadata only: it does not open registration, grant learner
 * access, or issue certificates. A workshop must pass every release gate before
 * an operator can enable it. Add future workshops as new definitions rather
 * than copying the AVS workflow.
 */

const RELEASE_GATE_KEYS = Object.freeze([
  'contentReviewed',
  'assessmentsValidated',
  'registrationTested',
  'invitationEmailTested',
  'learnerProgressTested',
  'certificateTested',
  'qrVerificationTested',
  'adminWorkflowTested'
]);

const AVS_WORKSHOP = Object.freeze({
  code: 'AVS-EMRG-2026',
  slug: 'avs-emrg-2026',
  type: 'workshop',
  title: Object.freeze({
    en: 'Safety, Emergency & Evacuation in Civil Airports',
    ar: 'إدارة السلامة والطوارئ والإخلاء في المطارات المدنية'
  }),
  languages: Object.freeze(['en', 'ar']),
  durationHours: 8,
  status: 'setup-in-progress',
  registrationOpen: false,
  enabled: false,
  releaseGates: Object.freeze({
    contentReviewed: false,
    assessmentsValidated: false,
    registrationTested: false,
    invitationEmailTested: false,
    learnerProgressTested: false,
    certificateTested: false,
    qrVerificationTested: false,
    adminWorkflowTested: false
  })
});

function validateDefinition(definition) {
  if (!definition || typeof definition !== 'object') {
    throw new TypeError('Workshop definition must be an object.');
  }
  if (typeof definition.code !== 'string' || !/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(definition.code)) {
    throw new TypeError('Workshop code must use uppercase letters, numbers, and hyphens.');
  }
  if (typeof definition.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(definition.slug)) {
    throw new TypeError('Workshop slug must use lowercase letters, numbers, and hyphens.');
  }
  if (!definition.title || !['en', 'ar'].every(language =>
    typeof definition.title[language] === 'string' && definition.title[language].trim())) {
    throw new TypeError('Workshop must have English and Arabic titles.');
  }
  if (!['workshop', 'course'].includes(definition.type)) {
    throw new TypeError('Workshop type must be workshop or course.');
  }
  if (!Number.isFinite(definition.durationHours) || definition.durationHours <= 0) {
    throw new TypeError('Workshop durationHours must be a positive number.');
  }
  if (!Array.isArray(definition.languages) || !definition.languages.length ||
      definition.languages.some(language => !['en', 'ar'].includes(language))) {
    throw new TypeError('Workshop languages must contain en and/or ar.');
  }
  if (typeof definition.releaseGates !== 'object' || definition.releaseGates === null) {
    throw new TypeError('Workshop releaseGates must be an object.');
  }
  for (const key of RELEASE_GATE_KEYS) {
    if (typeof definition.releaseGates[key] !== 'boolean') {
      throw new TypeError('Missing boolean release gate: ' + key);
    }
  }
  return true;
}

function createWorkshopRegistry(definitions = [AVS_WORKSHOP]) {
  if (!Array.isArray(definitions)) throw new TypeError('Workshop definitions must be an array.');
  const byCode = new Map();
  const bySlug = new Map();
  for (const input of definitions) {
    validateDefinition(input);
    if (byCode.has(input.code)) throw new Error('Duplicate workshop code: ' + input.code);
    if (bySlug.has(input.slug)) throw new Error('Duplicate workshop slug: ' + input.slug);
    const definition = Object.freeze({
      ...input,
      title: Object.freeze({ ...input.title }),
      languages: Object.freeze([...input.languages]),
      releaseGates: Object.freeze({ ...input.releaseGates })
    });
    byCode.set(definition.code, definition);
    bySlug.set(definition.slug, definition);
  }
  return Object.freeze({
    list: () => [...byCode.values()],
    getByCode: code => byCode.get(String(code || '').trim().toUpperCase()) || null,
    getBySlug: slug => bySlug.get(String(slug || '').trim().toLowerCase()) || null,
    isReleaseReady: code => {
      const item = byCode.get(String(code || '').trim().toUpperCase());
      return !!item && RELEASE_GATE_KEYS.every(key => item.releaseGates[key] === true);
    },
    canOpenRegistration: code => {
      const item = byCode.get(String(code || '').trim().toUpperCase());
      return !!item && item.enabled === true && item.registrationOpen === true &&
        RELEASE_GATE_KEYS.every(key => item.releaseGates[key] === true);
    }
  });
}

const registry = createWorkshopRegistry();

module.exports = {
  RELEASE_GATE_KEYS,
  AVS_WORKSHOP,
  validateDefinition,
  createWorkshopRegistry,
  registry
};
