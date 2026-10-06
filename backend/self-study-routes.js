const express=require('express');
const mongoose=require('mongoose');
const crypto=require('crypto');
const nodemailer=require('nodemailer');
require('dotenv').config();

const FRONTEND_URL=(process.env.SELF_STUDY_FRONTEND_URL||'https://securitytrainer2025.github.io/security-instructor/frontend/fire-safety-self-study.html').trim();
const ACCESS_HOURS=Number(process.env.SELF_STUDY_ACCESS_HOURS||72);
const MAGIC_MINUTES=15;
const SESSION_HOURS=Number(process.env.SELF_STUDY_SESSION_HOURS||72);
const FIRE_SLUG='fire-safety-emergency-response';
const COURSE_META={
  [FIRE_SLUG]:{
    code:'CRS-FIRE-001',
    en:'FIRE SAFETY & EMERGENCY RESPONSE',
    ar:'السلامة من الحرائق وتدابير الاستجابة للطوارئ',
    mode:'self-study',
    freeOpening:true,
    accessHours:ACCESS_HOURS,
    masteryScore:80,
    finalQuestions:30,
    finalPassScore:70,
    finalRetakes:2,
    modules:[
      {id:'m1',en:'Fundamentals of Fire Science & Building Hazards',ar:'أساسيات علوم الحريق ومخاطر المنشآت'},
      {id:'m2',en:'Fire Classifications & Portable Extinguishing Agents',ar:'تصنيف الحرائق ووسائط الإطفاء المحمولة'},
      {id:'m3',en:'Fire Detection, Alarms & Suppression Systems',ar:'أنظمة كشف وإنذار وإطفاء الحريق'},
      {id:'m4',en:'Tactical Response & Facility Fire Plans',ar:'الاستجابة التكتيكية وخطط الطوارئ بالمنشآت'},
      {id:'m5',en:'Emergency Evacuation & Incident Command',ar:'الإخلاء الطارئ وإدارة الحوادث'}
    ]
  }
};

const sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
const clean=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
const validEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const randomToken=bytes=>crypto.randomBytes(bytes).toString('hex');

function mailTransport(){
  const user=(process.env.MAIL_FROM||process.env.ADMIN_EMAIL||'').trim();
  const clientId=(process.env.MS_CLIENT_ID||'').trim();
  const clientSecret=(process.env.MS_CLIENT_SECRET||'').trim();
  const refreshToken=(process.env.MS_REFRESH_TOKEN||'').trim();
  if(!user||!clientId||!clientSecret||!refreshToken)return null;
  return nodemailer.createTransport({
    host:'smtp-mail.outlook.com',port:587,secure:false,
    auth:{type:'OAuth2',user,clientId,clientSecret,refreshToken}
  });
}

async function nextNumber(collection,prefix,field){
  const last=await collection.findOne({[field]:new RegExp('^'+prefix+'\\d+$')}).sort({[field]:-1});
  return prefix+String(last?parseInt(String(last[field]).slice(prefix.length),10)+1:1).padStart(6,'0');
}

function baseProgress(){
  return {modules:{},completedScreens:[],screenScores:{},cumulativeCorrect:0,cumulativeQuestions:0,finalAttempts:[],finalBestScore:null,finalPassed:false};
}

async function sendAccessEmail({to,name,course,token,expiresAt}){
  const transport=mailTransport();
  if(!transport)return {sent:false,error:'Mail transport is not configured'};
  const link=FRONTEND_URL+'#token='+encodeURIComponent(token);
  const expiry=new Date(expiresAt).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'UTC'})+' UTC';
  const html='<!doctype html><html><body style="font-family:Arial,sans-serif;color:#0B1F33"><h2 style="color:#0B1F33">SECURITY INSTRUCTOR</h2><p>Dear '+name+',</p><p>Your access to <strong>'+course.en+'</strong> / <strong>'+course.ar+'</strong> is ready.</p><p>This is a self-study course. Your access window is <strong>'+course.accessHours+' hours</strong>.</p><p><a href="'+link+'" style="display:inline-block;padding:12px 18px;background:#C8A96B;color:#0B1F33;text-decoration:none;font-weight:bold">START SELF-STUDY / ابدأ الدراسة الذاتية</a></p><p>Access expires: '+expiry+'</p><p>Complete the learning screens, achieve at least 80% on required knowledge checks, then complete the 30-question final assessment. The final assessment pass mark is 70%.</p><p>SECURITY INSTRUCTOR<br>Knowledge • Skills • Safer Tomorrow</p></body></html>';
  await transport.sendMail({from:process.env.MAIL_FROM||process.env.ADMIN_EMAIL,to,subject:'SECURITY INSTRUCTOR — Fire Safety Self-Study Access',html});
  return {sent:true,error:null};
}

