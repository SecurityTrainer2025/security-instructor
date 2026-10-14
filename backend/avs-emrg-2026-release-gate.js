'use strict';

// Fail closed unless the deployment explicitly sets the exact value "true".
function isWorkshopEnabled(value = process.env.AVS_WORKSHOP_ENABLED) {
  return value === 'true';
}

module.exports = { isWorkshopEnabled };
