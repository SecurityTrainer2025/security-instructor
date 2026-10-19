'use strict';

/**
 * Dedicated AVS-EMRG-2026 assessment API.
 * Registered on the API, but workshop access must remain disabled until release gates pass.
 * Uses isolated Mongo collections and never serializes answer keys to learners.
 */
const crypto = require('node:crypto');
const { buildWorkshopAccessUrl } = require('./avs-workshop-access-url');
const { Access, Attempt, createAccessToken, hashAccessToken, accessExpiry, safeAccessView } = require('./avs-emrg-2026-persistence');
const { adminAccessView, revokedAccessView } = require('./avs-emrg-2026-admin-access');
const policy = require('./avs-emrg-2026-workflow-policy');
const { buildFinalStartLockFilter } = require('./avs-emrg-2026-final-start-lock');
const { createWorkshopReleaseGate } = require('./avs-emrg-2026-release-gate');
const engine = require('./avs-emrg-2026-assessment');
const { WORKSHOP } = require('./avs-emrg-2026-manifest');
const { QUESTIONS: FINAL_BANK } = require('./avs-emrg-2026-final-question-bank');
const { getFormativeCheck, validateFormativeBank, createFormativeSnapshot, buildPublicFormativeCheck, gradeFormativeCheck } = require('./avs-emrg-2026-formative-question-bank');
const { INITIAL_ASSESSMENT, validateInitialAssessment, createInitialAssessmentSnapshot, buildPublicInitialAssessment, gradeInitialAssessment } = require('./avs-emrg-2026-initial-assessment');
const mongoose = require('mongoose');
const DiagnosticFeedback = mongoose.models.AvsEmrg2026Feedback || mongoose.model('AvsEmrg2026Feedback', new mongoose.Schema({ accessId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true }, answers: { type: mongoose.Schema.Types.Mixed, required: true }, submittedAt: { type: Date, default: Date.now } }, { timestamps: true, strict: 'throw' }), 'avs_emrg_2026_feedback');
const { FEEDBACK_SURVEY, validateFeedbackSurvey, isFeedbackSurveyApproved } = require('./avs-emrg-2026-feedback-survey');
const { getLesson } = require('./avs-emrg-2026-lessons');
const { Certificate, isCertificateEligible, ensureCertificate, publicCertificate, certificatePayload } = require('./avs-emrg-2026-certificates');

const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const fail = (res, status, message, reason) => res.status(status).json({ message, ...(reason ? { reason } : {}) });