async function findSession(req){
  const h=String(req.headers.authorization||'');
  if(!h.startsWith('Bearer '))return null;
  const token=h.slice(7).trim();
  if(!token)return null;
  const row=await mongoose.connection.collection('selfstudyaccess').findOne({sessionTokenHash:sha(token),status:'active'});
  if(!row||!row.sessionExpiresAt||new Date(row.sessionExpiresAt)<=new Date())return null;
  if(!row.accessExpiresAt||new Date(row.accessExpiresAt)<=new Date()){
    await mongoose.connection.collection('selfstudyaccess').updateOne({_id:row._id},{$set:{status:'expired',updatedAt:new Date()}});
    return null;
  }
  return row;
}

const sessionHandler=async(req,res,next)=>{
  try{req.selfStudy=await findSession(req);if(!req.selfStudy)return res.status(401).json({message:'Self-study access required'});next();}
  catch(e){console.error('Self-study session error',e);res.status(500).json({message:'Unable to validate self-study access'});}
};

const registerHandler=async(req,res)=>{
  try{
    const b=req.body||{};
    const slug=clean(b.courseSlug,80)||FIRE_SLUG;
    const course=COURSE_META[slug];
    if(!course)return res.status(400).json({message:'Self-study course not available'});
    const ar=clean(b.arabicName,180).replace(/\s+/g,' ').split(' ').filter(Boolean);
    const en=clean(b.englishName,180).replace(/\s+/g,' ').split(' ').filter(Boolean);
    const email=clean(b.email,180).toLowerCase();
    const idType=clean(b.idType,30),idNumber=clean(b.idNumber,40),mobile=clean(b.mobile,40);
    if(ar.length!==3||en.length!==3||!validEmail(email)||!idNumber||!mobile||!['national_id','iqama','passport'].includes(idType))return res.status(400).json({message:'Please complete all required registration fields / يرجى استكمال جميع بيانات التسجيل المطلوبة'});
    const db=mongoose.connection;
    const trainees=db.collection('trainees'), enrollments=db.collection('enrollments'), access=db.collection('selfstudyaccess');
    let trainee=await trainees.findOne({idNumber});
    if(trainee){
      await trainees.updateOne({_id:trainee._id},{$set:{arabicFirstName:ar[0],arabicMiddleName:ar[1],arabicLastName:ar[2],englishFirstName:en[0],englishMiddleName:en[1],englishLastName:en[2],idType,mobile,email,updatedAt:new Date()}});
      trainee=await trainees.findOne({_id:trainee._id});
    }else{
      const traineeId=await nextNumber(trainees,'TRN-','traineeId');
      trainee={traineeId,arabicFirstName:ar[0],arabicMiddleName:ar[1],arabicLastName:ar[2],englishFirstName:en[0],englishMiddleName:en[1],englishLastName:en[2],idType,idNumber,mobile,email,createdAt:new Date(),updatedAt:new Date()};
      await trainees.insertOne(trainee);
    }
    let enrollment=await enrollments.findOne({traineeId:trainee.traineeId,courseId:course.code});
    if(!enrollment){
      const enrollmentId=await nextNumber(enrollments,'ENR-','enrollmentId');
      enrollment={enrollmentId,traineeId:trainee.traineeId,courseId:course.code,courseNameEn:course.en,courseNameAr:course.ar,registrationType:'individual',companyName:'',companyContact:'',companyEmail:'',status:'active',score:null,selfStudy:true,registeredAt:new Date(),createdAt:new Date(),updatedAt:new Date()};
      await enrollments.insertOne(enrollment);
    }else if(enrollment.status==='cancelled'){
      await enrollments.updateOne({_id:enrollment._id},{$set:{status:'active',selfStudy:true,updatedAt:new Date()}});
      enrollment=await enrollments.findOne({_id:enrollment._id});
    }
    const now=new Date();
    let row=await access.findOne({enrollmentId:enrollment.enrollmentId,courseSlug:slug});
    if(!row){
      row={accessId:'SSA-'+randomToken(8),enrollmentId:enrollment.enrollmentId,traineeId:trainee.traineeId,courseSlug:slug,status:'active',accessStartsAt:now,accessExpiresAt:new Date(now.getTime()+ACCESS_HOURS*3600000),progress:baseProgress(),createdAt:now,updatedAt:now};
      await access.insertOne(row);
    }else if(!row.accessExpiresAt||new Date(row.accessExpiresAt)<=now){
      const starts=now,expires=new Date(now.getTime()+ACCESS_HOURS*3600000);
      await access.updateOne({_id:row._id},{$set:{status:'active',accessStartsAt:starts,accessExpiresAt:expires,progress:baseProgress(),updatedAt:now}});
      row=await access.findOne({_id:row._id});
    }
    const magic=randomToken(32),magicExpires=new Date(Date.now()+MAGIC_MINUTES*60000);
    await access.updateOne({_id:row._id},{$set:{magicTokenHash:sha(magic),magicTokenExpiresAt:magicExpires,magicUsedAt:null,updatedAt:new Date()}});
    const fullName=[en[0],en[1],en[2]].join(' ');
    const mail=await sendAccessEmail({to:email,name:fullName,course,token:magic,expiresAt:row.accessExpiresAt});
    res.status(201).json({ok:true,message:'Registration received. If the email address is valid, access instructions will be sent to it. / تم استلام التسجيل، وسيتم إرسال تعليمات الدخول إلى البريد الإلكتروني.',traineeId:trainee.traineeId,enrollmentId:enrollment.enrollmentId,mailSent:mail.sent});
  }catch(e){console.error('Self-study registration error',e);res.status(500).json({message:'Unable to complete self-study registration'});}
};

