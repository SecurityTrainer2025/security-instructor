const mongoose=require('mongoose');

const STAGING_LEARNER='https://si-staging-ui.onrender.com/traffic-self-study.html';
const PRODUCTION_FRONTEND='https://securitytrainer2025.github.io/security-instructor/frontend';

function trafficDatabaseMode(){
  const connected=mongoose.connection.db?.databaseName;
  if(!connected)return null;
  const environment=process.env.SI_DEPLOYMENT_ENV;
  const staging=(process.env.SI_TRAFFIC_STAGING_DB_NAME||'').trim();
  const production=(process.env.SI_TRAFFIC_PRODUCTION_DB_NAME||'').trim();
  if(environment==='staging'&&/staging/i.test(staging)&&connected===staging)return 'staging';
  // The established production MongoDB database is literally named 'test'.
  // Permit only that exact legacy name (not arbitrary test databases), or a
  // non-staging/non-development production name. Still require an explicit
  // production environment, configured DB name and exact live connection match.
  const safeProductionName=production==='test'||
    (production!==''&&!/staging|test|development/i.test(production));
  if(environment==='production'&&safeProductionName&&production!==staging&&
    connected===production)return 'production';
  return null;
}

function trafficLearnerUrl(){
  const mode=trafficDatabaseMode();
  if(mode==='staging'&&process.env.TRAFFIC_PILOT_ENABLED==='true'&&
    (process.env.TRAFFIC_STAGING_FRONTEND_URL||'').trim()===STAGING_LEARNER)return STAGING_LEARNER;
  if(mode==='production'&&process.env.TRAFFIC_PRODUCTION_ENABLED==='true')return PRODUCTION_FRONTEND+'/traffic-self-study.html';
  return '';
}

function trafficRegistrationEnabled(){
  return Boolean(trafficLearnerUrl())&&(trafficDatabaseMode()==='staging'||
    (process.env.TRAFFIC_PRODUCTION_REGISTRATION_ENABLED==='true'&&
      Boolean(process.env.BREVO_API_KEY?.trim()&&process.env.MAIL_FROM?.trim())));
}

function trafficCertificatesEnabled(){
  return Boolean(trafficLearnerUrl())&&(trafficDatabaseMode()==='staging'
    ?process.env.TRAFFIC_CERTIFICATES_ENABLED==='true'
    :process.env.TRAFFIC_PRODUCTION_CERTIFICATES_ENABLED==='true');
}

module.exports={PRODUCTION_FRONTEND,trafficDatabaseMode,trafficLearnerUrl,trafficRegistrationEnabled,trafficCertificatesEnabled};
