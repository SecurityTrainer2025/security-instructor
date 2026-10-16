'use strict';

const path = require('node:path');

const FRONTEND_DIR = path.resolve(__dirname, '..', 'frontend');
const STAGING_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'"
].join('; ');

// The preview UI is available only when the deployment explicitly enables AVS.
// In production, leaving AVS_WORKSHOP_ENABLED unset keeps these pages hidden.
function createStagingFrontendGate(isEnabled = () => process.env.AVS_WORKSHOP_ENABLED === 'true') {
  return (req, res, next) => {
    if (!isEnabled()) return res.status(404).json({ message: 'Not found' });
    res.setHeader('Content-Security-Policy', STAGING_CSP);
    return next();
  };
}

function register(app, { isEnabled } = {}) {
  const gate = createStagingFrontendGate(isEnabled);
  app.get('/staging/avs-emrg-2026.html', gate, (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'avs-emrg-2026.html'));
  });
  app.get('/staging/style.css', gate, (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'style.css'));
  });
  app.get('/staging/config.js', gate, (req, res) => {
    res.type('application/javascript').send('window.APP_CONFIG={API_BASE:window.location.origin};');
  });
}

module.exports = { createStagingFrontendGate, register };
