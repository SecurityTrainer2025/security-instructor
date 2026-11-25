const mongoose = require('mongoose');

const courseCodes = {
  'CRS-TRAFFIC-001': ['TRAFFIC', 'TM', 'traffic-management-vehicle-control'],
  'CRS-FIRE-001': ['FIRE', 'FS', 'fire-safety-emergency-response'],
  'CRS-CROWD-001': ['CROWD', 'CRW', 'crowd-management-event-security'],
  'CRS-VEHICLE-001': ['VEHICLE', 'VS', 'vehicle-search-security-inspection'],
  'CRS-PERSON-001': ['PERSON', 'PS', 'person-search-security-screening']
};

function courseKeys(courseId, slug) {
  const known = Object.entries(courseCodes).find(([id, codes]) => id === courseId || codes.includes(courseId));
  return [...new Set([courseId, slug, ...(known ? [known[0], ...known[1]] : [])].filter(Boolean))];
}

function coursePrefix(courseId) {
  const keys = courseKeys(courseId);
  const known = Object.entries(courseCodes).find(([id]) => keys.includes(id));
  return known ? known[1][0] : Buffer.from(courseId).toString('hex').toUpperCase();
}

async function withAllocation(work) {
  const db = mongoose.connection;
  const locks = db.collection('trainingallocation');
  // Initialize outside the transaction so simultaneous first requests never race on an upsert inside it.
  try {
    await locks.updateOne({ _id: 'training' }, { $setOnInsert: { revision: 0 } }, { upsert: true });
  } catch (error) {
    if (error.code !== 11000) throw error;
  }
  return db.transaction(async session => {
    // Every seat allocation and admin batch mutation writes this document first.
    // MongoDB retries write conflicts with a fresh snapshot.
    await locks.updateOne({ _id: 'training' }, { $inc: { revision: 1 } }, { session });
    return work(db, session);
  });
}

async function nextIdentifier(collection, field, prefix, width, session) {
  const pattern = new RegExp('^' + prefix + '[0-9]+$');
  const [last] = await collection.aggregate([
    { $match: { [field]: pattern } },
    { $project: { number: { $toLong: { $substrBytes: ['$' + field, prefix.length, -1] } } } },
    { $sort: { number: -1 } },
    { $limit: 1 }
  ], { session }).toArray();
  return prefix + String(Number(last?.number ?? 0) + 1).padStart(width, '0');
}

async function createEnrollment(db, session, fields, slug, trainingType) {
  const now = new Date();
  const enrollments = db.collection('enrollments');
  const batches = db.collection('batches');
  const batchFilter = { courseId: { $in: courseKeys(fields.courseId, slug) }, trainingType };
  const configured = await batches.findOne(batchFilter, { session });
  let batch;
  if (configured) {
    batch = await findSeat(db, session, batchFilter, now);
    if (!batch) throw Object.assign(new Error('No open batch has seats available. / لا توجد مقاعد متاحة في الدفعات المفتوحة.'), { status: 409 });
  }
  const enrollment = {
    ...fields, trainingType,
    enrollmentId: await nextIdentifier(enrollments, 'enrollmentId', 'ENR-', 6, session),
    registrationAlias: await nextIdentifier(enrollments, 'registrationAlias',
      `${coursePrefix(fields.courseId)}-${now.getUTCFullYear()}-`, 4, session),
    ...(batch ? { batchId: batch.batchId, batchCode: batch.batchCode } : {}),
    registeredAt: now, createdAt: now, updatedAt: now
  };
  await enrollments.insertOne(enrollment, { session });
  return enrollment;
}

async function findSeat(db, session, batchFilter, now = new Date()) {
  const cursor = db.collection('batches').find({
    ...batchFilter,
    status: { $in: ['open', 'full'] },
    $and: [
      { $or: [{ registrationOpensAt: null }, { registrationOpensAt: { $lte: now } }] },
      { $or: [{ registrationClosesAt: null }, { registrationClosesAt: { $gt: now } }] }
    ]
  }, { session }).sort({ createdAt: 1, _id: 1 });
  for await (const batch of cursor) {
    const occupied = await db.collection('enrollments').countDocuments({ batchId: batch.batchId }, { session });
    if (occupied < batch.capacity) return batch;
  }
  return null;
}

module.exports = { courseKeys, coursePrefix, withAllocation, nextIdentifier, findSeat, createEnrollment };
