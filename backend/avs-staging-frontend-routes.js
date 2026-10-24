'use strict';

const path = require('node:path');
const fs = require('node:fs');

const FRONTEND_DIR = __dirname;
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
  // Serve the existing SI admin UI and its relative assets on the staging host only.
  // This lets the admin page call the same-origin staging API without publishing it to GitHub Pages.
  app.use('/staging/frontend', gate, require('express').static(path.join(FRONTEND_DIR, '..', 'frontend'), { index: false }));
  app.get('/staging/avs-emrg-2026.html', gate, (req, res) => {
    const file = path.join(FRONTEND_DIR, '..', 'frontend', 'avs-emrg-2026.html');
    const html = fs.readFileSync(file, 'utf8')
      .replace('href="style.css"', 'href="/staging/avs-workshop-style.css"');
    res.type('html').send(html);
  });
  app.get('/staging/avs-emrg-2026-verify.html', gate, (req, res) => {
    const file = path.join(FRONTEND_DIR, '..', 'frontend', 'avs-emrg-2026-verify.html');
    res.sendFile(file);
  });
  // Serve the existing SI course-registration form in staging so the AVS workshop
  // registration can be exercised without publishing the branch to GitHub Pages.
  app.get('/staging/course-registration.html', gate, (req, res) => {
    const file = path.join(FRONTEND_DIR, '..', 'frontend', 'course-registration.html');
    const html = fs.readFileSync(file, 'utf8')
      .replace('href="style.css"', 'href="/staging/registration-style.css"')
      .replace('href="bilingual.css"', 'href="/staging/registration-bilingual.css"');
    res.type('html').send(html);
  });
  app.get('/staging/registration-style.css', gate, (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, '..', 'frontend', 'style.css'));
  });
  app.get('/staging/registration-bilingual.css', gate, (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, '..', 'frontend', 'bilingual.css'));
  });
  app.get('/staging/style.css', gate, (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'avs-staging-preview.css'));
  });
  app.get('/staging/avs-workshop-style.css', gate, (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, '..', 'frontend', 'style.css'));
  });
  app.get('/staging/config.js', gate, (req, res) => {
    res.type('application/javascript').send('window.APP_CONFIG={API_BASE:window.location.origin};window.AVS_WORKSHOP_API_BASE=window.location.origin;');
  });
}

module.exports = { createStagingFrontendGate, register };
