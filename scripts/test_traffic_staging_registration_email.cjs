// Read-only mocked end-to-end Traffic registration / Brevo / email-token / session tests.
// Makes no external network requests, MongoDB writes, or real certificate requests.
'use strict';
const assert=require('node:assert/strict'), crypto=require('node:crypto'), Module=require('node:module');
process.env.SI_DEPLOYMENT_ENV='staging';
process.env.TRAFFIC_PILOT_ENABLED='true';
process.env.SI_TRAFFIC_STAGING_DB_NAME='si_traffic_staging';
process.env.TRAFFIC_STAGING_FRONTEND_URL='https://si-staging-ui.onrender.com/traffic-self-study.html';
process.env.BREVO_API_KEY='MOCK-ONLY-NOT-A-SECRET';
process.env.MAIL_FROM='test@example.invalid';
const SLUG='traffic-management-vehicle-control';
const hash=x=>crypto.createHash('sha256').update(String(x)).digest('hex');
const copied=[],sentMail=[];
const state={trainees:[],enrollments:[],selfstudyaccess:[]};
function matches(item,query){
  return Object.entries(query).every(([k,v])=>{
    if(k==='_id')return item[k]===v;
    if(v&&typeof v==='object'&&!(v instanceof Date)){
      if(v.$gt)return new Date(item[k]).getTime()>new Date(v.$gt).getTime();
      return false;
    }
    return item[k]===v;
  });
}
const collections={};
for(const table of Object.keys(state)){
  collections[table]={
    findOne:async q=>state[table].find(row=>matches(row,q))||null,
    insertOne:async doc=>{doc._id=doc._id||'mock-'+table+'-'+(state[table].length+1);state[table].push(doc);copied.push(['insert',table]);return{insertedId:doc._id}},
    updateOne:async(q,u)=>{
      const row=state[table].find(x=>matches(x,q));
      if(!row)return{modifiedCount:0};
      Object.assign(row,u.$set||{});copied.push(['update',table]);return{modifiedCount:1}
    },
    find:()=>{
      // Used to find the next unique enrollment ID. Start with no enrollment records.
      return {sort(){return this},limit(){return this},async next(){return null}}
    }
  };
}
const mockedMongoose={Types:{ObjectId:class{toString(){return 'mock-trainee-objectid'}}},connection:{
  db:{databaseName:'si_traffic_staging'},collection:name=>{
    if(!collections[name])throw Error('Unexpected collection '+name);
    return collections[name];
  }
}};
const oldLoad=Module._load;
Module._load=function(id,parent,main){
  if(id==='mongoose')return mockedMongoose;
  if(id==='express')return{};
  if(id==='nodemailer')return{};
  if(id==='dotenv')return{config(){}};
  return oldLoad.call(this,id,parent,main);
};
const actualFetch=global.fetch;
global.fetch=async (url,options)=>{
  if(url!=='https://api.brevo.com/v3/smtp/email')throw Error('Unexpected external service '+url);
  assert.equal(options.method,'POST');
  const mail=JSON.parse(options.body);
  assert.equal(mail.to[0].email,'mock.trainee@example.test');
  assert.ok(mail.htmlContent.includes('traffic-self-study.html'));
  assert.ok(mail.textContent.includes('traffic-management-vehicle-control'));
  assert.ok(!mail.htmlContent.includes('fire-safety-self-study.html'));
  sentMail.push(mail);
  return {ok:true,status:201};
};
let routes;
try{routes=require('../backend/self-study-routes.js')}finally{Module._load=oldLoad}
const handles=new Map(),app={post:(path,...fns)=>handles.set('POST '+path,fns),get:(path,...fns)=>handles.set('GET '+path,fns)};
routes.register(app);
async function call(method,path,{body={},params={},auth=''}={}){
  const chain=handles.get(method+' '+path);
  assert.ok(chain,path);
  const request={body,params,headers:{authorization:auth?'Bearer '+auth:''}};
  let status=200,response,done=false;
  const res={status(n){status=n;return this},json(data){response=data;done=true;return this}};
  for(const handler of chain){if(done)break;let next=false;await handler(request,res,()=>{next=true});if(!next&&!done)throw Error('No response '+path)}
  assert.ok(done,path);
  return {status,response};
}
async function main(){
  const registration={
    courseSlug:SLUG,
    arabicName:'محمد أحمد خالد',
    englishName:'Mohamed Ahmed Khaled',
    email:'mock.trainee@example.test',
    idType:'passport',idNumber:'MOCK-00001',mobile:'+201000000000'
  };
  const enroll=await call('POST','/api/self-study/register',{body:registration});
  assert.equal(enroll.status,201);
  assert.equal(enroll.response.mailSent,true);
  assert.equal(enroll.response.enrollmentId,'ENR-000001');
  assert.equal(state.trainees.length,1);
  assert.equal(state.enrollments.length,1);
  assert.equal(state.enrollments[0].courseId,'CRS-TRAFFIC-001');
  assert.equal(state.selfstudyaccess.length,1);
  assert.equal(sentMail.length,1);
  const row=state.selfstudyaccess[0];
  assert.equal(row.accessStartsAt,null,'5-day clock must not begin on registration');
  const beginUrl=sentMail[0].htmlContent.match(/href="([^"]+)" style="display:inline-block/);
  assert.ok(beginUrl,'email access link is missing');
  const token=new URL(beginUrl[1]).hash.match(/token=([^&]+)/)?.[1];
  assert.ok(token,'email link must carry a random access token');
  assert.equal(hash(decodeURIComponent(token)),row.magicTokenHash);
  let ex=await call('POST','/api/self-study/session/exchange',{body:{token:decodeURIComponent(token)}});
  assert.equal(ex.status,200);
  assert.equal(ex.response.courseSlug,SLUG);
  assert.ok(ex.response.sessionToken.length>=32);
  const delta=(new Date(row.accessExpiresAt)-new Date(row.accessStartsAt))/3600000;
  assert.equal(delta,120,'5-day clock must start only at activation');
  const reused=await call('POST','/api/self-study/session/exchange',{body:{token:decodeURIComponent(token)}});
  assert.equal(reused.status,401,'consumed token cannot be reused');
  const session=ex.response.sessionToken;
  const me=await call('GET','/api/self-study/me',{auth:session});
  assert.equal(me.status,200);
  assert.equal(me.response.course.code,'CRS-TRAFFIC-001');
  assert.equal(me.response.finalAttempts,0);
  const oldHash=row.magicTokenHash;
  const recover=await call('POST','/api/self-study/access/request',{body:{
    email:registration.email,enrollmentId:enroll.response.enrollmentId,courseSlug:SLUG
  }});
  assert.equal(recover.status,200);
  assert.equal(sentMail.length,2);
  assert.notEqual(row.magicTokenHash,oldHash,'recovery creates a fresh access token');
  assert.equal((new Date(row.accessExpiresAt)-new Date(row.accessStartsAt))/3600000,120,'recovery cannot reset five-day window');
  const secretError=await call('POST','/api/self-study/access/request',{body:{
    email:'wrong@example.test',enrollmentId:enroll.response.enrollmentId,courseSlug:SLUG
  }});
  assert.equal(secretError.status,200);
  assert.equal(sentMail.length,2,'incorrect recovery details must not send mail');
  assert.equal(state.enrollments.length,1,'recovery must not enroll again');
  assert.ok(copied.every(([,name])=>Object.keys(state).includes(name)));
  console.log('PASS: mocked real route registration, isolated Mongo documents, email link, token exchange, 120h access, replay blocked, session, recovery; zero external requests');
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{global.fetch=actualFetch});
