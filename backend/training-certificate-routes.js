const express=require('express');
const mongoose=require('mongoose');
const crypto=require('crypto');
const nodemailer=require('nodemailer');
const QRCode=require('qrcode');
require('dotenv').config();

const clean=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
const FRONTEND=(process.env.FRONTEND_PUBLIC_URL||'https://securitytrainer2025.github.io/security-instructor/frontend').replace(/\/$/,'');
const Trainee=mongoose.model('TrainingCertificateTrainee',new mongoose.Schema({}, {strict:false}),'trainees');
const Enrollment=mongoose.model('TrainingCertificateEnrollment',new mongoose.Schema({}, {strict:false}),'enrollments');
const Certificate=mongoose.model('TrainingCertificate',new mongoose.Schema({certificateId:{type:String,unique:true,index:true},traineeId:{type:String,required:true,index:true},enrollmentId:{type:String,required:true,unique:true,index:true},courseId:{type:String,required:true,index:true},courseNameEn:String,courseNameAr:String,trainingId:String,durationHours:Number,level:String,trainingTopics:Array,trainerName:String,signatureName:String,recipientNameEn:String,recipientNameAr:String,idType:String,idNumber:String,email:String,score:Number,issuedAt:{type:Date,default:Date.now},verificationStatus:{type:String,enum:['valid','revoked'],default:'valid'},verificationUrl:String,emailStatus:{type:String,default:'pending'},emailSentAt:Date,emailError:String},{timestamps:true}),'trainingcertificates');
const adminAuth=async req=>{try{const h=String(req.headers.authorization||'');if(!h.startsWith('Bearer '))return false;const r=await fetch('http://127.0.0.1:'+(process.env.PORT||10000)+'/api/admin/me',{headers:{Authorization:h}});return r.ok}catch{return false}};
const transport=()=>{const user=(process.env.MAIL_FROM||process.env.ADMIN_EMAIL||'').trim(),clientId=(process.env.MS_CLIENT_ID||'').trim(),clientSecret=(process.env.MS_CLIENT_SECRET||'').trim(),refreshToken=(process.env.MS_REFRESH_TOKEN||'').trim();if(!user||!clientId||!clientSecret||!refreshToken)return null;return nodemailer.createTransport({host:'smtp-mail.outlook.com',port:587,secure:false,auth:{type:'OAuth2',user,clientId,clientSecret,refreshToken}})};
const courseLink=slug=>`${FRONTEND}/assessment-gateway.html?course=${encodeURIComponent(slug)}`;
const PUBLIC_VERIFY='https://securitytrainer2025.github.io/security-instructor/frontend/verify.html';
const verifyLink=id=>`${PUBLIC_VERIFY}?type=certificate&id=${encodeURIComponent(id)}`;
const certificateLink=id=>`${FRONTEND}/certificate.html?id=${encodeURIComponent(id)}`;
const nextId=()=>`SI-CERT-${new Date().getFullYear()}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
async function send(to,subject,text,html){const t=transport();if(!t)return false;const from=(process.env.MAIL_FROM||process.env.ADMIN_EMAIL||'').trim();await t.sendMail({from,replyTo:from,to,subject,text,html});return true}
async function issueForEnrollment(enrollmentId){
  const e=await Enrollment.findOne({enrollmentId}).lean();
  if(!e)throw new Error('Enrollment not found');
  if(e.status!=='completed')throw new Error('Enrollment must be completed before a certificate can be issued');
  const t=await Trainee.findOne({traineeId:e.traineeId}).lean();
  if(!t)throw new Error('Trainee not found for this enrollment');
  if(!t.email)throw new Error('Trainee email is missing');
  const existing=await Certificate.findOne({enrollmentId}).lean();
  if(existing)return existing;
  const nameEn=[t.englishFirstName,t.englishMiddleName,t.englishLastName].filter(Boolean).join(' ');
  const nameAr=[t.arabicFirstName,t.arabicMiddleName,t.arabicLastName].filter(Boolean).join(' ');
  const certificateId=nextId();
  const courseQuery=mongoose.Types.ObjectId.isValid(String(e.courseId||''))?{_id:new mongoose.Types.ObjectId(String(e.courseId))}:{$or:[{code:e.courseId},{slug:e.courseId}]};
  const course=await mongoose.connection.collection('trainingcourses').findOne(courseQuery);
  const trainingTopics=Array.isArray(course?.trainingTopics)?course.trainingTopics:[];
  const durationHours=course?.durationHours??e.durationHours??null;
  const level=course?.level||e.level||'';
  const trainerName=course?.trainerName||course?.instructor||e.trainerName||'';
  const signatureName=course?.signatureName||trainerName;
  const trainingId=course?.code||e.courseId||'';
  const verificationUrl=verifyLink(certificateId);
  const cert=await Certificate.create({certificateId,traineeId:t.traineeId,enrollmentId,courseId:e.courseId,courseNameEn:e.courseNameEn,courseNameAr:e.courseNameAr,trainingId,durationHours,level,trainingTopics,trainerName,signatureName,recipientNameEn:nameEn,recipientNameAr:nameAr,idType:t.idType||'',idNumber:t.idNumber||'',email:t.email,score:typeof e.score==='number'?e.score:undefined,verificationUrl});
  const subject=`SECURITY INSTRUCTOR | Training Certificate | ${e.courseNameEn}`;
  const link=certificateLink(certificateId);
  const text=`Dear ${nameEn},\n\nCongratulations on completing ${e.courseNameEn}.\nYour training certificate is now available.\n\nCertificate ID: ${certificateId}\nView certificate: ${link}\nVerify certificate: ${verificationUrl}\n\nRegards,\nSECURITY INSTRUCTOR`;
  const html=`<div style="font-family:Arial,sans-serif;line-height:1.7;color:#0B1F33"><h2>SECURITY INSTRUCTOR</h2><p>Dear ${nameEn},</p><p>Congratulations on completing <strong>${e.courseNameEn}</strong>.</p><p>Your training certificate is now available.</p><p><strong>Certificate ID:</strong> ${certificateId}</p><p><a href="${link}" style="background:#C8A96B;color:#101820;padding:10px 16px;text-decoration:none;font-weight:700">View Certificate / عرض الشهادة</a></p><p style="font-size:12px;color:#5F6B76">Verification: <a href="${verificationUrl}">${verificationUrl}</a></p></div>`;
  try{const sent=await send(t.email,subject,text,html);await Certificate.updateOne({certificateId},{$set:{emailStatus:sent?'sent':'not_configured',emailSentAt:sent?new Date():null}})}catch(err){console.error('Certificate email failed',err);await Certificate.updateOne({certificateId},{$set:{emailStatus:'failed',emailError:clean(err.message,300)}})}
  return Certificate.findOne({certificateId}).lean();
}
const install=(method,path,handler)=>{const key='__si_training_cert_'+method+'_'+path.replace(/[^a-z0-9]/gi,'_');if(express.application[key])return;express.application[key]=true;const original=express.application[method];express.application[method]=function(route,...handlers){if(route===path)original.call(this,route,handler);return original.call(this,route,...handlers)}};

// Registration email: send the direct course access/initial-assessment link after a successful registration.
install('post','/api/course-registration',async(req,res,next)=>{const originalJson=res.json.bind(res);res.json=body=>{try{if(body?.ok&&body?.traineeId&&body?.course?.id){const slug=clean(req.body?.courseSlug,100);Trainee.findOne({traineeId:body.traineeId}).lean().then(async t=>{if(!t?.email)return;const name=[t.englishFirstName,t.englishMiddleName,t.englishLastName].filter(Boolean).join(' '),link=courseLink(slug),subject=`SECURITY INSTRUCTOR | Course Access | ${body.course.en}`,text=`Dear ${name},\n\nYour registration for ${body.course.en} has been received.\n\nCourse access and initial assessment:\n${link}\n\nTrainee ID: ${body.traineeId}\nEnrollment ID: ${body.enrollmentId}\n\nRegards,\nSECURITY INSTRUCTOR`,html=`<div style="font-family:Arial,sans-serif;line-height:1.7;color:#0B1F33"><h2>SECURITY INSTRUCTOR</h2><p>Dear ${name},</p><p>Your registration for <strong>${body.course.en}</strong> has been received.</p><p><a href="${link}" style="background:#C8A96B;color:#101820;padding:10px 16px;text-decoration:none;font-weight:700">Course Access / الدخول للدورة</a></p><p style="font-size:13px;color:#5F6B76">Trainee ID: ${body.traineeId}<br>Enrollment ID: ${body.enrollmentId}</p></div>`;try{await send(t.email,subject,text,html)}catch(err){console.error('Course access email failed',err)}}).catch(err=>console.error('Registration email lookup failed',err))}}catch(err){console.error('Registration email hook failed',err)}return originalJson(body)};next()});

// Completion email + certificate: Admin marking an enrollment completed is the completion event.
install('patch','/api/admin/enrollments/:enrollmentId/status',async(req,res,next)=>{const originalJson=res.json.bind(res);res.json=async body=>{try{if(body?.enrollmentId&&body.status==='completed'){const cert=await issueForEnrollment(body.enrollmentId);if(cert){body.certificateId=cert.certificateId;body.certificateIssued=true;body.certificateEmailStatus=cert.emailStatus}}}catch(err){console.error('Auto certificate hook failed',err)}return originalJson(body)};next()});

install('post','/api/admin/training-certificates/issue',async(req,res)=>{if(!(await adminAuth(req)))return res.status(401).json({message:'Admin authentication required'});try{const enrollmentId=clean(req.body?.enrollmentId,100);const cert=await issueForEnrollment(enrollmentId);if(!cert)return res.status(400).json({message:'Certificate can only be issued for a completed enrollment with a valid trainee email'});res.status(201).json({ok:true,certificate:cert})}catch(err){console.error(err);res.status(500).json({message:'Unable to issue training certificate'})}});
install('get','/api/training-certificates/:certificateId',async(req,res)=>{try{const c=await Certificate.findOne({certificateId:clean(req.params.certificateId,100)}).lean();if(!c)return res.status(404).json({message:'Certificate not found'});const t=await Trainee.findOne({traineeId:c.traineeId}).lean();res.json({...c,idType:c.idType||t?.idType||'',idNumber:c.idNumber||t?.idNumber||'',trainingId:c.trainingId||c.courseId||'',durationHours:c.durationHours??'',level:c.level||'',trainingTopics:Array.isArray(c.trainingTopics)?c.trainingTopics:[],trainerName:c.trainerName||'',signatureName:c.signatureName||c.trainerName||''})}catch(err){res.status(500).json({message:'Unable to load certificate'})}});
install('get','/api/training-certificates/:certificateId/qr',async(req,res)=>{try{const c=await Certificate.findOne({certificateId:clean(req.params.certificateId,100)}).lean();if(!c)return res.status(404).end();const png=await QRCode.toBuffer(c.verificationUrl,{width:180,margin:1,color:{dark:'#0B1F33',light:'#FFFFFF'}});res.type('png').send(png)}catch(err){res.status(500).end()}});
install('get','/api/verify/training-certificate',async(req,res)=>{try{const c=await Certificate.findOne({certificateId:clean(req.query?.id,100)}).lean();if(!c)return res.status(404).json({valid:false,message:'Certificate not found'});const t=await Trainee.findOne({traineeId:c.traineeId}).lean();res.json({valid:c.verificationStatus==='valid',documentType:'Training Certificate',documentTypeAr:'شهادة إتمام دورة تدريبية',certificateId:c.certificateId,traineeId:c.traineeId,recipientNameEn:c.recipientNameEn,recipientNameAr:c.recipientNameAr,courseNameEn:c.courseNameEn,courseNameAr:c.courseNameAr,idType:c.idType||t?.idType||'',idNumber:c.idNumber||t?.idNumber||'',issuedAt:c.issuedAt,status:c.verificationStatus})}catch(err){res.status(500).json({valid:false,message:'Unable to verify certificate'})}});
install('get','/api/admin/training-certificates',async(req,res)=>{if(!(await adminAuth(req)))return res.status(401).json({message:'Admin authentication required'});try{const rows=await Certificate.find({}).sort({issuedAt:-1}).limit(20000).lean();res.json({summary:{certificates:rows.length},certificates:rows})}catch(err){res.status(500).json({message:'Unable to load training certificates'})}});
function registerTrainingCertificateDirectRoutes(app){
  app.get('/api/training-certificates/:certificateId',async(req,res)=>{
    try{
      const certificateId=clean(req.params.certificateId,100);
      const cert=await Certificate.findOne({certificateId}).lean();
      if(!cert)return res.status(404).json({message:'Certificate not found'});
      const trainee=await Trainee.findOne({traineeId:cert.traineeId}).lean();
      res.set('Cache-Control','no-store').json({...cert,idType:cert.idType||trainee?.idType||'',idNumber:cert.idNumber||trainee?.idNumber||'',trainingId:cert.trainingId||cert.courseId||'',durationHours:cert.durationHours??'',level:cert.level||'',trainingTopics:Array.isArray(cert.trainingTopics)?cert.trainingTopics:[],trainerName:cert.trainerName||'',signatureName:cert.signatureName||cert.trainerName||''});
    }catch(err){console.error('Certificate load failed',err);res.status(500).json({message:'Unable to load certificate'})}
  });
  app.get('/api/training-certificates/:certificateId/qr',async(req,res)=>{
    try{
      const certificateId=clean(req.params.certificateId,100);
      const cert=await Certificate.findOne({certificateId}).lean();
      if(!cert)return res.status(404).json({message:'Certificate not found'});
      const verificationUrl=verifyLink(certificateId);
      const svg=await QRCode.toString(verificationUrl,{type:'svg',width:300,margin:2,errorCorrectionLevel:'H',color:{dark:'#0B1F33',light:'#FFFFFF'}});
      res.set('Cache-Control','no-store').type('image/svg+xml').send(svg);
    }catch(err){console.error('Certificate QR failed',err);res.status(500).json({message:'Unable to generate certificate QR'})}
  });
  app.get('/api/verify/training-certificate',async(req,res)=>{
    try{
      const certificateId=clean(req.query?.id,100);
      if(!certificateId)return res.status(400).json({valid:false,message:'Certificate ID is required'});
      const cert=await Certificate.findOne({certificateId}).lean();
      if(!cert)return res.status(404).json({valid:false,message:'Certificate not found'});
      const trainee=await Trainee.findOne({traineeId:cert.traineeId}).lean();
      res.set('Cache-Control','no-store').json({valid:cert.verificationStatus==='valid',documentType:'Training Certificate',documentTypeAr:'شهادة إتمام دورة تدريبية',certificateId:cert.certificateId,traineeId:cert.traineeId,recipientNameEn:cert.recipientNameEn,recipientNameAr:cert.recipientNameAr,courseNameEn:cert.courseNameEn,courseNameAr:cert.courseNameAr,idType:cert.idType||trainee?.idType||'',idNumber:cert.idNumber||trainee?.idNumber||'',issuedAt:cert.issuedAt,status:cert.verificationStatus,verificationUrl:verifyLink(certificateId)});
    }catch(err){console.error('Certificate verification failed',err);res.status(500).json({valid:false,message:'Unable to verify certificate'})}
  });
}

module.exports={issueForEnrollment,registerTrainingCertificateDirectRoutes};
