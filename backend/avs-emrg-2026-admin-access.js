'use strict';

function adminAccessView(record) {
  const x = typeof record?.toObject === 'function' ? record.toObject() : (record || {});
  return {
    id: String(x._id || ''),
    workshopCode: x.workshopCode || '',
    learnerName: x.learnerName || '',
    learnerEmail: x.learnerEmail || '',
    accessCreatedAt: x.accessCreatedAt || null,
    accessExpiresAt: x.accessExpiresAt || null,
    activeStudyHours: x.activeStudyHours ?? null,
    completedChecksCount: Array.isArray(x.completedChecks) ? x.completedChecks.length : 0,
    finalAttempts: Number(x.finalAttempts || 0),
    finalPassed: Boolean(x.finalPassed),
    certificateEligible: Boolean(x.certificateEligible),
    revoked: Boolean(x.revokedAt)
  };
}

function revokedAccessView(record) {
  const x = typeof record?.toObject === 'function' ? record.toObject() : (record || {});
  return {
    id: String(x._id || ''),
    learnerName: x.learnerName || '',
    learnerEmail: x.learnerEmail || '',
    revoked: Boolean(x.revokedAt)
  };
}

module.exports = { adminAccessView, revokedAccessView };
