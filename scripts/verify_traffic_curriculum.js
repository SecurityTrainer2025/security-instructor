#!/usr/bin/env node
// Integration test. Use only the disposable local Mongo instance on port 27019.
const assert = require('node:assert/strict');
const {createHash, randomUUID} = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {setTimeout: delay} = require('node:timers/promises');
const backend = path.resolve(__dirname, '../backend');
const frontend = path.resolve(__dirname, '../frontend');
const mongoose = require(path.join(backend, 'node_modules/mongoose'));
const {TRAFFIC_SLUG, TRAFFIC_SCREENS} = require(path.join(backend, 'self-study-traffic-config'));
const curriculum = require(path.join(backend, 'traffic-course-curriculum'));
const email = 'traffic-qa@example.test';
const adminEmail = 'admin-qa@example.test';
const password = randomUUID();
const productionMode=process.argv.includes('--production-mode');
const recoverLegacy=process.argv.includes('--recover-legacy');
const autoCertificate=process.argv.includes('--auto-cert');
const trafficUi=productionMode
  ?'https://securitytrainer2025.github.io/security-instructor/frontend'
  :'https://si-staging-ui.onrender.com';
const verifier=productionMode?'traffic-certificate':'traffic-staging-certificate';
const database = (productionMode?'si_traffic_release_qa_':'si_traffic_staging_qa_') + randomUUID().replaceAll('-', '');
const root = 'http://127.0.0.1:5000';
const api = '/api/self-study';
Object.assign(process.env,{
  PORT:'5000', FRONTEND_URL:'http://127.0.0.1:8000',
  MONGODB_URI:'mongodb://127.0.0.1:27019/'+database,
  SI_DEPLOYMENT_ENV:productionMode?'production':'staging', SI_TRAFFIC_STAGING_DB_NAME:productionMode?'si_traffic_staging_qa':database,
  SI_TRAFFIC_PRODUCTION_DB_NAME:productionMode?database:'', TRAFFIC_PRODUCTION_ENABLED:'false',
  TRAFFIC_PRODUCTION_REGISTRATION_ENABLED:'false', TRAFFIC_PRODUCTION_CERTIFICATES_ENABLED:'false',
  TRAFFIC_PILOT_ENABLED:'true', TRAFFIC_CERTIFICATES_ENABLED:'true',
  TRAFFIC_STAGING_FRONTEND_URL:'https://si-staging-ui.onrender.com/traffic-self-study.html',
  SI_QA_TEST_EMAIL:email, BREVO_API_KEY:'qa-stub', MAIL_FROM:'si@example.test',
  ADMIN_EMAIL:adminEmail, ADMIN_PASSWORD:password, ADMIN_SESSION_SECRET:randomUUID()
});

const mail=[];
const nativeFetch=global.fetch;
global.fetch=async(url,options)=>{
  if(url==='https://api.brevo.com/v3/smtp/email'){
    mail.push(JSON.parse(options.body));
    return new Response('{}',{status:201});
  }
  assert.equal(new URL(url).origin,root,'Unexpected outbound request in QA');
  return nativeFetch(url,options);
};

async function request(route,{body,token,status=200,releaseCheck=false,method}={}){
  const r=await fetch(root+route,{
    method:method||(body===undefined?'GET':'POST'),
    headers:{...(route.startsWith('/api/admin/')||releaseCheck?{'X-Forwarded-For':'192.0.2.10'}:route.startsWith(api+'/screens/')?{'X-Forwarded-For':'192.0.2.11'}:{}),...(token?{Authorization:'Bearer '+token}:{}),...(body===undefined?{}:{'Content-Type':'application/json'})},
    body:JSON.stringify(body)
  });
  const data=await r.text();
  assert.equal(r.status,status,route+': '+data.slice(0,350));
  return JSON.parse(data);
}