const requestAccessHandler=async(req,res)=>{
  try{
    const email=clean(req.body?.email,180).toLowerCase();
    const enrollmentId=clean(req.body?.enrollmentId,100);
    const generic={ok:true,message:'If the details match an active self-study registration, an access email has been sent. / إذا تطابقت البيانات مع تسجيل نشط للدراسة الذاتية، فسيتم إرسال رسالة الدخول.'};
    if(!validEmail(email)||!enrollmentId)return res.json(generic);
    const enroll=await mongoose.connection.collection('enrollments').findOne({enrollmentId,selfStudy:true});
    if(!enroll)return res.json(generic);
    const trainee=await mongoose.connection.collection('trainees').findOne({traineeId:enroll.traineeId,email});
    if(!trainee)return res.json(generic);
    const course=COURSE_META[FIRE_SLUG];
    let row=await mongoose.connection.collection('selfstudyaccess').findOne({enrollmentId,courseSlug:FIRE_SLUG});
    if(!row)return res.json(generic);
    if(new Date(row.accessExpiresAt)<=new Date())return res.json(generic);
    const magic=randomToken(32),expires=new Date(Date.now()+MAGIC_MINUTES*60000);
    await mongoose.connection.collection('selfstudyaccess').updateOne({_id:row._id},{$set:{magicTokenHash:sha(magic),magicTokenExpiresAt:expires,magicUsedAt:null,updatedAt:new Date()}});
    await sendAccessEmail({to:email,name:[trainee.englishFirstName,trainee.englishMiddleName,trainee.englishLastName].join(' '),course,token:magic,expiresAt:row.accessExpiresAt});
    res.json(generic);
  }catch(e){console.error('Self-study access request error',e);res.json({ok:true,message:'If the details match an active self-study registration, an access email has been sent. / إذا تطابقت البيانات مع تسجيل نشط للدراسة الذاتية، فسيتم إرسال رسالة الدخول.'});}
};

const exchangeHandler=async(req,res)=>{
  try{
    const token=clean(req.body?.token,100);
    if(!token)return res.status(400).json({message:'Invalid access token'});
    const c=mongoose.connection.collection('selfstudyaccess');
    const row=await c.findOne({magicTokenHash:sha(token),status:'active'});
    if(!row||!row.magicTokenExpiresAt||new Date(row.magicTokenExpiresAt)<=new Date()||row.magicUsedAt)return res.status(401).json({message:'Access link is invalid or expired. Please request a new access email.'});
    const session=randomToken(32),now=new Date();
    await c.updateOne({_id:row._id},{$set:{magicUsedAt:now,sessionTokenHash:sha(session),sessionExpiresAt:new Date(now.getTime()+SESSION_HOURS*3600000),updatedAt:now},$unset:{magicTokenHash:'',magicTokenExpiresAt:''}});
    res.json({ok:true,sessionToken:session,courseSlug:row.courseSlug,accessExpiresAt:row.accessExpiresAt});
  }catch(e){console.error('Self-study token exchange error',e);res.status(500).json({message:'Unable to start self-study session'});}
};