function getToken(req) {
  const auth = String(req.headers.authorization || '');
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return '';
}
async function loadAccess(req) {
  const token = getToken(req);
  // Reject malformed bearer values as invalid credentials instead of turning them into 500s.
  if (!token || token.length < 40 || token.length > 200) return null;
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

function register(app, { requireAdmin, sendWorkshopAccessEmail } = {}) {
  if (typeof requireAdmin !== 'function') throw new TypeError('AVS route registration requires admin authentication middleware.');
  // Fail closed: all AVS learner, admin and public-verification endpoints remain unavailable
  // unless the deployment explicitly opts in with AVS_WORKSHOP_ENABLED=true.
  const releaseGate = createWorkshopReleaseGate();
  app.use('/api/avs-emrg-2026', releaseGate);
  app.use('/api/admin/avs-emrg-2026', releaseGate);

  const guard = accessTokenGuard();

  // Public verification reveals only certificate metadata, never learner email or access credentials.
  app.get('/api/avs-emrg-2026/certificate/verify/:certificateId', async (req, res) => {
    try {
      const certificateId = clean(req.params.certificateId, 80);
      if (!/^SI-AVS-2026-[A-F0-9]{12}$/.test(certificateId)) return fail(res, 400, 'Invalid certificate ID.');
      const record = await Certificate.findOne({ certificateId }).lean();
      if (!record) return res.status(404).json({ valid: false, message: 'Certificate record not found.' });
      return res.json({ valid: record.status === 'valid', status: record.status, certificateId: record.certificateId, workshopCode: record.workshopCode, learnerName: record.learnerName, workshopTitleEn: record.workshopTitleEn, workshopTitleAr: record.workshopTitleAr, durationHours: record.durationHours, issuedAt: record.issuedAt });
    } catch (error) {
      console.error('AVS certificate verification failed', error);
      return fail(res, 500, 'Unable to verify this certificate.');
    }
  });

  app.post('/api/admin/avs-emrg-2026/certificate/:certificateId/revoke', requireAdmin, async (req, res) => {
    try {
      const certificateId = clean(req.params.certificateId, 80);
      if (!/^SI-AVS-2026-[A-F0-9]{12}$/.test(certificateId)) return fail(res, 400, 'Invalid certificate ID.');
      const record = await Certificate.findOneAndUpdate({ certificateId, status: 'valid' }, { $set: { status: 'revoked' } }, { new: true });
      if (!record) return fail(res, 404, 'A valid certificate with this ID was not found.');
      return res.json({ ok: true, certificateId: record.certificateId, status: record.status });
    } catch (error) {
      console.error('AVS certificate revocation failed', error);
      return fail(res, 500, 'Unable to revoke this certificate.');
    }
  });

  app.get('/api/avs-emrg-2026/certificate', guard, async (req, res) => {
    try {
      const access = await Access.findById(req.avsAccess._id).lean();
      if (!isCertificateEligible(access)) return fail(res, 403, 'Complete all 15 knowledge checks and pass the final assessment before receiving a certificate.');
      let record = await Certificate.findOne({ accessId: access._id }).lean();
      if (!record) {
        // Recover a certificate if the final result was saved but certificate storage
        // failed during the original submission. Score is read only from the server-side
        // graded attempt record, never from learner input.
        const passingAttempt = await Attempt.findOne({
          accessId: access._id, kind: 'final', status: 'submitted', passed: true,
          correctCount: { $gte: 22 }, questionCount: 30
        }).sort({ submittedAt: -1 }).lean();
        if (!passingAttempt) return fail(res, 404, 'Certificate record is not available yet. Please contact the workshop administrator.');
        const recovered = await ensureCertificate(access, passingAttempt.correctCount);
        record = publicCertificate(recovered);
      }
      if (record.status !== 'valid') return fail(res, 410, 'This certificate has been revoked.');
      return res.json({ ok: true, certificate: await certificatePayload(record) });
    } catch (error) {
      console.error('AVS certificate retrieval failed', error);
      return fail(res, 500, 'Unable to load your certificate.');
    }
  });

  // Administrator list returns only safe invitation metadata; the raw token and its hash are never exposed.
  app.get('/api/admin/avs-emrg-2026/access', requireAdmin, async (req, res) => {
    try {
      const records = await Access.find({ workshopCode: WORKSHOP.code })
        .sort({ accessCreatedAt: -1 })
        .limit(500)
        .lean();
      return res.json({
        accesses: records.map(adminAccessView)
      });
    } catch (error) {
      console.error('AVS admin access list failed', error);
      return fail(res, 500, 'Unable to load workshop invitations.');
    }
  });

  app.post('/api/admin/avs-emrg-2026/access/:accessId/revoke', requireAdmin, async (req, res) => {
    try {
      const accessId = clean(req.params.accessId, 80);
      if (!mongoose.Types.ObjectId.isValid(accessId)) return fail(res, 400, 'Invalid access record ID.');
      const record = await Access.findOneAndUpdate(
        { _id: accessId, workshopCode: WORKSHOP.code, revokedAt: null },
        { $set: { revokedAt: new Date() } },
        { new: true }
      ).lean();
      if (!record) return fail(res, 404, 'An active invitation with this ID was not found.');
      return res.json({ ok: true, access: revokedAccessView(record) });
    } catch (error) {
      console.error('AVS invitation revocation failed', error);
      return fail(res, 500, 'Unable to revoke this workshop invitation.');
    }
  });

  app.post('/api/admin/avs-emrg-2026/access', requireAdmin, async (req, res) => {
    try {
      const learnerName = clean(req.body?.learnerName, 160);
      const learnerEmail = clean(req.body?.learnerEmail, 180).toLowerCase();
      if (typeof sendWorkshopAccessEmail !== 'function') return fail(res, 503, 'Workshop email delivery is not configured; no access link was issued.');
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
      try {
        await sendWorkshopAccessEmail({
          to: learnerEmail,
          learnerName,
          accessUrl: buildWorkshopAccessUrl(token),
          expiresAt: record.accessExpiresAt
        });
      } catch (mailError) {
        console.error('AVS access email delivery failed', mailError);
        await Access.updateOne(
          { _id: record._id, workshopCode: WORKSHOP.code, revokedAt: null },
          { $set: { revokedAt: new Date() } }
        );
        return fail(res, 503, 'Access email could not be sent. The issued link has been revoked; check email configuration and try again.');
      }
      // The raw token is sent only to the intended learner via email and is never returned in admin JSON.
      return res.status(201).json({
        ok: true, access: safeAccessView(record), emailSent: true
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
    const submittedChecks = await Attempt.find({
      accessId: record._id, kind: 'formative', status: 'submitted'
    }).select('screenNumber correctCount questionCount passed submittedAt').sort({ submittedAt: 1 }).lean();
    const bestByScreen = new Map();
    for (const attempt of submittedChecks) {
      const previous = bestByScreen.get(attempt.screenNumber);
      if (!previous || Number(attempt.correctCount || 0) > Number(previous.correctCount || 0)) {
        bestByScreen.set(attempt.screenNumber, {
          screenNumber: attempt.screenNumber,
          correct: Number(attempt.correctCount || 0),
          total: Number(attempt.questionCount || 5),
          percent: Math.round((Number(attempt.correctCount || 0) / Math.max(1, Number(attempt.questionCount || 5))) * 100),
          passed: !!attempt.passed
        });
      }
    }
    const lessonScores = [...bestByScreen.values()].sort((a, b) => a.screenNumber - b.screenNumber);
    const cumulativeCorrect = lessonScores.reduce((sum, score) => sum + score.correct, 0);
    const cumulativeTotal = lessonScores.reduce((sum, score) => sum + score.total, 0);
    return res.json({
      ok: true, workshop: { code: WORKSHOP.code, title: WORKSHOP.title, durations: WORKSHOP.durations },
      access: safeAccessView(record),
      screens: WORKSHOP.screens.map(({ id, order, titleEn, titleAr, sourceSlide }) => ({ id, order, titleEn, titleAr, sourceSlide })),
      scoreTracker: {
        lessonsScored: lessonScores.length, totalLessons: WORKSHOP.screens.length,
        cumulativeCorrect, cumulativeTotal,
        percentage: cumulativeTotal ? Math.round((cumulativeCorrect / cumulativeTotal) * 100) : 0,
        lessonScores
      },
      finalAssessmentAvailable: policy.canStartFinal(state).allowed
    });
  });

  app.get('/api/avs-emrg-2026/lesson/:screen', guard, async (req, res) => {
    const screenNumber = Number(req.params.screen);
    if (!Number.isInteger(screenNumber) || screenNumber < 1 || screenNumber > WORKSHOP.screens.length) {
      return fail(res, 400, 'Invalid lesson screen.');
    }
    const state = policyState(req.avsAccess);
    const gate = policy.canOpenScreen(state, screenNumber);
    if (!gate.allowed) return fail(res, gate.reason === 'invalid-screen' ? 400 : 403, 'This lesson is not available yet.', gate.reason);
    const lesson = getLesson(screenNumber);
    if (!lesson) return fail(res, 404, 'Lesson not found.');
    await Access.updateOne(
      { _id: req.avsAccess._id, workshopCode: WORKSHOP.code, revokedAt: null, accessExpiresAt: { $gt: new Date() } },
      { $addToSet: { viewedLessons: screenNumber } }
    );
    return res.json({ ok: true, lesson, lessonViewed: true });
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
      if (!(record.viewedLessons || []).includes(screenNumber)) {
        return fail(res, 403, 'Open and review this lesson content before starting its knowledge check.', 'lesson-content-not-viewed');
      }
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
        await Access.updateOne(
          { _id: record._id, workshopCode: WORKSHOP.code, activeStudyStartedAt: null, revokedAt: null, accessExpiresAt: { $gt: new Date() } },
          { $set: { activeStudyStartedAt: new Date() } }
        );
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
      if (attempt.status === 'submitted') {
        // Make a retry safe if the attempt was saved but the progress write failed.
        // The persisted server-graded result is authoritative; never re-grade client answers.
        if (attempt.passed === true) {
          await Access.updateOne(
            { _id: req.avsAccess._id, revokedAt: null, accessExpiresAt: { $gt: new Date() } },
            { $addToSet: { completedChecks: screenNumber } }
          );
        }
        const latest = await Access.findById(req.avsAccess._id).lean();
        return res.json({
          ok: true,
          result: {
            correct: attempt.correctCount, total: attempt.questionCount,
            percent: Math.round((attempt.correctCount / attempt.questionCount) * 100),
            passed: !!attempt.passed
          },
          completedChecks: latest?.completedChecks || [],
          nextScreen: attempt.passed && screenNumber < 15 ? screenNumber + 1 : null,
          replayed: true
        });
      }
      if (attempt.status !== 'in-progress') return fail(res, 409, 'This attempt is no longer available.'); 
      const state = policyState(req.avsAccess);
      const gate = policy.canOpenScreen(state, screenNumber);
      if (!gate.allowed) return fail(res, 403, 'This formative check is not available.', gate.reason);
      const snapshot = { questionOrder: attempt.questionOrder, optionOrderByQuestionId: attempt.optionOrderByQuestionId };
      const result = gradeQuiz('formative', screenNumber, snapshot, req.body?.answers);
      // Claim the attempt once; a concurrent submit must not overwrite the first result.
      const claimed = await Attempt.updateOne(
        { _id: attempt._id, status: 'in-progress' },
        { $set: {
          answers: req.body.answers, correctCount: result.correct, questionCount: result.total,
          passed: result.passed, status: 'submitted', submittedAt: new Date()
        } }
      );
      if (!claimed.modifiedCount) return fail(res, 409, 'This attempt has already been submitted; retry to retrieve its saved result.');
      let completedChecks = req.avsAccess.completedChecks || [];
      if (result.passed) {
        const progressUpdate = await Access.updateOne(
          { _id: req.avsAccess._id, workshopCode: WORKSHOP.code, revokedAt: null, accessExpiresAt: { $gt: new Date() } },
          { $addToSet: { completedChecks: screenNumber } }
        );
        if (!progressUpdate.matchedCount) return fail(res, 410, 'Workshop access is no longer valid.');
      }
      const latestAccess = await Access.findById(req.avsAccess._id).select('completedChecks').lean();
      completedChecks = latestAccess?.completedChecks || completedChecks;
      return res.json({
        ok: true, result: { correct: result.correct, total: result.total, percent: result.percent, passed: result.passed },
        completedChecks, nextScreen: result.passed && screenNumber < 15 ? screenNumber + 1 : null
      });
    } catch (error) {
      if (error instanceof TypeError) return fail(res, 400, 'Invalid formative submission.');
      console.error('AVS formative submission failed', error);
      return fail(res, 500, 'Unable to grade this formative check.');
    }
  });

  app.post('/api/avs-emrg-2026/final/start', guard, async (req, res) => {
    const accessId = req.avsAccess._id;
    let lockHeld = false;
    try {
      // Serialize final-start requests per access record. The second request must
      // re-check for an in-progress attempt only after it owns this lock.
      const lock = await Access.findOneAndUpdate(
        buildFinalStartLockFilter(accessId),
        { $set: { finalAttemptStartLockAt: new Date() } },
        { new: true }
      );
      if (!lock) return fail(res, 409, 'The final assessment is starting. Please retry shortly.');
      lockHeld = true;
      const existing = await Attempt.findOne({ accessId, kind: 'final', status: 'in-progress' }).select('+optionOrderByQuestionId');
      if (existing) {
        const snapshot = { attemptId: existing.attemptId, attemptNumber: existing.attemptNumber, questionOrder: existing.questionOrder, optionOrderByQuestionId: existing.optionOrderByQuestionId };
        return res.json({ ok: true, attemptId: existing.attemptId, attemptNumber: existing.attemptNumber, questions: publicQuiz('final', null, snapshot) });
      }
      const record = await Access.findOneAndUpdate({
        _id: accessId, finalPassed: false, finalAttempts: { $lt: 3 }, finalAttemptStartLockAt: { $ne: null },
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
          await Access.updateOne(
            { _id: record._id, workshopCode: WORKSHOP.code, activeStudyStartedAt: null, revokedAt: null, accessExpiresAt: { $gt: new Date() } },
            { $set: { activeStudyStartedAt: new Date() } }
          );
        }
        return res.status(201).json({ ok: true, attemptId: attempt.attemptId, attemptNumber: attempt.attemptNumber, questions: publicQuiz('final', null, snapshot) });
      } catch (error) {
        await Access.updateOne({ _id: record._id, finalAttempts: record.finalAttempts }, { $inc: { finalAttempts: -1 } });
        throw error;
      }
    } catch (error) {
      console.error('AVS final start failed', error);
      return fail(res, 500, 'Unable to start the final assessment.');
    } finally {
      if (lockHeld) await Access.updateOne({ _id: accessId }, { $set: { finalAttemptStartLockAt: null } }).catch(error => console.error('AVS final start lock release failed', error));
    }
  });

  app.post('/api/avs-emrg-2026/final/submit', guard, async (req, res) => {
    try {
      const attemptId = clean(req.body?.attemptId, 80);
      const attempt = await Attempt.findOne({ attemptId, accessId: req.avsAccess._id, kind: 'final' }).select('+optionOrderByQuestionId');
      if (!attempt) return fail(res, 404, 'Final assessment attempt not found.');
      if (attempt.status === 'submitted') {
        // Recover an interrupted request from the persisted server-graded result.
        // Never grade a retry's client-supplied answers again.
        const current = await Access.findById(req.avsAccess._id).lean();
        const checksComplete = Array.isArray(current?.completedChecks) &&
          current.completedChecks.length === 15 &&
          Array.from({ length: 15 }, (_, i) => i + 1).every(n => current.completedChecks.includes(n));
        if (!current || current.revokedAt || current.accessExpiresAt <= new Date() || !checksComplete) {
          return fail(res, 403, 'Required formative checks must be complete and access must remain valid.');
        }
        if (attempt.passed === true && !current.finalPassed &&
            current.finalAttempts >= attempt.attemptNumber && current.finalAttempts <= 3) {
          await Access.updateOne(
            { _id: current._id, finalPassed: false, finalAttempts: { $gte: attempt.attemptNumber, $lte: 3 }, revokedAt: null, accessExpiresAt: { $gt: new Date() } },
            { $set: { finalPassed: true, certificateEligible: true } }
          );
        }
        const latest = await Access.findById(current._id).lean();
        let certificate = null;
        if (latest?.certificateEligible && latest.finalPassed) {
          try {
            const passingAttempt = await Attempt.findOne({
              accessId: current._id, kind: 'final', status: 'submitted', passed: true,
              correctCount: { $gte: 22 }, questionCount: 30
            }).sort({ submittedAt: -1 }).lean();
            if (passingAttempt) {
              const eligibleAccess = await Access.findById(current._id).lean();
              certificate = publicCertificate(await ensureCertificate(eligibleAccess, passingAttempt.correctCount));
            }
          } catch (certificateError) {
            console.error('AVS certificate recovery pending retry', certificateError);
          }
        }
        return res.json({
          ok: true,
          result: {
            correct: attempt.correctCount, total: attempt.questionCount,
            percent: Math.round((attempt.correctCount / attempt.questionCount) * 100),
            passed: !!attempt.passed
          },
          finalAttempts: latest?.finalAttempts ?? current.finalAttempts,
          certificateEligible: !!latest?.certificateEligible,
          certificate,
          replayed: true
        });
      }
      if (attempt.status !== 'in-progress') return fail(res, 409, 'This attempt is no longer available.');
      const latestAccess = await Access.findById(req.avsAccess._id).lean();
      if (!latestAccess || latestAccess.revokedAt || latestAccess.accessExpiresAt <= new Date() ||
          !Array.isArray(latestAccess.completedChecks) ||
          latestAccess.completedChecks.length !== 15 ||
          Array.from({ length: 15 }, (_, i) => i + 1).some(n => !latestAccess.completedChecks.includes(n))) {
        return fail(res, 403, 'Required formative checks must be complete and access must remain valid.');
      }
      if (latestAccess.finalPassed || attempt.attemptNumber > latestAccess.finalAttempts || latestAccess.finalAttempts > 3) {
        return fail(res, 403, 'This final assessment attempt is no longer valid.');
      }
      const result = gradeQuiz('final', null, { questionOrder: attempt.questionOrder, optionOrderByQuestionId: attempt.optionOrderByQuestionId }, req.body?.answers);
      // Claim the attempt exactly once to prevent concurrent duplicate submissions.
      const claimed = await Attempt.updateOne(
        { _id: attempt._id, status: 'in-progress' },
        { $set: {
          answers: req.body.answers, correctCount: result.correct, questionCount: result.total,
          passed: result.passed, status: 'submitted', submittedAt: new Date()
        } }
      );
      if (!claimed.modifiedCount) return fail(res, 409, 'This attempt has already been submitted.');
      const update = await Access.updateOne({
        _id: req.avsAccess._id, finalPassed: false, finalAttempts: { $gte: attempt.attemptNumber, $lte: 3 },
        completedChecks: { $all: Array.from({ length: 15 }, (_, i) => i + 1), $size: 15 },
        accessExpiresAt: { $gt: new Date() }, revokedAt: null
      }, {
        $set: { finalPassed: result.passed, certificateEligible: result.passed }
      });
      if (!update.matchedCount) return fail(res, 409, 'Workshop progress changed; refresh your session before continuing.');
      let certificate = null;
      if (result.passed) {
        try {
          const eligibleAccess = await Access.findById(req.avsAccess._id).lean();
          const record = await ensureCertificate(eligibleAccess, result.correct);
          certificate = publicCertificate(record);
        } catch (certificateError) {
          // Do not lose a successfully graded assessment if certificate storage needs retry.
          console.error('AVS certificate issuance pending retry', certificateError);
        }
      }
      return res.json({
        ok: true, result: { correct: result.correct, total: result.total, percent: result.percent, passed: result.passed },
        finalAttempts: latestAccess.finalAttempts,
        certificateEligible: result.passed,
        certificate
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
      if (prior && prior.status === 'submitted') {
        return res.json({
          ok: true, completed: true, attemptId: prior.attemptId,
          result: {
            correct: prior.correctCount, total: prior.questionCount,
            percent: Math.round((prior.correctCount / Math.max(1, prior.questionCount)) * 100)
          },
          requiredToPass: false, gatesWorkshopAccess: false, affectsCertificateEligibility: false
        });
      }
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
      if (attempt.status === 'submitted') {
        // Retry safely after a partial save: diagnostic results are informational only.
        await Access.updateOne(
          { _id: req.avsAccess._id, diagnosticCompletedAt: null, revokedAt: null, accessExpiresAt: { $gt: new Date() } },
          { $set: { diagnosticCompletedAt: attempt.submittedAt || new Date() } }
        );
        return res.json({
          ok: true,
          result: {
            correct: attempt.correctCount, total: attempt.questionCount,
            percent: Math.round((attempt.correctCount / attempt.questionCount) * 100)
          },
          requiredToPass: false, gatesWorkshopAccess: false, affectsCertificateEligibility: false,
          replayed: true
        });
      }
      if (attempt.status !== 'in-progress') return fail(res, 409, 'This diagnostic attempt is no longer available.');
      const result = gradeInitialAssessment(INITIAL_ASSESSMENT, { questionOrder: attempt.questionOrder, optionOrderByQuestionId: attempt.optionOrderByQuestionId }, req.body?.answers);
      const submittedAt = new Date();
      const claimed = await Attempt.updateOne(
        { _id: attempt._id, status: 'in-progress' },
        { $set: {
          answers: req.body.answers, correctCount: result.correct, questionCount: result.total,
          passed: null, status: 'submitted', submittedAt
        } }
      );
      if (!claimed.modifiedCount) return fail(res, 409, 'This diagnostic has already been submitted; retry to retrieve its saved result.');
      await Access.updateOne(
        { _id: req.avsAccess._id, diagnosticCompletedAt: null, revokedAt: null, accessExpiresAt: { $gt: new Date() } },
        { $set: { diagnosticCompletedAt: submittedAt } }
      );
      return res.json({ ok: true, result: { correct: result.correct, total: result.total, percent: result.percent }, requiredToPass: false, gatesWorkshopAccess: false, affectsCertificateEligibility: false });
    } catch (error) {
      if (error instanceof TypeError) return fail(res, 400, 'Invalid initial diagnostic submission.');
      console.error('AVS diagnostic submission failed', error);
      return fail(res, 500, 'Unable to grade the initial diagnostic.');
    }
  });

  app.get('/api/avs-emrg-2026/feedback', guard, async (req, res) => {
    try {
      if (!isFeedbackSurveyApproved()) return fail(res, 503, 'The feedback survey is awaiting owner approval.', 'feedback-survey-pending-approval');
      validateFeedbackSurvey();
      const current = await Access.findById(req.avsAccess._id).lean();
      if (!isCertificateEligible(current)) return fail(res, 403, 'Complete all required knowledge checks and pass the final assessment before submitting feedback.');
      const existing = await DiagnosticFeedback.findOne({ accessId: req.avsAccess._id }).lean();
      return res.json({ survey: { code: 'SI-COURSE-FEEDBACK', languageMode: FEEDBACK_SURVEY.languageMode, scored: false, affectsCertificateEligibility: false, questions: FEEDBACK_SURVEY.questions }, submitted: !!existing, submittedAt: existing?.submittedAt || null });
    } catch (error) {
      console.error('AVS feedback retrieval failed', error);
      return fail(res, 500, 'Unable to load the feedback survey.');
    }
  });

  app.post('/api/avs-emrg-2026/feedback', guard, async (req, res) => {
    try {
      if (!isFeedbackSurveyApproved()) return fail(res, 503, 'The feedback survey is awaiting owner approval.', 'feedback-survey-pending-approval');
      validateFeedbackSurvey();
      const current = await Access.findById(req.avsAccess._id).lean();
      if (!isCertificateEligible(current)) return fail(res, 403, 'Complete all required knowledge checks and pass the final assessment before submitting feedback.');
      const previous = await DiagnosticFeedback.findOne({ accessId: req.avsAccess._id }).lean();
      if (previous) return fail(res, 409, 'Feedback has already been submitted for this workshop access.');
      const answers = req.body?.answers;
      if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return fail(res, 400, 'Feedback answers are required.');
      const cleanAnswers = {};
      for (const q of FEEDBACK_SURVEY.questions) {
        const value = answers[q.id];
        if (q.required && value === undefined) return fail(res, 400, 'Please complete all required feedback ratings.');
        if (value === undefined || value === null || value === '') continue;
        if (q.type === 'rating-1-to-5') {
          const n = Number(value);
          if (!Number.isInteger(n) || n < 1 || n > 5) return fail(res, 400, 'Rating answers must be from 1 to 5.');
          cleanAnswers[q.id] = n;
        } else if (q.type === 'text') {
          if (typeof value !== 'string' || value.length > (q.maxLength || 1000)) return fail(res, 400, 'A feedback comment is invalid or too long.');
          cleanAnswers[q.id] = value.trim();
        }
      }
      // Create-only write plus the unique accessId index prevents duplicate submissions,
      // including two concurrent requests that pass the earlier friendly duplicate check.
      await DiagnosticFeedback.create({
        accessId: req.avsAccess._id,
        answers: cleanAnswers,
        submittedAt: new Date()
      });
      return res.json({ ok: true, message: 'Thank you for your feedback. / شكرًا لملاحظاتك.' });
    } catch (error) {
      if (error?.code === 11000) {
        return fail(res, 409, 'Feedback has already been submitted for this workshop access.');
      }
      console.error('AVS feedback submission failed', error);
      return fail(res, 500, 'Unable to save feedback.');
    }
  });
}

module.exports = { register };
