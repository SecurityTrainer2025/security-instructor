const { courseKeys } = require('./training-allocation.js');

const literal = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const qvalue = (value, limit) => typeof value === 'string' ? value.trim().slice(0, limit) : '';

function traineeNameFilter(search) {
  const fields = ['traineeId', 'email', 'idNumber', 'arabicFirstName', 'arabicMiddleName', 'arabicLastName',
    'englishFirstName', 'englishMiddleName', 'englishLastName'];
  return { $and: search.split(/\s+/).map(term => ({
    $or: fields.map(field => ({ [field]: new RegExp(literal(term), 'i') }))
  })) };
}

async function enrollmentFilter(db, query) {
  const course = qvalue(query?.courseId || query?.course, 180);
  const batch = qvalue(query?.batch, 240);
  const search = qvalue(query?.q, 240);
  const clauses = [];
  if (course) {
    const keys = courseKeys(course);
    const record = await db.collection('trainingcourses').findOne({ $or: [{ code: course }, { slug: course }] });
    clauses.push({ courseId: { $in: [...new Set([...keys, record?.code, record?.slug].filter(Boolean))] } });
  }
  if (batch) clauses.push({ $or: [{ batchId: batch }, { batchCode: batch }] });
  if (search) {
    const pattern = new RegExp(literal(search), 'i');
    const trainees = await db.collection('trainees').distinct('traineeId', traineeNameFilter(search));
    clauses.push({ $or: [
      { traineeId: { $in: trainees } },
      ...['enrollmentId', 'registrationAlias', 'batchId', 'batchCode', 'courseNameEn', 'courseNameAr', 'companyName']
        .map(field => ({ [field]: pattern }))
    ] });
  }
  return clauses.length ? { $and: clauses } : {};
}

module.exports = { enrollmentFilter, traineeNameFilter };