const meHandler=async(req,res)=>{
  const row=req.selfStudy,course=COURSE_META[row.courseSlug];
  const p=row.progress||baseProgress();
  const q=Number(p.cumulativeQuestions||0),correct=Number(p.cumulativeCorrect||0);
  const cumulative=q?Math.round(correct/q*100):0;
  res.json({ok:true,traineeId:row.traineeId,enrollmentId:row.enrollmentId,course,accessStartsAt:row.accessStartsAt,accessExpiresAt:row.accessExpiresAt,progress:p,cumulativeScore:cumulative,finalBestScore:p.finalBestScore||null,finalPassed:!!p.finalPassed});
};

const progressHandler=async(req,res)=>{
  try{
    const b=req.body||{},screenId=clean(b.screenId,100),moduleId=clean(b.moduleId,50);
    if(!screenId||!moduleId)return res.status(400).json({message:'Module and screen are required'});
    const p=req.selfStudy.progress||baseProgress();
    const scores={...(p.screenScores||{})};
    const modules={...(p.modules||{})};
    const score=Number(b.score),questions=Number(b.questions),correct=Number(b.correct);
    if(!Number.isFinite(score)||score<0||score>100||!Number.isInteger(questions)||questions<1||!Number.isInteger(correct)||correct<0||correct>questions)return res.status(400).json({message:'Invalid assessment result'});
    scores[screenId]={score,questions,correct,attempts:Math.max(1,Number(b.attempts)||1),updatedAt:new Date()};
    if(score>=80&&!p.completedScreens.includes(screenId))p.completedScreens=[...p.completedScreens,screenId];
    modules[moduleId]=Math.max(Number(modules[moduleId]||0),score);
    const all=Object.values(scores);
    p.cumulativeQuestions=all.reduce((s,x)=>s+Number(x.questions||0),0);
    p.cumulativeCorrect=all.reduce((s,x)=>s+Number(x.correct||0),0);
    p.screenScores=scores;p.modules=modules;
    await mongoose.connection.collection('selfstudyaccess').updateOne({_id:req.selfStudy._id},{$set:{progress:p,updatedAt:new Date()}});
    const cumulative=p.cumulativeQuestions?Math.round(p.cumulativeCorrect/p.cumulativeQuestions*100):0;
    res.json({ok:true,score,passed:score>=80,cumulativeScore:cumulative,progress:p});
  }catch(e){console.error('Self-study progress error',e);res.status(500).json({message:'Unable to save progress'});}
};

const finalHandler=async(req,res)=>{
  try{
    const score=Number(req.body?.score);
    if(!Number.isFinite(score)||score<0||score>100)return res.status(400).json({message:'Invalid final assessment score'});
    const p=req.selfStudy.progress||baseProgress();
    const attempts=Array.isArray(p.finalAttempts)?p.finalAttempts:[];
    if(attempts.length>=3)return res.status(400).json({message:'No final assessment attempts remaining'});
    const passed=score>=70;
    attempts.push({score,passed,attempt:attempts.length+1,submittedAt:new Date()});
    p.finalAttempts=attempts;p.finalBestScore=Math.max(Number(p.finalBestScore||0),score);p.finalPassed=passed||Boolean(p.finalPassed);
    const required=COURSE_META[req.selfStudy.courseSlug].modules.map(m=>m.id);
    const mastered=required.every(id=>Number((p.modules||{})[id]||0)>=80);
    const eligible=mastered&&p.finalPassed;
    await mongoose.connection.collection('selfstudyaccess').updateOne({_id:req.selfStudy._id},{$set:{progress:p,certificateEligible:eligible,updatedAt:new Date()}});
    res.json({ok:true,score,passed,attempt:attempts.length,remaining:3-attempts.length,mastered,certificateEligible:eligible});
  }catch(e){console.error('Self-study final assessment error',e);res.status(500).json({message:'Unable to save final assessment'});}
};

function register(app){
  app.get('/api/self-study/courses/:slug',(req,res)=>{const c=COURSE_META[clean(req.params.slug,80)];if(!c)return res.status(404).json({message:'Self-study course not found'});res.json(c)});
  app.post('/api/self-study/register',registerHandler);
  app.post('/api/self-study/access/request',requestAccessHandler);
  app.post('/api/self-study/session/exchange',exchangeHandler);
  app.get('/api/self-study/me',sessionHandler,meHandler);
  app.post('/api/self-study/progress',sessionHandler,progressHandler);
  app.post('/api/self-study/final-assessment',sessionHandler,finalHandler);
}
module.exports={register};