const slugFire='fire-safety-emergency-response';
const hash=value=>createHash('sha256').update(value).digest('hex');
const bank=curriculum.banks.final;
const getAnswers=(items,questions)=>items.map(item=>{
  const expected=questions.find(q=>q.q===item.q);
  assert.ok(expected,item.q);
  const selected=item.options.indexOf(expected.a[expected.correct]);
  assert.ok(selected>=0,item.q);
  return selected;
});

async function verifyTrainingBatches(db){
  const registration = suffix => ({
    courseSlug:TRAFFIC_SLUG, arabicName:'أحمد محمد علي', englishName:'QA Batch Learner',
    email, idType:'passport', idNumber:'QA-BATCH-'+suffix, mobile:'+10000000000', consent:true
  });
  const batchFields = {
    courseId:'CRS-TRAFFIC-001',courseNameEn:'Traffic',courseNameAr:'المرور',
    trainingType:'self-study',capacity:1
  };
  const [first,second]=await Promise.all([1,2].map(()=>request('/api/admin/batches',{body:batchFields,status:401})));
  assert.ok(first.message&&second.message);
  const login=await request('/api/admin/login',{body:{email:adminEmail,password}});
  const token=login.token;
  assert.ok(token);
  const batch=await request('/api/admin/batches',{body:batchFields,token,status:201});
  assert.match(batch.batchId,/^TRAFFIC-\d{4}-B001$/);
  const register = suffix => nativeFetch(root+api+'/register',{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(registration(suffix))
  });
  const responses=await Promise.all(['A','B','C','D','E','F'].map(register));
  assert.deepEqual(responses.map(response=>response.status).sort(),[201,409,409,409,409,409]);
  const winner=await responses.find(response=>response.status===201).json();
  assert.equal(winner.batchId,batch.batchId);
  assert.match(winner.enrollmentId,/^ENR-\d+$/);
  assert.match(winner.registrationAlias,/^TRAFFIC-\d{4}-0001$/);
  assert.equal(await db.collection('enrollments').countDocuments({batchId:batch.batchId}),1);
  assert.equal(await db.collection('trainees').countDocuments({idNumber:/^QA-BATCH-/}),1);
  assert.match(mail[0].htmlContent,/dir="rtl"/);
  assert.match(mail[0].textContent,new RegExp(winner.registrationAlias));
  assert.match(mail[0].textContent,/Single-use|single-use/);
  const batchPath='/api/admin/batches/'+batch.batchId;
  await request(batchPath,{body:{capacity:2,status:'closed'},token,method:'PATCH'});
  assert.equal((await register('CLOSED')).status,409);
  await request(batchPath,{body:{status:'open',registrationOpensAt:new Date(Date.now()+3600000).toISOString()},token,method:'PATCH'});
  assert.equal((await register('FUTURE')).status,409);
  await request(batchPath,{body:{registrationOpensAt:null,registrationClosesAt:new Date(Date.now()-3600000).toISOString()},token,method:'PATCH'});
  assert.equal((await register('PAST')).status,409);
  await request(batchPath,{body:{registrationClosesAt:null},token,method:'PATCH'});
  const next=await Promise.all([register('SAME'),register('SAME')]);
  assert.deepEqual(next.map(response=>response.status),[201,201]);
  const [left,right]=await Promise.all(next.map(response=>response.json()));
  assert.equal(left.enrollmentId,right.enrollmentId);
  assert.equal(left.registrationAlias,right.registrationAlias);
  await request(batchPath,{body:{capacity:1},token,method:'PATCH',status:409});
  const fireBatch=await request('/api/admin/batches',{body:{...batchFields,courseId:'CRS-FIRE-001',
    courseNameEn:'Fire Safety',courseNameAr:'السلامة من الحرائق'},token,status:201});
  assert.match(fireBatch.batchId,/^FIRE-\d{4}-B001$/);
  const scope='courseId='+encodeURIComponent(TRAFFIC_SLUG)+'&batch='+encodeURIComponent(batch.batchId);
  for(const q of [winner.enrollmentId,winner.registrationAlias,'QA Batch Learner','أحمد محمد']){
    const rows=await request('/api/admin/enrollments?'+scope+'&q='+encodeURIComponent(q),{token});
    assert.ok(rows.some(row=>row.enrollmentId===winner.enrollmentId),q);
  }
  const wrongScope=await request('/api/admin/enrollments?courseId=CRS-FIRE-001&batch='+batch.batchId,{token});
  assert.deepEqual(wrongScope,[]);
  await request(api+'/access/request',{body:{courseSlug:TRAFFIC_SLUG,enrollmentId:winner.registrationAlias,email}});
  assert.match(mail.at(-1).textContent,new RegExp(winner.enrollmentId));
  console.log('Training batch QA passed: race, duplicate registration, scope, authorization, date and capacity controls, bilingual mail and alias recovery.');
}

