'use strict';

/**
 * Registration stays closed unless both independent release switches are
 * explicitly enabled. Missing, misspelled, or differently-cased values fail closed.
 */
function isWorkshopRegistrationOpen(env = process.env) {
  return env.AVS_WORKSHOP_ENABLED === 'true' &&
    env.AVS_WORKSHOP_REGISTRATION_OPEN === 'true';
}

module.exports = { isWorkshopRegistrationOpen };
