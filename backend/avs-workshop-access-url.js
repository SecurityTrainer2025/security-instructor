'use strict';

const DEFAULT_FRONTEND_URL = 'https://securitytrainer2025.github.io/security-instructor/frontend/avs-emrg-2026.html';

function buildWorkshopAccessUrl(token, configuredBaseUrl = process.env.AVS_WORKSHOP_FRONTEND_URL, workshopEnabled = process.env.AVS_WORKSHOP_ENABLED === 'true') {
  if (!configuredBaseUrl && workshopEnabled) {
    throw new Error('AVS_WORKSHOP_FRONTEND_URL is required while the AVS workshop is enabled.');
  }
  const base = String(configuredBaseUrl || DEFAULT_FRONTEND_URL).trim().replace(/\/$/, '');
  if (!/^https:\/\//i.test(base)) {
    throw new TypeError('AVS_WORKSHOP_FRONTEND_URL must be an https URL.');
  }
  const separator = base.includes('?') ? '&' : '?';
  return base + separator + 'token=' + encodeURIComponent(String(token));
}

module.exports = { DEFAULT_FRONTEND_URL, buildWorkshopAccessUrl };