async function run(){
  for(const name of [
    'admin-runtime','site-content-runtime','course-management-routes','document-registry-routes',
    'certificate-admin-list-routes','training-certificate-routes','enrollment-management-routes',
    'batch-management-routes','operations-routes','reports-routes','start'
  ])require(path.join(backend,name));
  for(let i=0;mongoose.connection.readyState!==1&&i<40;i++)await delay(250);
  assert.equal(mongoose.connection.db?.databaseName,database);
  const db=mongoose.connection;
  const access=db.collection('selfstudyaccess');
  const enrollments=db.collection('enrollments');
  const trainees=db.collection('trainees');
  const certificateStore=db.collection('trainingcertificates');
  if(process.argv.includes('--batch-qa')){await verifyTrainingBatches(db);return;}
  const protection=['CRS-FIRE-001','CRS-CROWD-001','CRS-VEHICLE-001','CRS-PERSON-001'];
  for(const [i,courseId] of protection.entries()){
    await enrollments.insertOne({enrollmentId:'QA-OTHER-'+i,courseId,status:'completed'});
    await certificateStore.insertOne({certificateId:'SI-CERT-QA-OTHER-'+i,enrollmentId:'QA-OTHER-'+i,
      traineeId:'QA-OTHER-TRAINEE-'+i,courseId,verificationStatus:'valid'});
  }
  const otherCourses=await enrollments.find({courseId:{$in:protection}}).sort({enrollmentId:1}).toArray();
  const otherCertificates=await certificateStore.find({courseId:{$in:protection}}).sort({enrollmentId:1}).toArray();
  const oldSession=randomUUID();
  const oldProgress={
    screenScores:{tm1s2:{score:100,questions:5,correct:5}},completedScreens:['tm1s2'],
    finalAttempts:1,finalBestScore:50
  };
  await access.insertOne({
    enrollmentId:'QA-LEGACY-TRAFFIC',courseSlug:TRAFFIC_SLUG,accessId:'QA-LEGACY',
    accessStartsAt:new Date(),accessExpiresAt:new Date(Date.now()+120*3600000),
    sessionTokenHash:hash(oldSession),sessionExpiresAt:new Date(Date.now()+3600000),
    status:'active',progress:oldProgress
  });
  if(productionMode){
    const availability=()=>request(api+'/traffic-availability',{releaseCheck:true});
    assert.deepEqual(await availability(),{available:false,registrationOpen:false});
    process.env.TRAFFIC_PRODUCTION_ENABLED='true';
    assert.deepEqual(await availability(),{available:true,registrationOpen:false});
    await request(api+'/register',{body:{courseSlug:TRAFFIC_SLUG},status:403,releaseCheck:true});
    const databaseName=process.env.SI_TRAFFIC_PRODUCTION_DB_NAME;
    process.env.SI_TRAFFIC_PRODUCTION_DB_NAME='unrelated_database';
    assert.deepEqual(await availability(),{available:false,registrationOpen:false});
    process.env.SI_TRAFFIC_PRODUCTION_DB_NAME=databaseName;
    process.env.TRAFFIC_PRODUCTION_REGISTRATION_ENABLED='true';
    assert.deepEqual(await availability(),{available:true,registrationOpen:true});
  }
  const old=await request(api+'/me',{token:oldSession});
  assert.equal(old.lessons.length,10);
  assert.equal(old.attemptsRemaining,1);
  assert.equal(old.course.modules.length,5);
  assert.deepEqual(old.progress,oldProgress);
  await request(api+'/screens/tm1s3',{token:oldSession,status:404});

  const v2Token=randomUUID();
  await access.insertOne({enrollmentId:'QA-EXPANDED-LEGACY',courseSlug:TRAFFIC_SLUG,curriculumVersion:2,
    accessStartsAt:new Date(),accessExpiresAt:new Date(Date.now()+120*3600000),status:'active',
    sessionTokenHash:hash(v2Token),sessionExpiresAt:new Date(Date.now()+3600000),progress:oldProgress});
  const existingExpanded=await request(api+'/me',{token:v2Token,releaseCheck:true});
  assert.equal(existingExpanded.lessons.length,40);
  assert.equal(existingExpanded.assessedScreens,35);
  assert.deepEqual(existingExpanded.progress,oldProgress);

  const catalog=await request(api+'/courses/'+TRAFFIC_SLUG);
  assert.equal(catalog.screenCount,40);
  assert.deepEqual(catalog.assessmentCounts,{diagnostic:10,lessons:200,units:80,final:30,feedback:10});
  assert.equal(catalog.modules.length,8);
  assert.ok(catalog.introduction.en&&catalog.introduction.ar);
  const fire=await request(api+'/courses/'+slugFire);
  assert.equal(fire.code,'CRS-FIRE-001');

  const profile={courseSlug:TRAFFIC_SLUG,arabicName:'متدرب تجريبي محلي',
    englishName:'Local Traffic Learner',email,idType:'passport',idNumber:'QA-TRAFFIC-001',mobile:'0000000000'};
  let legacyEnrollment;
  if(productionMode){
    await trainees.insertOne({traineeId:'QA-PREVIOUS-TRAFFIC',email,idType:profile.idType,idNumber:'QA-PREVIOUS-TRAFFIC'});
    legacyEnrollment={enrollmentId:'QA-PREVIOUS-TRAFFIC',traineeId:'QA-PREVIOUS-TRAFFIC',
      courseId:'CRS-TRAFFIC-001',status:'cancelled'};
    await enrollments.insertOne({...legacyEnrollment});
    await request(api+'/register',{body:{...profile,idNumber:'QA-PREVIOUS-TRAFFIC'},status:409,releaseCheck:true});
  }
  await request('/api/course-registration',{body:{courseSlug:TRAFFIC_SLUG},status:409,releaseCheck:true});
  let registration;
  if(recoverLegacy){
    const traineeId='QA-TRAFFIC-RECOVERY';
    const enrollmentId='ENR-000017';
    const former={enrollmentId,traineeId,courseId:'CRS-TRAFFIC-001',status:'pending',score:6};
    await trainees.insertOne({traineeId,idNumber:profile.idNumber,idType:profile.idType,email,
      englishFirstName:'Local',englishMiddleName:'Traffic',englishLastName:'Learner'});
    await enrollments.insertOne({...former});
    const recovery={enrollmentId,courseSlug:TRAFFIC_SLUG,email};
    await request(api+'/access/request',{body:{...recovery,email:'incorrect@example.test'},releaseCheck:true});
    assert.equal(await access.countDocuments({enrollmentId}),0);
    assert.equal(mail.length,0);
    await request(api+'/access/request',{body:recovery,releaseCheck:true});
    await request(api+'/access/request',{body:recovery,releaseCheck:true});
    assert.equal(await access.countDocuments({enrollmentId}),1);
    assert.equal(await enrollments.countDocuments({enrollmentId}),1);
    const {_id,...stored}=await enrollments.findOne({enrollmentId});
    assert.deepEqual(stored,former);
    registration={enrollmentId};
  }else{
    registration=await request(api+'/register',{body:profile,status:201});
    assert.equal(registration.mailSent,true);
  }
  assert.equal(mail.length,1);
  assert.deepEqual(mail[0].to,[{email}]);
  assert.match(mail[0].textContent,/40 lessons across 8 units/);
  assert.ok(mail[0].textContent.includes(registration.enrollmentId));
  assert.doesNotMatch(mail[0].textContent,/docs\.google|slides\.google|thank-you/);

  const accessLink=mail[0].textContent.split(/\s+/).find(word=>word.startsWith('https://'));
  assert.ok(accessLink);
  const accessUrl=new URL(accessLink);
  assert.equal(accessUrl.origin+accessUrl.pathname,trafficUi+'/traffic-self-study.html');
  assert.equal(accessUrl.searchParams.get('course'),TRAFFIC_SLUG);
  const magic=new URLSearchParams(accessUrl.hash.slice(1)).get('token');
  assert.ok(magic);
  const session=await request(api+'/session/exchange',{body:{token:magic}});
  await request(api+'/session/exchange',{body:{token:magic},status:401});
  const token=session.sessionToken;
  assert.ok(token);
  const enrollmentId=registration.enrollmentId;
  if(recoverLegacy){
    const linked=await enrollments.findOne({enrollmentId});
    assert.equal(linked.selfStudy,true);
    assert.equal(linked.score,6);
    assert.equal(linked.status,'pending');
    assert.equal((await access.findOne({enrollmentId})).legacyEnrollmentScore,6);
  }
  const profileBefore=await trainees.findOne({idNumber:profile.idNumber});
  await request(api+'/register',{body:{...profile,email:'other@example.test'},status:409});
  assert.deepEqual(await trainees.findOne({_id:profileBefore._id}),profileBefore);
  assert.equal(mail.length,1);

  const me=await request(api+'/me',{token});
  assert.equal(me.lessons.filter(item=>!item.kind).length,40);
  assert.equal(me.lessons.filter(item=>item.kind==='unit-assessment').length,8);
  assert.equal(me.assessedScreens,48);
  assert.equal((await access.findOne({enrollmentId})).curriculumVersion,curriculum.CURRICULUM_VERSION);
  await request(api+'/screens/tm8s5',{token,status:403});
  await request(api+'/final-assessment',{token,status:403});
  await request(api+'/traffic-feedback',{token,status:403});
  await request(api+'/certificate',{token,body:{},status:403});

  const diagnosticRoute=api+'/traffic-initial-assessment';
  await request(api+'/screens/tm1s1',{token,status:403});
  await request(diagnosticRoute,{token:oldSession,status:404});
  const diagnostic=await request(diagnosticRoute,{token});
  assert.equal(diagnostic.questions.length,10);
  assert.deepEqual(new Set(diagnostic.questions.map(q=>q.q)),new Set(curriculum.banks.diagnostic.map(q=>q.q)));
  await request(diagnosticRoute,{token,body:{answers:Array(10).fill(null)},status:400});
  const initial=await request(diagnosticRoute,{token,body:{answers:getAnswers(diagnostic.questions,curriculum.banks.diagnostic)}});
  assert.equal(initial.result.score,100);
  assert.deepEqual(await request(diagnosticRoute,{token,body:{answers:Array(10).fill(0)}}),initial);
  assert.deepEqual((await request(api+'/me',{token})).initialAssessment,initial.result);

  const videos=new Set();
  for(const [i,lesson] of me.lessons.entries()){
    const route=api+'/screens/'+lesson.id;
    const screen=await request(route,{token});
    assert.equal(screen.id,lesson.id);
    assert.ok(screen.bodyAr&&screen.bodyEn);
    assert.equal(screen.questions.length,lesson.kind==='unit-assessment'?10:5);
    if(lesson.kind==='unit-assessment'&&i+1<me.lessons.length){
      await request(api+'/screens/'+me.lessons[i+1].id,{token,status:403});
      const wrongUnit=getAnswers(screen.questions,curriculum.sequence[i].questions).map(a=>(a+1)%4);
      const failedUnit=await request(route+'/assessment',{token,body:{answers:wrongUnit}});
      assert.equal(failedUnit.passed,false);
    }
    if(!lesson.kind)assert.equal(screen.diagram.length,3);
    if(screen.siteMap)assert.ok(fs.existsSync(path.join(frontend,screen.siteMap)));
    if(screen.supplementalVideo)assert.ok(fs.existsSync(path.join(frontend,screen.supplementalVideo)));
    if(screen.approvedVideo){
      videos.add(screen.videoUrl);
      assert.ok(fs.existsSync(path.join(frontend,screen.videoUrl)));
      assert.ok(fs.existsSync(path.join(frontend,screen.videoUrl.replace(/\.mp4$/,'.en.vtt'))));
      assert.ok(fs.existsSync(path.join(frontend,screen.imageUrl)));
    }
    if(!lesson.assessmentRequired)continue;
    const questions=curriculum.sequence[i].questions;
    const answers=getAnswers(screen.questions,questions);
    const result=await request(route+'/assessment',{token,body:{answers}});
    assert.equal(result.score,100);
    if(lesson.id==='tm1s2'){
      await request(route+'/assessment',{token,body:{answers:answers.map(a=>(a+1)%4)}});
      const progress=await request(api+'/me',{token});
      assert.equal(progress.progress.screenScores.tm1s2.score,100);
      assert.equal(progress.progress.screenScores.tm1s2.attempts,2);
    }
  }
  assert.equal(videos.size,10);
  assert.equal((await request(api+'/me',{token})).learningMastered,true);
  const survey=await request(api+'/traffic-feedback',{token});
  assert.equal(survey.questions.length,10);
  assert.equal(new Set(survey.questions.map(q=>q.en)).size,10);
  assert.equal(new Set(survey.questions.map(q=>q.ar)).size,10);
  await request(api+'/traffic-feedback',{token,body:{answers:Array(10).fill(5)}});

  const final=await request(api+'/final-assessment',{token});
  assert.equal(final.questions.length,30);
  assert.equal(new Set(final.questions.map(q=>q.q)).size,30);
  assert.deepEqual(new Set(final.questions.map(q=>q.q)),new Set(bank.map(q=>q.q)));
  const learningStems=new Set(curriculum.sequence.flatMap(screen=>screen.questions.map(q=>q.q)));
  assert.ok(final.questions.every(q=>!learningStems.has(q.q)));
  const examRoute=api+'/traffic-exam-window';
  const submit=api+'/final-assessment';
  await request(submit,{token,body:{attempt:0,answers:Array(30).fill(0)},status:409});
  const firstExam=await request(examRoute,{token,body:{}});
  assert.equal(firstExam.attempt,0);
  assert.ok(Math.abs(new Date(firstExam.deadline).getTime()-firstExam.serverNow-3600000)<5000);
  const firstCorrect=getAnswers(final.questions,bank);
  const partial=firstCorrect.map((value,i)=>i===0?value:-1);
  await request(submit,{token,body:{attempt:0,answers:partial},status:400});
  await request(examRoute,{token,body:{attempt:0,answers:partial}});
  const resumed=await request(examRoute,{token,body:{}});
  assert.deepEqual(resumed.answers,partial);
  assert.equal(resumed.deadline,firstExam.deadline);
  await access.updateOne({enrollmentId},{$set:{'trafficExam.deadline':new Date(Date.now()-1000)}});
  const expired=await request(submit,{token,body:{attempt:0,answers:firstCorrect}});
  assert.equal(expired.correct,1);
  assert.equal(expired.attemptsRemaining,2);

  await request(examRoute,{token,body:{attempt:0,answers:partial},status:400});
  const second=await request(api+'/final-assessment',{token});
  await request(examRoute,{token,body:{}});
  const wrong=getAnswers(second.questions,bank).map(a=>(a+1)%4);
  const failed=await request(submit,{token,body:{attempt:1,answers:wrong}});
  assert.equal(failed.score,0);
  assert.equal(failed.attemptsRemaining,1);
  const retake=await request(api+'/final-assessment',{token});
  await request(examRoute,{token,body:{}});
  assert.notDeepEqual(retake.questions,final.questions);
  assert.ok(retake.questions.some(q=>{
    const first=final.questions.find(question=>question.q===q.q);
    return first&&first.options.join('|')!==q.options.join('|');
  }));
  if(productionMode&&autoCertificate)process.env.TRAFFIC_PRODUCTION_CERTIFICATES_ENABLED='true';
  const passed=await request(api+'/final-assessment',{token,body:{attempt:retake.attempts,answers:getAnswers(retake.questions,bank)}});
  assert.equal(passed.score,100);
  let id=passed.certificateId;
  if(productionMode){
    if(autoCertificate){
      assert.ok(id,'Passing the exam must issue the certificate without an admin action');
    }else{
      assert.equal(id,null);
      await request(api+'/certificate',{token,body:{},status:503,releaseCheck:true});
      process.env.TRAFFIC_PRODUCTION_CERTIFICATES_ENABLED='true';
      id=(await request(api+'/certificate',{token,body:{},releaseCheck:true})).certificateId;
    }
    const stored=await certificateStore.findOne({certificateId:id});
    assert.equal(stored.trafficSelfStudy,true);
    assert.equal(stored.verificationUrl,trafficUi+'/traffic-verify.html?id='+id);
    process.env.TRAFFIC_PRODUCTION_CERTIFICATES_ENABLED='false';
    process.env.TRAFFIC_PRODUCTION_REGISTRATION_ENABLED='false';
    assert.deepEqual(await request(api+'/traffic-availability',{releaseCheck:true}),{available:true,registrationOpen:false});
  }
  assert.ok(id);
  assert.equal((await request(api+'/me',{token})).certificateId,id);
  if(!productionMode)assert.equal((await request(api+'/certificate',{token,body:{}})).certificateId,id);
  const verified=await request('/api/verify/'+verifier+'?id='+id,{releaseCheck:true});
  assert.equal(verified.valid,true);
  assert.equal(verified.score,undefined);
  const display=await request('/api/verify/'+verifier+'?id='+id+'&view=certificate',{releaseCheck:true});
  assert.equal(display.durationHours,24);
  assert.equal(display.passScore,70);
  assert.equal(display.score,100);
  assert.deepEqual(display.trainingTopics.map(({en,ar})=>[en,ar]),curriculum.meta.modules.map(({en,ar})=>[en,ar]));
  if(productionMode){
    await request('/api/verify/traffic-staging-certificate?id='+id,{status:404,releaseCheck:true});
    const legacyTraffic={certificateId:'SI-CERT-QA-LEGACY-TRAFFIC',enrollmentId:'QA-OLD-OFFLINE',
      traineeId:'QA-LEGACY',courseId:'CRS-TRAFFIC-001',verificationStatus:'valid'};
    await certificateStore.insertOne(legacyTraffic);
    assert.equal((await request('/api/verify/training-certificate?id='+legacyTraffic.certificateId,{releaseCheck:true})).valid,true);
    await request('/api/verify/traffic-certificate?id='+legacyTraffic.certificateId,{status:404,releaseCheck:true});
  }
  assert.equal(verified.courseId,'CRS-TRAFFIC-001');
  for(const field of ['email','traineeId','idNumber','idType'])assert.equal(verified[field],undefined);
  await request('/api/verify/training-certificate?id='+id,{status:404});
  await request('/api/training-certificates/'+id,{status:404});
  const qr=await fetch(root+'/api/training-certificates/'+id+'/qr');
  assert.equal(qr.status,200);
  assert.match(qr.headers.get('content-type'),/^image\/(png|svg\+xml)/);
  assert.equal(qr.headers.get('cross-origin-resource-policy'),'cross-origin');
  assert.ok((await qr.arrayBuffer()).byteLength>100);
  assert.equal(mail.length,2);
  assert.ok(mail[1].textContent.includes(trafficUi+'/traffic-verify.html?id='+id));

  await request('/api/admin/enrollments',{status:401});
  const admin=await request('/api/admin/login',{body:{email:adminEmail,password}});
  assert.equal((await request('/api/admin/me',{token:admin.token})).role,'admin');
  const enrollmentList=await request('/api/admin/enrollments?q='+enrollmentId,{token:admin.token});
  assert.ok(JSON.stringify(enrollmentList).includes(enrollmentId));
  await request('/api/admin/traffic-self-study/'+enrollmentId,{status:401});
  await request('/api/admin/traffic-self-study/QA-OTHER-0',{token:admin.token,status:404});
  const results=await request('/api/admin/traffic-self-study/'+enrollmentId,{token:admin.token});
  assert.equal(results.initial.score,100);
  assert.equal(results.lessons.length,48);
  assert.equal(results.lessons.filter(item=>item.kind==='unit-assessment').length,8);
  assert.ok(results.lessons.every(lesson=>lesson.score===100));
  assert.deepEqual(results.feedback.answers,Array(10).fill(5));
  assert.deepEqual(results.finalScores.map(x=>x.score),[3,0,100]);
  assert.equal(results.certificate.certificateId,id);
  const certificates=await request('/api/admin/certificates/list',{token:admin.token});
  assert.ok(JSON.stringify(certificates).includes(id));

  assert.deepEqual(await enrollments.find({courseId:{$in:protection}}).sort({enrollmentId:1}).toArray(),otherCourses);
  assert.deepEqual(await certificateStore.find({courseId:{$in:protection}}).sort({enrollmentId:1}).toArray(),otherCertificates);
  for(const previous of otherCertificates){
    const check=await request('/api/verify/training-certificate?id='+previous.certificateId,{releaseCheck:true});
    assert.equal(check.valid,true);
    assert.equal(check.certificateId,previous.certificateId);
    const details=await request('/api/training-certificates/'+previous.certificateId,{releaseCheck:true});
    assert.equal(details.certificateId,previous.certificateId);
    assert.equal(details.courseId,previous.courseId);
    const image=await fetch(root+'/api/training-certificates/'+previous.certificateId+'/qr',{
      headers:{'X-Forwarded-For':'192.0.2.10'}
    });
    assert.equal(image.status,200);
    assert.ok((await image.arrayBuffer()).byteLength>100);
  }
  assert.deepEqual((await request(api+'/me',{token:oldSession})).progress,oldProgress);
  if(legacyEnrollment){
    const {_id,...previous}=await enrollments.findOne({enrollmentId:legacyEnrollment.enrollmentId});
    assert.deepEqual(previous,legacyEnrollment);
  }
  assert.equal(TRAFFIC_SCREENS.length,10);
  console.log((productionMode?'production-mode ':'staging-mode ')+'PASS: 40 lessons, initial assessment, registration and mocked access email, saved progress, feedback, timed draft/resume/expiry, shuffled final and two retakes, mocked certificate email, QR response, protected admin results and legacy records');
}

run().catch(error=>{
  console.error(error);
  process.exitCode=1;
}).finally(async()=>{
  if(mongoose.connection.db?.databaseName===database)await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  process.exit(process.exitCode||0);
});
