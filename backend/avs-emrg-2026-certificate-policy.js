'use strict';

function isCertificateEligible(access) {
  return Boolean(access && access.certificateEligible === true && access.finalPassed === true &&
    Array.isArray(access.completedChecks) && access.completedChecks.length === 15 &&
    Array.from({ length: 15 }, (_, i) => i + 1).every(n => access.completedChecks.includes(n)) &&
    !access.revokedAt);
}

function isCertificateId(value) {
  return typeof value === 'string' && /^SI-AVS-2026-[A-F0-9]{12}$/.test(value);
}

module.exports = { isCertificateEligible, isCertificateId };
