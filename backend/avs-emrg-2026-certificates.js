'use strict';

const crypto = require('node:crypto');
const mongoose = require('mongoose');
const QRCode = require('qrcode');

const certificateSchema = new mongoose.Schema({
  accessId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true },
  certificateId: { type: String, required: true, unique: true, index: true },
  workshopCode: { type: String, required: true, immutable: true, default: 'AVS-EMRG-2026' },
  learnerName: { type: String, trim: true, maxlength: 160, default: '' },
  workshopTitleEn: { type: String, required: true },
  workshopTitleAr: { type: String, required: true },
  durationHours: { type: Number, required: true, enum: [8] },
  score: { type: Number, required: true, min: 22, max: 30 },
  totalQuestions: { type: Number, required: true, enum: [30] },
  issuedAt: { type: Date, required: true, default: Date.now },
  status: { type: String, enum: ['valid', 'revoked'], default: 'valid', index: true },
  verificationUrl: { type: String, required: true }
}, { timestamps: true, strict: 'throw' });

const Certificate = mongoose.models.AvsEmrg2026Certificate ||
  mongoose.model('AvsEmrg2026Certificate', certificateSchema, 'avs_emrg_2026_certificates');

const { isCertificateEligible } = require('./avs-emrg-2026-certificate-policy');

function makeCertificateId() {
  return 'SI-AVS-2026-' + crypto.randomBytes(6).toString('hex').toUpperCase();
}

function buildVerificationUrl(certificateId, apiBase = process.env.AVS_WORKSHOP_API_BASE || process.env.RENDER_EXTERNAL_URL || 'https://security-instructor.onrender.com') {
  const configuredFrontend = process.env.AVS_WORKSHOP_FRONTEND_URL || '';
  let frontendUrl = 'https://securitytrainer2025.github.io/security-instructor/frontend/avs-emrg-2026-verify.html';
  try {
    const configured = new URL(configuredFrontend);
    if (configured.protocol === 'https:' && configured.hostname === 'security-instructor-staging.onrender.com') {
      frontendUrl = new URL('/staging/avs-emrg-2026-verify.html', configured.origin).toString();
    }
  } catch (_) {}
  const url = new URL(frontendUrl);
  url.searchParams.set('certificateId', certificateId);
  url.searchParams.set('apiBase', String(apiBase).replace(/\/$/, ''));
  return url.toString();
}

async function ensureCertificate(access, score) {
  if (!isCertificateEligible(access)) throw new Error('Certificate eligibility requirements are not met.');
  if (!Number.isInteger(score) || score < 22 || score > 30) throw new Error('A passing final assessment score is required.');
  const certificateId = makeCertificateId();
  const verificationUrl = buildVerificationUrl(certificateId);
  try {
    return await Certificate.findOneAndUpdate(
      { accessId: access._id },
      { $setOnInsert: {
        accessId: access._id, certificateId, workshopCode: 'AVS-EMRG-2026',
        learnerName: access.learnerName || '',
        workshopTitleEn: 'Safety, Emergency & Evacuation in Civil Airports',
        workshopTitleAr: 'إدارة السلامة والطوارئ والإخلاء في المطارات المدنية',
        durationHours: 8, score, totalQuestions: 30, issuedAt: new Date(),
        status: 'valid', verificationUrl
      } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    // Concurrent retries can race on the unique accessId index. Recover the
    // already-created certificate instead of making a successful pass look failed.
    if (error?.code === 11000) {
      const existing = await Certificate.findOne({ accessId: access._id });
      if (existing) return existing;
    }
    throw error;
  }
}

function publicCertificate(record) {
  if (!record) return null;
  return {
    certificateId: record.certificateId,
    workshopCode: record.workshopCode,
    learnerName: record.learnerName,
    workshopTitleEn: record.workshopTitleEn,
    workshopTitleAr: record.workshopTitleAr,
    durationHours: record.durationHours,
    score: record.score,
    totalQuestions: record.totalQuestions,
    issuedAt: record.issuedAt,
    status: record.status,
    verificationUrl: record.verificationUrl
  };
}

async function certificatePayload(record) {
  const safe = publicCertificate(record);
  if (!safe) return null;
  // Rebuild the verification URL for the currently deployed environment so older
  // certificate records do not keep pointing at a missing GitHub Pages file.
  safe.verificationUrl = buildVerificationUrl(record.certificateId);
  safe.qrDataUrl = await QRCode.toDataURL(safe.verificationUrl, {
    errorCorrectionLevel: 'M', margin: 1, width: 240,
    color: { dark: '#0B1F33', light: '#FFFFFF' }
  });
  return safe;
}

module.exports = { Certificate, isCertificateEligible, ensureCertificate, publicCertificate, certificatePayload, buildVerificationUrl };
