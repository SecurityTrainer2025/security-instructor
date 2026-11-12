'use strict';
// In-memory contract test: no network, MongoDB, email or certificate creation.
const assert=require('node:assert/strict');
const Module=require('node:module');
const certificateId='SI-CERT-2026-TESTABC123';
const traffic={
  certificateId,courseId:'CRS-TRAFFIC-001',verificationStatus:'valid',
  recipientNameEn:'Traffic Test Trainee',recipientNameAr:'متدرب اختبار',
  courseNameEn:'Traffic Management & Vehicle Control',
  courseNameAr:'إدارة حركة المرور',issuedAt:'2026-11-12T00:00:00Z'
};
const legacy={...traffic,courseId:'CRS-FIRE-001'};
let active=traffic,qrUrl='',searches=[],created=0;
const Record={
 findOne:query=>({lean:async()=>{
  searches.push(query);
  if(query?.certificateId===certificateId && (!query.courseId || query.courseId===active.courseId))return active;
  return null;
 }}),
 create:async()=>{created++;throw Error('A real certificate must never be created during QA')},
 updateOne:async()=>{throw Error('Unexpected certificate update')}
};
const Enrollment={findOne:()=>({lean:async()=>({enrollmentId:'MOCK-TRAFFIC',courseId:'CRS-TRAFFIC-001',status:'completed'})})};
const Trainee={findOne:()=>({lean:async()=>null})};
const mockMongoose={
 Schema:class Schema{constructor(){}},
 Types:{ObjectId:{isValid:()=>false}},
 connection:{db:{databaseName:'security_instructor_staging'},collection:()=>({findOne:async()=>null})},
 model:(name)=>name==='TrainingCertificate'?Record:name==='TrainingCertificateEnrollment'?Enrollment:Trainee
};
const noop=function(){return this};
const express={application:{get:noop,post:noop,patch:noop}};
const qrcode={toString:async url=>{qrUrl=url;return '<svg></svg>'},toBuffer:async url=>{qrUrl=url;return Buffer.from('mock')}};
const orig=Module._load;
Module._load=function(name,parent,isMain){
 if(name==='mongoose')return mockMongoose;
 if(name==='express')return express;
 if(name==='qrcode')return qrcode;
 if(name==='dotenv')return {config(){}};
 return orig.call(this,name,parent,isMain);
};
let certApi;
try{certApi=require('../backend/training-certificate-routes.js')}finally{Module._load=orig}
const handlers=new Map();
const app={get(path,handler){handlers.set('GET '+path,handler);return this}};
certApi.registerTrainingCertificateDirectRoutes(app);
const call=async (path,query={},params={})=>{
 const fn=handlers.get('GET '+path);
 assert.ok(fn,'Missing route '+path);
 let status=200,body,done=false,contentType='',text='';
 const res={
  status(n){status=n;return this},
  set(){return this},
  type(v){contentType=v;return this},
  json(x){body=x;done=true;return this},
  send(x){text=x;done=true;return this},
  end(){done=true;return this}
 };
 await fn({query,params},res);
 assert.ok(done,'No response');
 return {status,body,contentType,text};
};
process.env.SI_DEPLOYMENT_ENV='staging';
process.env.SI_TRAFFIC_STAGING_DB_NAME='security_instructor_staging';
process.env.TRAFFIC_PILOT_ENABLED='false';
process.env.TRAFFIC_CERTIFICATES_ENABLED='false';
async function main(){
 const route='/api/verify/traffic-staging-certificate';
 let r=await call(route,{id:'WRONG'});
 assert.equal(r.status,400);
 assert.equal(searches.length,0);
 r=await call(route,{id:certificateId});
 assert.equal(r.status,200);
 assert.equal(r.body.valid,true);
 assert.equal(r.body.courseId,'CRS-TRAFFIC-001');
 assert.equal(r.body.certificateId,certificateId);
 assert.equal('idNumber' in r.body,false);
 assert.equal('email' in r.body,false);
 assert.ok(searches.some(q=>q.courseId==='CRS-TRAFFIC-001'));
 active=legacy;
 r=await call(route,{id:certificateId});
 assert.equal(r.status,404,'Legacy certificate must not be represented as Traffic');
 active=traffic;
 mockMongoose.connection.db.databaseName='security_instructor_production';
 r=await call(route,{id:certificateId});
 assert.equal(r.status,404,'Mismatched DB must disable Traffic verifier');
 mockMongoose.connection.db.databaseName='security_instructor_staging';
 await assert.rejects(()=>certApi.issueForEnrollment('MOCK-TRAFFIC'),/issuance is disabled/);
 assert.equal(created,0);
 r=await call('/api/training-certificates/:certificateId/qr',{}, {certificateId});
 assert.equal(r.status,200);
 assert.equal(r.contentType,'image/svg+xml');
 assert.ok(qrUrl.startsWith('https://si-staging-ui.onrender.com/traffic-verify.html?id='));
 assert.ok(!qrUrl.includes('github.io'));
 active=legacy;
 r=await call('/api/training-certificates/:certificateId/qr',{}, {certificateId});
 assert.equal(r.status,200);
 assert.ok(qrUrl.startsWith('https://securitytrainer2025.github.io/security-instructor/frontend/verify.html?type=certificate&id='));
 console.log('PASS: Traffic verifier isolated from Fire; wrong ID refused; staging DB required; Traffic certificate issuance OFF; Traffic QR staging-only; Fire QR unchanged; zero real writes');
}
main().catch(e=>{console.error(e);process.exitCode=1});
