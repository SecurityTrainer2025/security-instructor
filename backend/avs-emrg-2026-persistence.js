'use strict';

/**
 * AVS-EMRG-2026 persistence primitives.
 *
 * This module is deliberately not registered in the running API yet. It defines
 * isolated MongoDB records and server-only helpers for the dedicated workshop
 * route integration. Never store raw access tokens or send answer keys to clients.
 */
const crypto = require('node:crypto');
const mongoose = require('mongoose');

const WORKSHOP_CODE = 'AVS-EMRG-2026';
const TOKEN_BYTES = 32;

const accessSchema = new mongoose.Schema({
  workshopCode: { type: String, required: true, immutable: true, index: true, default: WORKSHOP_CODE },
  learnerName: { type: String, trim: true, maxlength: 160, default: '' },
  learnerEmail: { type: String, required: true, trim: true, lowercase: true, maxlength: 180, index: true },
  tokenHash: { type: String, required: true, unique: true, select: false },
  accessCreatedAt: { type: Date, required: true, default: Date.now },
  accessExpiresAt: { type: Date, required: true, index: true },
  activeStudyHours: { type: Number, default: null, min: 0.01 },
  activeStudyStartedAt: { type: Date, default: null },
  completedChecks: { type: [Number], default: [] },
  finalAttempts: { type: Number, default: 0, min: 0, max: 3 },
  finalPassed: { type: Boolean, default: false },
  certificateEligible: { type: Boolean, default: false },
  diagnosticCompletedAt: { type: Date, default: null },
  feedbackSubmittedAt: { type: Date, default: null },
  revokedAt: { type: Date, default: null }
}, { timestamps: true, strict: 'throw' });
accessSchema.index({ learnerEmail: 1, workshopCode: 1, accessCreatedAt: -1 });

const attemptSchema = new mongoose.Schema({
  workshopCode: { type: String, required: true, immutable: true, default: WORKSHOP_CODE, index: true },
  accessId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  attemptId: { type: String, required: true, unique: true },
  kind: { type: String, required: true, enum: ['formative', 'final'] },
  screenNumber: { type: Number, min: 1, max: 15, default: null },
  attemptNumber: { type: Number, required: true, min: 1, max: 20 },
  questionOrder: { type: [String], required: true },
  optionOrderByQuestionId: { type: mongoose.Schema.Types.Mixed, required: true, select: false },
  status: { type: String, enum: ['in-progress', 'submitted', 'expired'], default: 'in-progress', index: true },
  answers: { type: mongoose.Schema.Types.Mixed, default: {}, select: false },
  correctCount: { type: Number, min: 0, default: null },
  questionCount: { type: Number, required: true },
  passed: { type: Boolean, default: null },
  startedAt: { type: Date, required: true, default: Date.now },
  submittedAt: { type: Date, default: null }
}, { timestamps: true, strict: 'throw' });
attemptSchema.index({ accessId: 1, kind: 1, screenNumber: 1, attemptNumber: 1 }, { unique: true });

const Access = mongoose.models.AvsEmrg2026Access ||
  mongoose.model('AvsEmrg2026Access', accessSchema, 'avs_emrg_2026_access');
const Attempt = mongoose.models.AvsEmrg2026Attempt ||
  mongoose.model('AvsEmrg2026Attempt', attemptSchema, 'avs_emrg_2026_attempts');

function createAccessToken() {
  return crypto.randomBytes(TOKEN_BYTES).toString('base64url');
}
function hashAccessToken(token) {
  if (typeof token !== 'string' || token.length < 40 || token.length > 200) {
    throw new TypeError('A valid access token is required.');
  }
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}
function accessExpiry(createdAt = new Date()) {
  const value = createdAt instanceof Date ? createdAt.getTime() : Number(createdAt);
  if (!Number.isFinite(value)) throw new TypeError('A valid creation timestamp is required.');
  return new Date(value + 120 * 60 * 60 * 1000);
}
function safeAccessView(record) {
  if (!record) return null;
  const x = typeof record.toObject === 'function' ? record.toObject() : record;
  return {
    workshopCode: x.workshopCode,
    learnerName: x.learnerName || '',
    accessCreatedAt: x.accessCreatedAt,
    accessExpiresAt: x.accessExpiresAt,
    activeStudyHours: x.activeStudyHours ?? null,
    activeStudyStartedAt: x.activeStudyStartedAt || null,
    completedChecks: Array.isArray(x.completedChecks) ? x.completedChecks.slice() : [],
    finalAttempts: x.finalAttempts,
    finalPassed: x.finalPassed,
    certificateEligible: x.certificateEligible,
    revoked: Boolean(x.revokedAt)
  };
}

module.exports = {
  WORKSHOP_CODE,
  Access,
  Attempt,
  createAccessToken,
  hashAccessToken,
  accessExpiry,
  safeAccessView
};
