const normalize = address => String(address || '').trim().toLowerCase();
const approvedTestEmail = () => {
  const email = normalize(process.env.SI_QA_TEST_EMAIL);
  return /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email) ? email : '';
};

const canSendMailTo = address => {
  if (process.env.SI_DEPLOYMENT_ENV !== 'staging') return true;
  const allowed = approvedTestEmail();
  return Boolean(allowed && typeof address === 'string' && normalize(address) === allowed);
};

module.exports = {canSendMailTo, approvedTestEmail};
