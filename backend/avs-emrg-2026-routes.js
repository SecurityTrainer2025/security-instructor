'use strict';

/**
 * Dedicated AVS-EMRG-2026 assessment API.
 * Registered on the API, but workshop access must remain disabled until release gates pass.
 * Uses isolated Mongo collections and never serializes answer keys to learners.
 */
const crypto = require('node:crypto');
const { Access, Attempt, createAccessToken, hashAccessToken, accessExpiry, safeAccessView } = require('./avs-emrg-2026-persistence');
const policy = require('./avs-emrg-2026-workflow-policy');
const engine = require('./avs-emrg-2026-assessment');
const { WORKSHOP } = require('./avs-emrg-2026-manifest');
const { QUESTIONS: FINAL_BANK } = require('./avs-emrg-2026-final-question-bank');
const { getFormativeCheck, validateFormativeBank, createFormativeSnapshot, buildPublicFormativeCheck, gradeFormativeCheck } = require('./avs-emrg-2026-formative-question-bank');
const { INITIAL_ASSESSMENT, validateInitialAssessment, createInitialAssessmentSnapshot, buildPublicInitialAssessment, gradeInitialAssessment } = require('./avs-emrg-2026-initial-assessment');
const mongoose = require('mongoose');
const DiagnosticFeedback = mongoose.models.AvsEmrg2026Feedback || mongoose.model('AvsEmrg2026Feedback', new mongoose.Schema({ accessId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true }, answers: { type: mongoose.Schema.Types.Mixed, required: true }, submittedAt: { type: Date, default: Date.now } }, { timestamps: true, strict: 'throw' }), 'avs_emrg_2026_feedback');
const { FEEDBACK_SURVEY, validateFeedbackSurvey } = require('./avs-emrg-2026-feedback-survey');

const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const fail = (res, status, message, reason) => res.status(status).json({ message, ...(reason ? { reason } : {}) });

function getToken(req) {
  const auth = String(req.headers.authorization || '');
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return '';
}
async function loadAccess(req) {
  const token = getToken(req);
  if (!token) return null;
  const record = await Access.findOne({ tokenHash: hashAccessToken(token), workshopCode: WORKSHOP.code }).select('+tokenHash');
  if (!record || record.revokedAt || record.accessExpiresAt.getTime() <= Date.now()) return null;
  const state = policyState(record);
  if (!policy.assertAccessValid(state).valid) return null;
  return record;
}
function policyState(record) {
  return {
    accessExpiresAt: record.accessExpiresAt.getTime(),
    activeStudyHours: record.activeStudyHours ?? null,
    activeStudyStartedAt: record.activeStudyStartedAt ? record.activeStudyStartedAt.getTime() : null,
    completedChecks: record.completedChecks || [],
    finalAttempts: record.finalAttempts || 0,
    finalPassed: !!record.finalPassed,
    certificateEligible: !!record.certificateEligible
  };
}
function accessTokenGuard() {
  return async (req, res, next) => {
    try {
      const record = await loadAccess(req);
      if (!record) return fail(res, 401, 'A valid workshop access link is required.');
      req.avsAccess = record;
      next();
    } catch (error) {
      console.error('AVS access validation failed', error);
      return fail(res, 500, 'Unable to validate workshop access.');
    }
  };
}
function quizQuestions(kind, screenNumber) {
  if (kind === 'final') return FINAL_BANK;
  return getFormativeCheck(screenNumber);
}
function makeSnapshot(kind, screenNumber, attemptNumber) {
  if (kind === 'final') {
    return engine.createAttemptSnapshot(FINAL_BANK, { expectedCount: 30, attemptNumber });
  }
  return createFormativeSnapshot(screenNumber, attemptNumber);
}
function publicQuiz(kind, screenNumber, snapshot) {
  if (kind === 'final') return engine.buildPublicQuiz(FINAL_BANK, snapshot);
  return buildPublicFormativeCheck(screenNumber, snapshot);
}
function gradeQuiz(kind, screenNumber, snapshot, answers) {
  if (kind === 'final') return engine.gradeAttempt(FINAL_BANK, snapshot, answers, { passCorrect: 22 });
  return gradeFormativeCheck(screenNumber, snapshot, answers);
}
function serialiseSnapshot(snapshot) {
  return {
    attemptId: snapshot.attemptId,
    attemptNumber: snapshot.attemptNumber,
    questionOrder: snapshot.questionOrder,
    optionOrderByQuestionId: snapshot.optionOrderByQuestionId
  };
}

