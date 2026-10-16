'use strict';

const crypto = require('node:crypto');
const mongoose = require('mongoose');

const CODE = 'AVS-EMRG-2026';
const COLLECTION = 'avs_emrg_2026_registrations';
const clean = (v, n) => typeof v === 'string' ? v.trim().slice(0, n) : '';
const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function registerWorkshopRegistrationRoutes(app, { requireAdmin } = {}) {
  if (typeof requireAdmin !== 'function') throw new TypeError('Workshop registration routes require admin authentication.');
  const db = () => mongoose.connection.db;
  app.post('/api/workshops/avs-emrg-2026/registrations', async (req, res) => {
    try {
      if (!db()) return res.status(503).json({ message: 'Registration is temporarily unavailable.' });
      const b = req.body || {};
      const r = {
        registrationId: 'WSR-' + crypto.randomBytes(6).toString('hex').toUpperCase(),
        workshopCode: CODE,
        arabicName: clean(b.arabicName, 180),
        englishName: clean(b.englishName, 180),
        idType: clean(b.idType, 30),
        idNumber: clean(b.idNumber, 50),
        mobile: clean(b.mobile, 45),
        email: clean(b.email, 180).toLowerCase(),
        registrationType: clean(b.registrationType, 20),
        companyName: clean(b.companyName, 160),
        companyContact: clean(b.companyContact, 120),
        companyEmail: clean(b.companyEmail, 180).toLowerCase(),
        consent: b.consent === true,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      if ([r.arabicName,r.englishName,r.idType,r.idNumber,r.mobile,r.email,r.registrationType].some(x => !x)) return res.status(400).json({ message: 'Complete all required fields. / يرجى استكمال جميع الحقول المطلوبة.' });
      if (!['national_id','iqama','passport'].includes(r.idType)) return res.status(400).json({ message: 'Invalid ID type.' });
      if (!['individual','company'].includes(r.registrationType)) return res.status(400).json({ message: 'Invalid registration type.' });
      if (!validEmail(r.email) || (r.companyEmail && !validEmail(r.companyEmail))) return res.status(400).json({ message: 'Enter a valid email address.' });
      if (r.registrationType === 'company' && !r.companyName) return res.status(400).json({ message: 'Company name is required.' });
      if (!r.consent) return res.status(400).json({ message: 'Consent is required.' });
      const col = db().collection(COLLECTION);
      const existing = await col.findOne({ workshopCode: CODE, idNumber: r.idNumber, status: { $ne: 'cancelled' } }, { projection: { registrationId: 1, status: 1 } });
      if (existing) return res.status(409).json({ message: 'A registration already exists for this ID. / يوجد تسجيل سابق بهذه الهوية.', registrationId: existing.registrationId, status: existing.status });
      await col.insertOne(r);
      return res.status(201).json({ ok: true, registrationId: r.registrationId, status: r.status, workshopCode: CODE, message: 'Registration received. The workshop team will review your request. / تم استلام طلب التسجيل وسيقوم فريق الورشة بمراجعته.' });
    } catch (e) {
      console.error('Workshop registration submission failed', e);
      return res.status(500).json({ message: 'Unable to save registration right now.' });
    }
  });
  app.get('/api/admin/workshops/avs-emrg-2026/registrations', requireAdmin, async (req, res) => {
    try {
      if (!db()) return res.status(503).json({ message: 'Database is not ready.' });
      const status = clean(req.query.status, 20);
      const filter = { workshopCode: CODE };
      if (['pending','approved','invited','rejected','cancelled'].includes(status)) filter.status = status;
      const rows = await db().collection(COLLECTION).find(filter, { projection: { _id: 0, registrationId: 1, workshopCode: 1, arabicName: 1, englishName: 1, idType: 1, mobile: 1, email: 1, registrationType: 1, companyName: 1, companyContact: 1, companyEmail: 1, status: 1, createdAt: 1, updatedAt: 1 } }).sort({ createdAt: -1 }).limit(500).toArray();
      return res.json({ registrations: rows });
    } catch (e) {
      console.error('Workshop registration list failed', e);
      return res.status(500).json({ message: 'Unable to load workshop registrations.' });
    }
  });
  app.patch('/api/admin/workshops/avs-emrg-2026/registrations/:registrationId/status', requireAdmin, async (req, res) => {
    try {
      const status = clean(req.body?.status, 20);
      if (!['approved','invited','rejected','cancelled'].includes(status)) return res.status(400).json({ message: 'Invalid registration status.' });
      const result = await db().collection(COLLECTION).findOneAndUpdate(
        { workshopCode: CODE, registrationId: clean(req.params.registrationId, 40) },
        { $set: { status, updatedAt: new Date() } },
        { returnDocument: 'after', projection: { _id: 0, registrationId: 1, workshopCode: 1, arabicName: 1, englishName: 1, email: 1, status: 1, createdAt: 1, updatedAt: 1 } }
      );
      const row = result?.value || result;
      if (!row || !row.registrationId) return res.status(404).json({ message: 'Registration not found.' });
      return res.json({ ok: true, registration: row });
    } catch (e) {
      console.error('Workshop registration status update failed', e);
      return res.status(500).json({ message: 'Unable to update registration.' });
    }
  });
}
module.exports = { registerWorkshopRegistrationRoutes };
