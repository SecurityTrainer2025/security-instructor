// Isolated in-memory contract checks for SI Fire + Traffic self-study routes.
// No database, Brevo, production API, or real trainee records involved.
'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const Module=require('node:module');
const path=require('node:path');

const {TRAFFIC_SLUG,TRAFFIC_META,TRAFFIC_SCREENS,TRAFFIC_FINAL_ASSESSMENT}=require('../backend/self-study-traffic-config.js');
const FIRE_SLUG='fire-safety-emergency-response';
process.env.SI_DEPLOYMENT_ENV='staging';
process.env.SI_TRAFFIC_STAGING_DB_NAME='si_traffic_staging';
process.env.TRAFFIC_PILOT_ENABLED='true';
process.env.TRAFFIC_STAGING_FRONTEND_URL='https://si-staging-ui.onrender.com/traffic-self-study.html';
const token='isolated-test-token';
const hash=crypto.createHash('sha256').update(token).digest('hex');
const future=new Date(Date.now()+86400000);
let access={
  _id:'mock-access',accessId:'SSA-TRAFFIC-TEST',enrollmentId:'ENR-TRAFFIC-TEST',
  courseSlug:TRAFFIC_SLUG,status:'active',sessionTokenHash:hash,
  sessionExpiresAt:future,accessExpiresAt:future,
  progress:{completedScreens:[],screenScores:{},modules:{},cumulativeQuestions:0,cumulativeCorrect:0,finalAttempts:0,finalBestScore:null,finalPassed:false,finalScores:[]}
};
const touched=[];
const collections={
  selfstudyaccess:{
    findOne:async query=>query.sessionTokenHash===hash&&query.status==='active'?access:null,
    updateOne:async(query,change)=>{touched.push(['selfstudyaccess',change]);Object.assign(access,change.$set||{});return{modifiedCount:1}}
  },
  enrollments:{
    updateOne:async(query,change)=>{touched.push(['enrollments',change]);return{modifiedCount:1}}
  }
};
const mockedMongoose={connection:{db:{databaseName:'si_traffic_staging'},collection:name=>{
  if(!collections[name])throw Error('Unexpected DB collection '+name);
  return collections[name];
}}};
const originalLoad=Module._load;
Module._load=function(request,parent,isMain){
  if(request==='mongoose')return mockedMongoose;
  if(request==='express')return {};
  if(request==='dotenv')return{config(){}};
  if(request==='nodemailer')return{};
  return originalLoad.call(this,request,parent,isMain);
};
let mod;
try{mod=require('../backend/self-study-routes.js')}finally{Module._load=originalLoad}
const handlers=new Map();
const app={
  get:(name,...fn)=>handlers.set('GET '+name,fn),
  post:(name,...fn)=>handlers.set('POST '+name,fn)
};
mod.register(app);
async function call(method,name,{params={},body={}}={}){
  const functions=handlers.get(method+' '+name);
  assert.ok(functions,'Route missing '+name);
  let data,code=200,done=false;
  const response={
    status(n){code=n;return this},
    json(obj){data=obj;done=true;return this}
  };
  const req={headers:{authorization:'Bearer '+token},params,body};
  for(const fn of functions){
    if(done)break;
    let nextCalled=false;
    await fn(req,response,()=>{nextCalled=true});
    if(!nextCalled&&!done)throw Error('Handler did not complete or call next: '+name);
  }
  assert.ok(done,'No response: '+name);
  return {code,data};
}
const yes=(check,msg)=>assert.ok(check,msg);
function hashed(q,accessId,suffix){
  return crypto.createHash('sha256').update(String(q)+'|'+String(accessId)+(suffix||'')).digest('hex');
}
function questionOrder(q,accessId){
  const order=[0,1,2,3],seedKey=String(q.q)+'|'+String(accessId);
  for(let i=3;i>0;i--){
    const seed=parseInt(hashed(seedKey,i,'').slice(0,8),16);
    // Production sha(String(key)+'|'+i); key is q.q+'|'+accessId
    const actual=parseInt(crypto.createHash('sha256').update(seedKey+'|'+i).digest('hex').slice(0,8),16);
    const j=actual%(i+1);
    [order[i],order[j]]=[order[j],order[i]];
  }
  return order;
}
function orderedTrafficBank(attemptIndex){
  return TRAFFIC_FINAL_ASSESSMENT.map((q,i)=>({
    q,i,key:crypto.createHash('sha256').update(access.accessId+'|traffic-final|'+attemptIndex+'|'+q.q).digest('hex')
  })).sort((a,b)=>a.key.localeCompare(b.key)||a.i-b.i).map(x=>x.q);
}
function choose(q,correct){
  const answer=questionOrder(q,access.accessId).indexOf(q.correct);
  return correct?answer:(answer+1)%4;
}
async function run(){
  // Feature must be unavailable without explicit staging-only environment flags,
  // including its public catalog endpoint and registration, before any database work.
  process.env.TRAFFIC_PILOT_ENABLED='false';
  let gated=await call('GET','/api/self-study/courses/:slug',{params:{slug:TRAFFIC_SLUG}});
  assert.equal(gated.code,404);
  gated=await call('POST','/api/self-study/register',{body:{courseSlug:TRAFFIC_SLUG}});
  assert.equal(gated.code,403);
  gated=await call('GET','/api/self-study/me');
  assert.equal(gated.code,403);
  assert.equal(touched.length,0);
  process.env.TRAFFIC_PILOT_ENABLED='true';
  // Even a mistaken flag on production cannot activate Traffic.
  process.env.SI_DEPLOYMENT_ENV='production';
  gated=await call('GET','/api/self-study/courses/:slug',{params:{slug:TRAFFIC_SLUG}});
  assert.equal(gated.code,404,'Traffic must never be available with production environment identity');
  process.env.SI_DEPLOYMENT_ENV='staging';
  // Simulate an accidental connection to the production DB: the pilot must remain OFF.
  mockedMongoose.connection.db.databaseName='si_prod';
  gated=await call('GET','/api/self-study/courses/:slug',{params:{slug:TRAFFIC_SLUG}});
  assert.equal(gated.code,404,'Traffic staging must not be accessible against a different DB');
  mockedMongoose.connection.db.databaseName='si_traffic_staging';
  assert.equal(TRAFFIC_META.finalRetakes,2);
  assert.equal(TRAFFIC_SCREENS.length,10);
  assert.equal(TRAFFIC_FINAL_ASSESSMENT.length,30);
  for(const slug of [FIRE_SLUG,TRAFFIC_SLUG]){
    const c=await call('GET','/api/self-study/courses/:slug',{params:{slug}});
    assert.equal(c.code,200);
    assert.equal(c.data.screenCount,slug===FIRE_SLUG?67:10);
    const list=await call('GET','/api/self-study/courses/:slug/screens',{params:{slug}});
    assert.equal(list.data.screens.length,c.data.screenCount);
    if(slug===TRAFFIC_SLUG)assert.equal(list.data.screens[0].id,TRAFFIC_SCREENS[0].id);
  }
  let resp=await call('GET','/api/self-study/courses/:slug',{params:{slug:'fake-unknown-course'}});
  assert.equal(resp.code,404);
  resp=await call('POST','/api/self-study/register',{body:{courseSlug:TRAFFIC_SLUG}});
  assert.equal(resp.code,400,'Invalid registration must fail before any database writes');
  const trafficFirst=TRAFFIC_SCREENS[0],trafficSecond=TRAFFIC_SCREENS[1];
  resp=await call('GET','/api/self-study/screens/:screenId',{params:{screenId:'m1s1'}});
  assert.equal(resp.code,404,'Traffic session must not see Fire screen');
  resp=await call('GET','/api/self-study/screens/:screenId',{params:{screenId:trafficSecond.id}});
  assert.equal(resp.code,403,'Second screen must be gated before first 80%');
  resp=await call('GET','/api/self-study/screens/:screenId',{params:{screenId:trafficFirst.id}});
  assert.equal(resp.code,200);
  assert.equal(resp.data.questions.length,5);
  assert.equal(resp.data.videoUrl,'','No unapproved Traffic video may be served from staging');
  const firstAnswers=trafficFirst.questions.map((q,i)=>choose(q,i<3));
  resp=await call('POST','/api/self-study/screens/:screenId/assessment',{params:{screenId:trafficFirst.id},body:{answers:firstAnswers}});
  assert.equal(resp.code,200);
  assert.equal(resp.data.score,60);assert.equal(resp.data.passed,false);
  resp=await call('GET','/api/self-study/screens/:screenId',{params:{screenId:trafficSecond.id}});
  assert.equal(resp.code,403,'60% must not unlock next screen');
  resp=await call('POST','/api/self-study/screens/:screenId/assessment',{params:{screenId:trafficFirst.id},body:{answers:trafficFirst.questions.map(q=>choose(q,true))}});
  assert.equal(resp.data.score,100);assert.equal(resp.data.passed,true);
  resp=await call('GET','/api/self-study/screens/:screenId',{params:{screenId:trafficSecond.id}});
  assert.equal(resp.code,200,'>=80% must unlock next screen');
  resp=await call('GET','/api/self-study/final-assessment');
  assert.equal(resp.data.total,30);
  assert.equal(resp.data.attemptsRemaining,2);
  const firstOrder=resp.data.questions.map(q=>q.q);
  assert.deepEqual(firstOrder,orderedTrafficBank(0).map(q=>q.q),'Traffic question order must match server deterministic shuffle');
  assert.notDeepEqual(firstOrder,TRAFFIC_FINAL_ASSESSMENT.map(q=>q.q),'Traffic questions must be randomized');
  resp=await call('POST','/api/self-study/final-assessment',{body:{answers:Array(30).fill(0)}});
  assert.equal(resp.code,403,'Final exam must be locked until all 10 Traffic screens mastered');
  access.progress.screenScores=Object.fromEntries(TRAFFIC_SCREENS.map(s=>[s.id,{score:80,questions:5,correct:4}]));
  resp=await call('POST','/api/self-study/final-assessment',{body:{answers:orderedTrafficBank(0).map(q=>choose(q,false))}});
  assert.equal(resp.code,200);
  assert.equal(resp.data.passed,false);
  assert.equal(resp.data.attemptsRemaining,1);
  resp=await call('POST','/api/self-study/final-assessment',{body:{answers:orderedTrafficBank(1).map(q=>choose(q,false))}});
  assert.equal(resp.code,200);
  assert.equal(resp.data.attemptsRemaining,0);
  resp=await call('POST','/api/self-study/final-assessment',{body:{answers:orderedTrafficBank(2).map(q=>choose(q,true))}});
  assert.equal(resp.code,403,'Traffic final retake limit must stop third attempt');
  // Simulate a new Traffic learner who has mastered every screen and passes 21/30.
  // The mocked certificate module proves the ID is retained without issuing a real certificate.
  access={...access,progress:{...access.progress,finalAttempts:0,finalPassed:false,finalScores:[],certificateId:null}};
  let issued=[];
  Module._load=function(request,parent,isMain){
    if(request==='./training-certificate-routes.js')return{issueForEnrollment:async enrollmentId=>{
      issued.push(enrollmentId);
      return {certificateId:'SI-TRAFFIC-MOCK-CERT-1'};
    }};
    return originalLoad.call(this,request,parent,isMain);
  };
  try{
    resp=await call('POST','/api/self-study/final-assessment',{
      body:{answers:orderedTrafficBank(0).map((q,i)=>choose(q,i<21))}
    });
  }finally{Module._load=originalLoad}
  assert.equal(resp.code,200);
  assert.equal(resp.data.score,70);
  assert.equal(resp.data.passed,true);
  assert.equal(resp.data.certificateId,'SI-TRAFFIC-MOCK-CERT-1');
  assert.deepEqual(issued,['ENR-TRAFFIC-TEST']);
  assert.equal(access.progress.certificateId,'SI-TRAFFIC-MOCK-CERT-1','Traffic certificate must persist in progress after issuing');
  resp=await call('GET','/api/self-study/me');
  assert.equal(resp.data.certificateId,'SI-TRAFFIC-MOCK-CERT-1');
  const trafficProgress=access.progress;
  // Regression: unchanged legacy Fire Safety still exposes 67 screens and three final attempts.
  access={...access,courseSlug:FIRE_SLUG,progress:{...trafficProgress,screenScores:{},finalAttempts:0,finalScores:[],finalPassed:false}};
  resp=await call('GET','/api/self-study/me');
  assert.equal(resp.code,200);
  assert.ok(resp.data.assessedScreens>0&&resp.data.assessedScreens<=67);
  assert.equal(resp.data.attemptsRemaining,3,'Fire Safety must retain 3 attempts');
  resp=await call('GET','/api/self-study/screens/:screenId',{params:{screenId:trafficFirst.id}});
  assert.equal(resp.code,404,'Fire learner must not see Traffic screen');
  assert.equal(touched.filter(item=>item[0]==='enrollments').length,1,'Only the mocked passing learner enrollment may be updated');
  console.log('PASS: default-disabled Traffic stage gate; Fire 67 screens; Traffic 10; user isolation; 80% gating; 30-question exam; Traffic 2 attempts; Fire 3 attempts; mock 70% certificate persistence; no live DB/email/certificate writes');
}
run().catch(e=>{console.error(e);process.exitCode=1});
