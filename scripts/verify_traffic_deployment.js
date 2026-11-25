// Regression tests for the Traffic staging/production database safety gate.
// Run: node scripts/verify_traffic_deployment.js
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../backend/traffic-deployment.js'),'utf8');

function load(env,connectedDatabase){
  const context={
    module:{exports:{}},
    exports:{},
    process:{env},
    require(name){
      assert.equal(name,'mongoose');
      return {connection:{db:connectedDatabase?{databaseName:connectedDatabase}:undefined}};
    }
  };
  vm.runInNewContext(source,context,{filename:'traffic-deployment.js'});
  return context.module.exports;
}

const production={
  SI_DEPLOYMENT_ENV:'production',
  SI_TRAFFIC_PRODUCTION_DB_NAME:'test',
  TRAFFIC_PRODUCTION_ENABLED:'true',
  TRAFFIC_PRODUCTION_REGISTRATION_ENABLED:'true',
  TRAFFIC_PRODUCTION_CERTIFICATES_ENABLED:'true',
  BREVO_API_KEY:'dummy-for-test-only',
  MAIL_FROM:'training@example.org'
};
let gate=load(production,'test');
assert.equal(gate.trafficDatabaseMode(),'production','legacy test DB is valid only when explicitly configured');
assert.equal(gate.trafficRegistrationEnabled(),true,'registration requires a known production DB and email');
assert.equal(gate.trafficCertificatesEnabled(),true,'certificates require a known production DB');
assert.match(gate.trafficLearnerUrl(),/securitytrainer2025\.github\.io/);

gate=load({...production,TRAFFIC_PRODUCTION_REGISTRATION_ENABLED:'false'},'test');
assert.equal(gate.trafficRegistrationEnabled(),false,'registration flag remains independent');
gate=load({...production,TRAFFIC_PRODUCTION_CERTIFICATES_ENABLED:'false'},'test');
assert.equal(gate.trafficCertificatesEnabled(),false,'certificate flag remains independent');
gate=load({...production,TRAFFIC_PRODUCTION_ENABLED:'false'},'test');
assert.equal(gate.trafficDatabaseMode(),'production');
assert.equal(gate.trafficLearnerUrl(),'','the master availability flag still closes access');
assert.equal(gate.trafficRegistrationEnabled(),false);
assert.equal(gate.trafficCertificatesEnabled(),false);
for(const [env,connected] of [
  [{...production,SI_DEPLOYMENT_ENV:'staging'},'test'],
  [production,'security_instructor_staging'],
  [{...production,SI_TRAFFIC_PRODUCTION_DB_NAME:'security_instructor_staging'},'security_instructor_staging'],
  [{...production,SI_TRAFFIC_PRODUCTION_DB_NAME:'test_backup'},'test_backup'],
  [{...production,SI_TRAFFIC_PRODUCTION_DB_NAME:'development'},'development'],
  [{...production,SI_TRAFFIC_PRODUCTION_DB_NAME:'test2'},'test2'],
  [{...production,SI_TRAFFIC_PRODUCTION_DB_NAME:'other_database'},'test'],
  [production,null]
]){
  gate=load(env,connected);
  assert.equal(gate.trafficDatabaseMode(),null,'mismatched/unsafe DB must be denied');
  assert.equal(gate.trafficLearnerUrl(),'');
  assert.equal(gate.trafficRegistrationEnabled(),false);
  assert.equal(gate.trafficCertificatesEnabled(),false);
}
const staging={
  SI_DEPLOYMENT_ENV:'staging',
  SI_TRAFFIC_STAGING_DB_NAME:'security_instructor_staging',
  TRAFFIC_PILOT_ENABLED:'true',
  TRAFFIC_CERTIFICATES_ENABLED:'true',
  TRAFFIC_STAGING_FRONTEND_URL:'https://si-staging-ui.onrender.com/traffic-self-study.html'
};
gate=load(staging,'security_instructor_staging');
assert.equal(gate.trafficDatabaseMode(),'staging','staging continues to work separately');
assert.equal(gate.trafficRegistrationEnabled(),true);
assert.equal(gate.trafficCertificatesEnabled(),true);
assert.match(gate.trafficLearnerUrl(),/si-staging-ui/);

console.log('Traffic production/staging database safety gates: PASS');
