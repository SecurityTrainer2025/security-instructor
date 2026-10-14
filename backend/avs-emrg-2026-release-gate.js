'use strict';

// Fail closed unless the deployment explicitly sets the exact value "true".
function isWorkshopEnabled(value = process.env.AVS_WORKSHOP_ENABLED) {
  return value === 'true';
}

// Shared middleware keeps the HTTP response policy testable without loading the database routes.
function createWorkshopReleaseGate(isEnabled = isWorkshopEnabled) {
  return (req, res, next) => {
    if (!isEnabled()) {
      return res.status(503).json({
        message: 'AVS workshop is not enabled. Release approval and testing are still pending.',
        reason: 'workshop-disabled'
      });
    }
    return next();
  };
}

module.exports = { isWorkshopEnabled, createWorkshopReleaseGate };