function register(app, { requireAdmin } = {}) {
  if (typeof requireAdmin !== 'function') throw new TypeError('AVS route registration requires admin authentication middleware.');
  const guard = accessTokenGuard();

  app.post('/api/admin/avs-emrg-2026/access', requireAdmin, async (req, res) => {
    try {
      const learnerName = clean(req.body?.learnerName, 160);
      const learnerEmail = clean(req.body?.learnerEmail, 180).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(learnerEmail)) return fail(res, 400, 'A valid learner email is required.');
      const token = createAccessToken();
      const now = new Date();
      const activeStudyHours = req.body?.activeStudyHours === undefined || req.body?.activeStudyHours === null || req.body?.activeStudyHours === ''
        ? null : Number(req.body.activeStudyHours);
      if (activeStudyHours !== null && (!Number.isFinite(activeStudyHours) || activeStudyHours <= 0 || activeStudyHours > 120)) {
        return fail(res, 400, 'Active-study hours must be a positive number no greater than 120, or null.');
      }
      const record = await Access.create({
        workshopCode: WORKSHOP.code, learnerName, learnerEmail,
        tokenHash: hashAccessToken(token), accessCreatedAt: now, accessExpiresAt: accessExpiry(now),
        activeStudyHours, activeStudyStartedAt: null
      });
      // Return the raw token only once to the authenticated admin. Email delivery is a separate release gate.
      return res.status(201).json({
        ok: true, access: safeAccessView(record), accessToken: token,
        note: 'Store/send this token securely. It cannot be retrieved again from the database.'
      });
    } catch (error) {
      console.error('AVS access creation failed', error);
      return fail(res, 500, 'Unable to create workshop access.');
    }
  });

  app.get('/api/avs-emrg-2026/session', guard, async (req, res) => {
    const record = req.avsAccess;
    const state = policyState(record);
    const valid = policy.assertAccessValid(state);
    if (!valid.valid) return fail(res, 410, 'Workshop access has expired.', valid.reason);
    return res.json({
      ok: true, workshop: { code: WORKSHOP.code, title: WORKSHOP.title, durations: WORKSHOP.durations },
      access: safeAccessView(record),
      screens: WORKSHOP.screens.map(({ id, order, titleEn, titleAr, sourceSlide }) => ({ id, order, titleEn, titleAr, sourceSlide })),
      finalAssessmentAvailable: policy.canStartFinal(state).allowed
    });
  });

  app.get('/api/avs-emrg-2026/progress', guard, async (req, res) => {
    const state = policyState(req.avsAccess);
    const valid = policy.assertAccessValid(state);
    if (!valid.valid) return fail(res, 410, 'Workshop access has expired.', valid.reason);
    return res.json({ ok: true, access: safeAccessView(req.avsAccess) });
  });

  app.post('/api/avs-emrg-2026/formative/:screen/start', guard, async (req, res) => {
    try {
      const screenNumber = Number(req.params.screen);
      const record = req.avsAccess;
      const state = policyState(record);
      const gate = policy.canOpenScreen(state, screenNumber);
      if (!gate.allowed) return fail(res, gate.reason === 'invalid-screen' ? 400 : 403, 'This formative check is not available.', gate.reason);
      validateFormativeBank();
      const existing = await Attempt.findOne({ accessId: record._id, kind: 'formative', screenNumber, status: 'in-progress' }).select('+optionOrderByQuestionId');
      if (existing) {
        const snapshot = {
          attemptId: existing.attemptId, attemptNumber: existing.attemptNumber,
          questionOrder: existing.questionOrder, optionOrderByQuestionId: existing.optionOrderByQuestionId
        };
        return res.json({ ok: true, attemptId: existing.attemptId, questions: publicQuiz('formative', screenNumber, snapshot) });
      }
      const attemptNumber = await Attempt.countDocuments({ accessId: record._id, kind: 'formative', screenNumber }) + 1;
      if (attemptNumber > 20) return fail(res, 429, 'Too many attempts for this formative check.');
      const snapshot = makeSnapshot('formative', screenNumber, attemptNumber);
      const attempt = await Attempt.create({
        accessId: record._id, attemptId: snapshot.attemptId, kind: 'formative', screenNumber,
        attemptNumber, questionOrder: snapshot.questionOrder, optionOrderByQuestionId: snapshot.optionOrderByQuestionId,
        questionCount: 5, startedAt: new Date()
      });
      if (!record.activeStudyStartedAt && record.activeStudyHours !== null) {
        record.activeStudyStartedAt = new Date();
        await record.save();
      }
      return res.status(201).json({ ok: true, attemptId: attempt.attemptId, questions: publicQuiz('formative', screenNumber, snapshot) });
    } catch (error) {
      console.error('AVS formative start failed', error);
      return fail(res, 500, 'Unable to start this formative check.');
    }
  });

  app.post('/api/avs-emrg-2026/formative/:screen/submit', guard, async (req, res) => {
    try {
      const screenNumber = Number(req.params.screen);
      const attemptId = clean(req.body?.attemptId, 80);
      const attempt = await Attempt.findOne({ attemptId, accessId: req.avsAccess._id, kind: 'formative', screenNumber }).select('+optionOrderByQuestionId');
      if (!attempt) return fail(res, 404, 'Formative attempt not found.');
      if (attempt.status !== 'in-progress') return fail(res, 409, 'This attempt has already been submitted.');
      const state = policyState(req.avsAccess);
      const gate = policy.canOpenScreen(state, screenNumber);
      if (!gate.allowed) return fail(res, 403, 'This formative check is not available.', gate.reason);
      const snapshot = { questionOrder: attempt.questionOrder, optionOrderByQuestionId: attempt.optionOrderByQuestionId };
      const result = gradeQuiz('formative', screenNumber, snapshot, req.body?.answers);
      const progress = policy.recordFormativeResult(state, screenNumber, { correct: result.correct, total: result.total });
      attempt.answers = req.body.answers;
      attempt.correctCount = result.correct;
      attempt.questionCount = result.total;
      attempt.passed = result.passed;
      attempt.status = 'submitted';
      attempt.submittedAt = new Date();
      await attempt.save();
      if (result.passed) {
        req.avsAccess.completedChecks = [...new Set([...(req.avsAccess.completedChecks || []), screenNumber])].sort((a, b) => a - b);
        await req.avsAccess.save();
      }
      return res.json({
        ok: true, result: { correct: result.correct, total: result.total, percent: result.percent, passed: result.passed },
        completedChecks: progress.completedChecks, nextScreen: result.passed && screenNumber < 15 ? screenNumber + 1 : null
      });
    } catch (error) {
      if (error instanceof TypeError) return fail(res, 400, 'Invalid formative submission.');
      console.error('AVS formative submission failed', error);
      return fail(res, 500, 'Unable to grade this formative check.');
    }
  });

  app.post('/api/avs-emrg-2026/final/start', guard, async (req, res) => {
    try {
      const existing = await Attempt.findOne({ accessId: req.avsAccess._id, kind: 'final', status: 'in-progress' }).select('+optionOrderByQuestionId');
      if (existing) {
        const snapshot = { attemptId: existing.attemptId, attemptNumber: existing.attemptNumber, questionOrder: existing.questionOrder, optionOrderByQuestionId: existing.optionOrderByQuestionId };
        return res.json({ ok: true, attemptId: existing.attemptId, attemptNumber: existing.attemptNumber, questions: publicQuiz('final', null, snapshot) });
      }
      const record = await Access.findOneAndUpdate({
        _id: req.avsAccess._id, finalPassed: false, finalAttempts: { $lt: 3 },
        completedChecks: { $all: Array.from({ length: 15 }, (_, i) => i + 1), $size: 15 },
        accessExpiresAt: { $gt: new Date() }, revokedAt: null
      }, { $inc: { finalAttempts: 1 } }, { new: true });
      if (!record) return fail(res, 403, 'Final assessment requires all 15 formative checks and an available attempt.');
      const snapshot = makeSnapshot('final', null, record.finalAttempts);
      try {
        const attempt = await Attempt.create({
          accessId: record._id, attemptId: snapshot.attemptId, kind: 'final', attemptNumber: record.finalAttempts,
          questionOrder: snapshot.questionOrder, optionOrderByQuestionId: snapshot.optionOrderByQuestionId,
          questionCount: 30, startedAt: new Date()
        });
        if (!record.activeStudyStartedAt && record.activeStudyHours !== null) {
          record.activeStudyStartedAt = new Date();
          await record.save();
        }
        return res.status(201).json({ ok: true, attemptId: attempt.attemptId, attemptNumber: attempt.attemptNumber, questions: publicQuiz('final', null, snapshot) });
      } catch (error) {
        await Access.updateOne({ _id: record._id, finalAttempts: record.finalAttempts }, { $inc: { finalAttempts: -1 } });
        throw error;
      }
    } catch (error) {
      console.error('AVS final start failed', error);
      return fail(res, 500, 'Unable to start the final assessment.');
    }
  });

  app.post('/api/avs-emrg-2026/final/submit', guard, async (req, res) => {
    try {
      const attemptId = clean(req.body?.attemptId, 80);
      const attempt = await Attempt.findOne({ attemptId, accessId: req.avsAccess._id, kind: 'final' }).select('+optionOrderByQuestionId');
      if (!attempt) return fail(res, 404, 'Final assessment attempt not found.');
      if (attempt.status !== 'in-progress') return fail(res, 409, 'This attempt has already been submitted.');
      const result = gradeQuiz('final', null, { questionOrder: attempt.questionOrder, optionOrderByQuestionId: attempt.optionOrderByQuestionId }, req.body?.answers);
      attempt.answers = req.body.answers;
      attempt.correctCount = result.correct;
      attempt.questionCount = result.total;
      attempt.passed = result.passed;
      attempt.status = 'submitted';
      attempt.submittedAt = new Date();
      await attempt.save();
      const latestAccess = await Access.findById(req.avsAccess._id).lean();
      if (!latestAccess || latestAccess.completedChecks.length !== 15) return fail(res, 403, 'Required formative checks are incomplete.');
      await Access.updateOne({ _id: req.avsAccess._id, finalPassed: false }, {
        $set: { finalPassed: result.passed, certificateEligible: result.passed && latestAccess.completedChecks.length === 15 }
      });
      return res.json({
        ok: true, result: { correct: result.correct, total: result.total, percent: result.percent, passed: result.passed },
        finalAttempts: req.avsAccess.finalAttempts,
        certificateEligible: result.passed && req.avsAccess.completedChecks.length === 15
      });
    } catch (error) {
      if (error instanceof TypeError) return fail(res, 400, 'Invalid final assessment submission.');
      console.error('AVS final submission failed', error);
      return fail(res, 500, 'Unable to grade the final assessment.');
    }
  });

  app.post('/api/avs-emrg-2026/initial-assessment/start', guard, async (req, res) => {
    try {
      validateInitialAssessment();
      const access = req.avsAccess;
      const prior = await Attempt.findOne({ accessId: access._id, kind: 'diagnostic' }).select('+optionOrderByQuestionId');
      if (prior && prior.status === 'submitted') return fail(res, 409, 'The initial diagnostic has already been completed.');
      if (prior) {
        const snapshot = { questionOrder: prior.questionOrder, optionOrderByQuestionId: prior.optionOrderByQuestionId };
        return res.json({ ok: true, attemptId: prior.attemptId, questions: buildPublicInitialAssessment(INITIAL_ASSESSMENT, snapshot), requiredToPass: false });
      }
      const snapshot = createInitialAssessmentSnapshot();
      const attempt = await Attempt.create({
        accessId: access._id, attemptId: snapshot.attemptId, kind: 'diagnostic', attemptNumber: 1,
        questionOrder: snapshot.questionOrder, optionOrderByQuestionId: snapshot.optionOrderByQuestionId,
        questionCount: 10, startedAt: new Date()
      });
      return res.status(201).json({ ok: true, attemptId: attempt.attemptId, questions: buildPublicInitialAssessment(INITIAL_ASSESSMENT, snapshot), requiredToPass: false });
    } catch (error) {
      console.error('AVS diagnostic start failed', error);
      return fail(res, 500, 'Unable to start the initial diagnostic.');
    }
  });

  app.post('/api/avs-emrg-2026/initial-assessment/submit', guard, async (req, res) => {
    try {
      const attempt = await Attempt.findOne({ attemptId: clean(req.body?.attemptId, 80), accessId: req.avsAccess._id, kind: 'diagnostic' }).select('+optionOrderByQuestionId');
      if (!attempt) return fail(res, 404, 'Initial diagnostic attempt not found.');
      if (attempt.status !== 'in-progress') return fail(res, 409, 'The initial diagnostic has already been submitted.');
      const result = gradeInitialAssessment(INITIAL_ASSESSMENT, { questionOrder: attempt.questionOrder, optionOrderByQuestionId: attempt.optionOrderByQuestionId }, req.body?.answers);
      attempt.answers = req.body.answers;
      attempt.correctCount = result.correct;
      attempt.questionCount = result.total;
      attempt.passed = null;
      attempt.status = 'submitted';
      attempt.submittedAt = new Date();
      await attempt.save();
      req.avsAccess.diagnosticCompletedAt = new Date();
      await req.avsAccess.save();
      return res.json({ ok: true, result: { correct: result.correct, total: result.total, percent: result.percent }, requiredToPass: false, gatesWorkshopAccess: false, affectsCertificateEligibility: false });
    } catch (error) {
      if (error instanceof TypeError) return fail(res, 400, 'Invalid initial diagnostic submission.');
      console.error('AVS diagnostic submission failed', error);
      return fail(res, 500, 'Unable to grade the initial diagnostic.');
    }
  });

  app.get('/api/avs-emrg-2026/feedback', guard, (req, res) => {
    return fail(res, 503, 'Feedback survey is still a draft and is not available to learners until approved.');
  });

  app.post('/api/avs-emrg-2026/feedback', guard, (req, res) => {
    return fail(res, 503, 'Feedback survey is still a draft and is not available to learners until approved.');
  });;
}

module.exports = { register };
