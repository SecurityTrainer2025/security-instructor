const express=require('express');
const mongoose=require('mongoose');
const crypto=require('crypto');
const QRCode=require('qrcode');
require('dotenv').config();

const clean=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
const FRONTEND=(process.env.FRONTEND_PUBLIC_URL||'https://securitytrainer2025.github.io/security-instructor/frontend').replace(/\/$/,'');
const Trainee=mongoose.model('TrainingCertificateTrainee',new mongoose.Schema({}, {strict:false}),'trainees');
const Enrollment=mongoose.model('TrainingCertificateEnrollment',new mongoose.Schema({}, {strict:false}),'enrollments');
const Certificate=mongoose.model('TrainingCertificate',new mongoose.Schema({certificateId:{type:String,unique:true,index:true},traineeId:{type:String,required:true,index:true},enrollmentId:{type:String,required:true,unique:true,index:true},courseId:{type:String,required:true,index:true},courseNameEn:String,courseNameAr:String,trainingId:String,durationHours:Number,level:String,trainingTopics:Array,trainerName:String,signatureName:String,recipientNameEn:String,recipientNameAr:String,idType:String,idNumber:String,email:String,score:Number,issuedAt:{type:Date,default:Date.now},verificationStatus:{type:String,enum:['valid','revoked'],default:'valid'},verificationUrl:String,emailStatus:{type:String,default:'pending'},emailSentAt:Date,emailError:String},{timestamps:true}),'trainingcertificates');
const adminAuth=async req=>{try{const h=String(req.headers.authorization||'');if(!h.startsWith('Bearer '))return false;const r=await fetch('http://127.0.0.1:'+(process.env.PORT||10000)+'/api/admin/me',{headers:{Authorization:h}});return r.ok}catch{return false}};

// Brevo transactional email. The API key is read only from the server environment.
async function send(to,subject,text,html,attachments=[]){
  const apiKey=(process.env.BREVO_API_KEY||'').trim();
  const from=(process.env.MAIL_FROM||'').trim();
  if(!apiKey||!from)return false;
  const response=await fetch('https://api.brevo.com/v3/smtp/email',{
    method:'POST',
    headers:{'accept':'application/json','api-key':apiKey,'content-type':'application/json'},
    body:JSON.stringify({
      sender:{name:'SECURITY INSTRUCTOR',email:from},
      replyTo:{email:from},
      to:[{email:to}],
      subject,
      textContent:text,
      htmlContent:html,
      ...(attachments.length?{attachment:attachments}: {})
    })
  });
  if(!response.ok){
    const detail=await response.text().catch(()=> '');
    throw new Error(`Brevo email failed (${response.status}): ${detail.slice(0,300)}`);
  }
  return true;
}
const htmlEsc=v=>String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const TRAINING_MATERIAL_LINKS={
  'crowd-management-event-security':'https://docs.google.com/presentation/d/1kU0u8P39R0eNOd5PydOB6HTU20VJ1aNA/preview',
  'traffic-management-vehicle-control':'https://docs.google.com/presentation/d/1i22gLHuR-EJ3cQbahCI9wldVqX4fiwKx/preview',
  'fire-safety-emergency-response':'https://docs.google.com/presentation/d/1LQ-1faypsf0gZHMVmDOynl618uy6d-zf/preview',
  'vehicle-search-security-inspection':'https://docs.google.com/presentation/d/1FMkl3eCPEpKHTuM9AFpKaQ0xAbcD3yz4/preview',
  'person-search-security-screening':'https://docs.google.com/presentation/d/1Rn7zs0MIZz6ebH7sA8y__RR2a-xDu5C9/preview'
};
function getTrainingMaterialLink(courseId,slug){return TRAINING_MATERIAL_LINKS[String(slug||'').trim()]||''}
const COURSE_INSTRUCTIONS_AR=[
  'الالتزام بالمواعيد المحددة للدورة والحضور في الوقت المحدد.',
  'يجب تحقيق 80% على الأقل من نسبة الحضور للحصول على الشهادة.',
  'إكمال جميع الأنشطة والتقييمات والمتطلبات المطلوبة للدورة.',
  'مراجعة المادة التدريبية والاستعداد للتقييمات.',
  'المشاركة والتفاعل مع المدرب أثناء البرنامج التدريبي.',
  'استخدام رابط المادة التدريبية للمشاهدة والمذاكرة فقط وعدم تعديل أو حذف المحتوى.',
  'المحافظة على السلوك المهني والالتزام بتعليمات المدرب وإدارة التدريب.',
  'في حال وجود مشكلة تقنية، التواصل مع فريق التدريب في أقرب وقت.',
  'تصدر الشهادة بعد استكمال متطلبات الدورة واجتياز المتطلبات المحددة.'
];
const COURSE_INSTRUCTIONS_EN=[
  'Please attend the course on time and adhere to the scheduled training dates and times.',
  'A minimum attendance rate of 80% is required to receive the certificate.',
  'Complete all required course activities, assessments, and learning requirements.',
  'Review the training material and prepare for the assessments.',
  'Participate actively and professionally during the training.',
  'Use the training-material link for viewing and study only; do not edit or delete any content.',
  'Maintain professional conduct and follow the instructions of the trainer and training administration.',
  'If you experience a technical issue, contact the training team as soon as possible.',
  'The certificate is issued after completion of the required course requirements and successful completion of applicable requirements.'
];
const assessmentLink=slug=>`${FRONTEND}/assessment-gateway.html?course=${encodeURIComponent(slug)}`;
const trainingInstructionsHtml=(items,dir)=>'<ul dir="'+dir+'" style="line-height:1.8">'+items.map(x=>'<li>'+htmlEsc(x)+'</li>').join('')+'</ul>';
const LEGACY_COURSE_META={'CRS-FIRE-001':{durationHours:24,level:'Level 1 / المستوى الأول',trainingTopics:[['Fire Science & Building Hazards','علوم الحريق ومخاطر المنشآت','♨'],['Fire Detection & Alarm Systems','أنظمة كشف وإنذار الحريق','◉'],['Fire Classifications & Extinguishing Agents','تصنيف الحرائق ووسائط الإطفاء','▥'],['Fire Suppression Systems','أنظمة إطفاء الحريق','╫'],['Emergency Evacuation & Egress Safety','الإخلاء ومخارج الطوارئ','●'],['RACE Emergency Response','الاستجابة للطوارئ باستخدام RACE','↗'],['Incident Command & Emergency Coordination','إدارة الحوادث والتنسيق في الطوارئ','⚙'],['Fire Emergency Plans & Security','خطط الطوارئ وأمن المنشآت','▣']]}};
const PUBLIC_VERIFY='https://securitytrainer2025.github.io/security-instructor/frontend/verify.html';
const verifyLink=id=>`${PUBLIC_VERIFY}?type=certificate&id=${encodeURIComponent(id)}`;
const certificateLink=id=>`${FRONTEND}/certificate.html?id=${encodeURIComponent(id)}`;
const nextId=()=>`SI-CERT-${new Date().getFullYear()}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
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
  const subject=`SECURITY INSTRUCTOR | الشهادة | Certificate | ${e.courseNameEn}`;
  const link=certificateLink(certificateId);
  const text=[
    'العربية','',
    `عزيزي/عزيزتي ${nameAr}،`,'',
    'شكرًا لحضورك والتزامك ومشاركتك في دورة:',
    e.courseNameAr,'',
    'نقدّر التزامك ومشاركتك خلال البرنامج التدريبي، ويسعدنا تأكيد إتمامك لمتطلبات الدورة.','',
    'الشهادة:',
    `عرض الشهادة: ${link}`,
    `التحقق من الشهادة: ${verificationUrl}`,
    `رقم الشهادة: ${certificateId}`,'',
    'نتمنى لك دوام التوفيق والنجاح في مسيرتك المهنية.','',
    'مع خالص التحية،','فريق التدريب - SECURITY INSTRUCTOR','',
    '----------------------------------------','',
    'English','',
    `Dear ${nameEn},`,'',
    'Thank you for attending, participating, and completing the requirements for:',
    e.courseNameEn,'',
    'We appreciate your commitment and participation throughout the training program, and we are pleased to confirm that you have completed the course requirements.','',
    'Certificate:',
    `View Certificate: ${link}`,
    `Verify Certificate: ${verificationUrl}`,
    `Certificate ID: ${certificateId}`,'',
    'We wish you continued success in your professional career.','',
    'Best regards,','Training Team - SECURITY INSTRUCTOR'
  ].join('\n');
  const html=`<div style="font-family:Arial,sans-serif;line-height:1.8;color:#0B1F33"><div dir="rtl"><h2>SECURITY INSTRUCTOR</h2><p>عزيزي/عزيزتي <strong>${htmlEsc(nameAr)}</strong>،</p><p>شكرًا لحضورك ومشاركتك في دورة:</p><p><strong>${htmlEsc(e.courseNameAr)}</strong></p><p>نقدّر التزامك ومشاركتك خلال البرنامج التدريبي، ويسعدنا تأكيد إتمامك لمتطلبات الدورة.</p><p><strong>الشهادة</strong><br>رقم الشهادة: ${htmlEsc(certificateId)}</p><p><a href="${htmlEsc(link)}" style="display:inline-block;background:#C8A96B;color:#101820;padding:10px 16px;text-decoration:none;font-weight:700">عرض الشهادة</a></p><p><a href="${htmlEsc(verificationUrl)}">التحقق من الشهادة</a></p><p>نتمنى لك دوام التوفيق والنجاح في مسيرتك المهنية.</p><p>مع خالص التحية،<br><strong>فريق التدريب - SECURITY INSTRUCTOR</strong></p></div><hr style="border:0;border-top:1px solid #ddd;margin:24px 0"><div dir="ltr"><h2>SECURITY INSTRUCTOR</h2><p>Dear <strong>${htmlEsc(nameEn)}</strong>,</p><p>Thank you for attending and participating in:</p><p><strong>${htmlEsc(e.courseNameEn)}</strong></p><p>We appreciate your commitment and participation throughout the training program, and we are pleased to confirm that you have completed the course requirements.</p><p><strong>Certificate</strong><br>Certificate ID: ${htmlEsc(certificateId)}</p><p><a href="${htmlEsc(link)}" style="display:inline-block;background:#C8A96B;color:#101820;padding:10px 16px;text-decoration:none;font-weight:700">View Certificate</a></p><p><a href="${htmlEsc(verificationUrl)}">Verify Certificate</a></p><p>We wish you continued success in your professional career.</p><p>Best regards,<br><strong>Training Team - SECURITY INSTRUCTOR</strong></p></div></div>`;  try{const sent=await send(t.email,subject,text,html);await Certificate.updateOne({certificateId},{$set:{emailStatus:sent?'sent':'not_configured',emailSentAt:sent?new Date():null,emailError:null}})}catch(err){console.error('Certificate email failed',err);await Certificate.updateOne({certificateId},{$set:{emailStatus:'failed',emailError:clean(err.message,300)}})}
  return Certificate.findOne({certificateId}).lean();
}
const install=(method,path,handler)=>{const key='__si_training_cert_'+method+'_'+path.replace(/[^a-z0-9]/gi,'_');if(express.application[key])return;express.application[key]=true;const original=express.application[method];express.application[method]=function(route,...handlers){if(route===path)original.call(this,route,handler);return original.call(this,route,...handlers)}};

// Registration email: bilingual welcome + training material + initial assessment + fixed course instructions.
install('post','/api/course-registration',async(req,res,next)=>{
  const originalJson=res.json.bind(res);
  res.json=body=>{
    try{
      if(body?.ok&&body?.traineeId&&body?.course?.id){
        const slug=clean(req.body?.courseSlug,100);
        Trainee.findOne({traineeId:body.traineeId}).lean().then(async t=>{
          if(!t?.email)return;
          const nameEn=[t.englishFirstName,t.englishMiddleName,t.englishLastName].filter(Boolean).join(' ');
          const nameAr=[t.arabicFirstName,t.arabicMiddleName,t.arabicLastName].filter(Boolean).join(' ');
          const materialLink=await getTrainingMaterialLink(body.course.id,slug);
          const assessLink=assessmentLink(slug);
          const subject=`SECURITY INSTRUCTOR | Welcome & Registration | الترحيب وتأكيد التسجيل | ${body.course.en}`;
          const text=[
            'العربية','',
            `عزيزي/عزيزتي ${nameAr}،`,'',
            'مرحبًا بك في SECURITY INSTRUCTOR.',
            'يسرنا تأكيد تسجيلك في الدورة التالية:',
            body.course.ar,'',
            'بيانات التسجيل:',
            `رقم المتدرب: ${body.traineeId}`,
            `رقم التسجيل: ${body.enrollmentId}`,'',
            'المادة التدريبية:',
            materialLink||'ستتوفر المادة من خلال نظام التدريب عند تجهيزها للدورة.','',
            'التقييم المبدئي:',
            assessLink,'',
            'تعليمات الدورة:',
            ...COURSE_INSTRUCTIONS_AR.map((x,i)=>`${i+1}. ${x}`),'',
            'نتمنى لك تجربة تدريبية مميزة وموفقة.',
            'مع خالص التحية،',
            'فريق التدريب - SECURITY INSTRUCTOR','',
            '----------------------------------------','',
            'English','',
            `Dear ${nameEn},`,'',
            'Welcome to SECURITY INSTRUCTOR.',
            'We are pleased to confirm your registration for:',
            body.course.en,'',
            'Registration Details:',
            `Trainee ID: ${body.traineeId}`,
            `Enrollment ID: ${body.enrollmentId}`,'',
            'Training Material:',
            materialLink||'Training material will be made available through the training system when ready.','',
            'Initial Assessment:',
            assessLink,'',
            'Course Instructions:',
            ...COURSE_INSTRUCTIONS_EN.map((x,i)=>`${i+1}. ${x}`),'',
            'We wish you a successful and valuable training experience.',
            'Best regards,',
            'Training Team - SECURITY INSTRUCTOR'
          ].join('\\n');

          const html=`<div style="font-family:Arial,sans-serif;line-height:1.8;color:#0B1F33">
            <div dir="rtl">
              <h2>SECURITY INSTRUCTOR</h2>
              <p>عزيزي/عزيزتي <strong>${htmlEsc(nameAr)}</strong>،</p>
              <p>مرحبًا بك في <strong>SECURITY INSTRUCTOR</strong>.</p>
              <p>يسرنا تأكيد تسجيلك في الدورة التالية:</p>
              <p><strong>${htmlEsc(body.course.ar)}</strong></p>
              <p><strong>بيانات التسجيل</strong><br>رقم المتدرب: ${htmlEsc(body.traineeId)}<br>رقم التسجيل: ${htmlEsc(body.enrollmentId)}</p>
              <p><strong>المادة التدريبية</strong></p>
              ${materialLink?`<p><a href="${htmlEsc(materialLink)}" style="display:inline-block;background:#C8A96B;color:#101820;padding:10px 16px;text-decoration:none;font-weight:700">الدخول إلى المادة التدريبية</a></p>`:'<p>ستتوفر المادة من خلال نظام التدريب عند تجهيزها للدورة.</p>'}
              <p><strong>التقييم المبدئي</strong></p>
              <p><a href="${htmlEsc(assessLink)}" style="display:inline-block;background:#0B1F33;color:#fff;padding:10px 16px;text-decoration:none;font-weight:700">بدء التقييم المبدئي</a></p>
              <p><strong>تعليمات الدورة</strong></p>
              ${trainingInstructionsHtml(COURSE_INSTRUCTIONS_AR,'rtl')}
              <p>نتمنى لك تجربة تدريبية مميزة وموفقة.</p>
              <p>مع خالص التحية،<br><strong>فريق التدريب - SECURITY INSTRUCTOR</strong></p>
            </div>
            <hr style="border:0;border-top:1px solid #ddd;margin:24px 0">
            <div dir="ltr">
              <h2>SECURITY INSTRUCTOR</h2>
              <p>Dear <strong>${htmlEsc(nameEn)}</strong>,</p>
              <p>Welcome to <strong>SECURITY INSTRUCTOR</strong>.</p>
              <p>We are pleased to confirm your registration for:</p>
              <p><strong>${htmlEsc(body.course.en)}</strong></p>
              <p><strong>Registration Details</strong><br>Trainee ID: ${htmlEsc(body.traineeId)}<br>Enrollment ID: ${htmlEsc(body.enrollmentId)}</p>
              <p><strong>Training Material</strong></p>
              ${materialLink?`<p><a href="${htmlEsc(materialLink)}" style="display:inline-block;background:#C8A96B;color:#101820;padding:10px 16px;text-decoration:none;font-weight:700">Access Training Material</a></p>`:'<p>Training material will be made available through the training system when ready.</p>'}
              <p><strong>Initial Assessment</strong></p>
              <p><a href="${htmlEsc(assessLink)}" style="display:inline-block;background:#0B1F33;color:#fff;padding:10px 16px;text-decoration:none;font-weight:700">Start Initial Assessment</a></p>
              <p><strong>Course Instructions</strong></p>
              ${trainingInstructionsHtml(COURSE_INSTRUCTIONS_EN,'ltr')}
              <p>We wish you a successful and valuable training experience.</p>
              <p>Best regards,<br><strong>Training Team - SECURITY INSTRUCTOR</strong></p>
            </div>
          </div>`;
          try{await send(t.email,subject,text,html)}catch(err){console.error('Course welcome email failed',err)}
        }).catch(err=>console.error('Registration email lookup failed',err))
      }
    }catch(err){console.error('Registration email hook failed',err)}
    return originalJson(body)
  };
  next()
});
install('patch','/api/admin/enrollments/:enrollmentId/status',async(req,res,next)=>{const originalJson=res.json.bind(res);res.json=async body=>{try{if(body?.enrollmentId&&body.status==='completed'){const cert=await issueForEnrollment(body.enrollmentId);if(cert){body.certificateId=cert.certificateId;body.certificateIssued=true;body.certificateEmailStatus=cert.emailStatus}}}catch(err){console.error('Auto certificate hook failed',err)}return originalJson(body)};next()});

install('post','/api/admin/training-certificates/issue',async(req,res)=>{if(!(await adminAuth(req)))return res.status(401).json({message:'Admin authentication required'});try{const enrollmentId=clean(req.body?.enrollmentId,100);const cert=await issueForEnrollment(enrollmentId);if(!cert)return res.status(400).json({message:'Certificate can only be issued for a completed enrollment with a valid trainee email'});res.status(201).json({ok:true,certificate:cert})}catch(err){console.error(err);res.status(500).json({message:'Unable to issue training certificate'})}});
install('get','/api/training-certificates/:certificateId',async(req,res)=>{try{const c=await Certificate.findOne({certificateId:clean(req.params.certificateId,100)}).lean();if(!c)return res.status(404).json({message:'Certificate not found'});const t=await Trainee.findOne({traineeId:c.traineeId}).lean();res.json({...c,idType:c.idType||t?.idType||'',idNumber:c.idNumber||t?.idNumber||'',trainingId:c.trainingId||c.courseId||'',durationHours:c.durationHours??'',level:c.level||'',trainingTopics:Array.isArray(c.trainingTopics)?c.trainingTopics:[],trainerName:c.trainerName||'',signatureName:c.signatureName||c.trainerName||''})}catch(err){res.status(500).json({message:'Unable to load certificate'})}});
install('get','/api/training-certificates/:certificateId/qr',async(req,res)=>{try{const c=await Certificate.findOne({certificateId:clean(req.params.certificateId,100)}).lean();if(!c)return res.status(404).end();const png=await QRCode.toBuffer(verifyLink(c.certificateId),{width:180,margin:1,color:{dark:'#0B1F33',light:'#FFFFFF'}});res.type('png').send(png)}catch(err){res.status(500).end()}});
install('get','/api/verify/training-certificate',async(req,res)=>{try{const c=await Certificate.findOne({certificateId:clean(req.query?.id,100)}).lean();if(!c)return res.status(404).json({valid:false,message:'Certificate not found'});const t=await Trainee.findOne({traineeId:c.traineeId}).lean();res.json({valid:c.verificationStatus==='valid',documentType:'Training Certificate',documentTypeAr:'شهادة إتمام دورة تدريبية',certificateId:c.certificateId,traineeId:c.traineeId,recipientNameEn:c.recipientNameEn,recipientNameAr:c.recipientNameAr,courseNameEn:c.courseNameEn,courseNameAr:c.courseNameAr,idType:c.idType||t?.idType||'',idNumber:c.idNumber||t?.idNumber||'',issuedAt:c.issuedAt,status:c.verificationStatus})}catch(err){res.status(500).json({valid:false,message:'Unable to verify certificate'})}});
install('get','/api/admin/training-certificates',async(req,res)=>{if(!(await adminAuth(req)))return res.status(401).json({message:'Admin authentication required'});try{const rows=await Certificate.find({}).sort({issuedAt:-1}).limit(20000).lean();res.json({summary:{certificates:rows.length},certificates:rows})}catch(err){res.status(500).json({message:'Unable to load training certificates'})}});
function registerTrainingCertificateDirectRoutes(app){
  app.get('/api/training-certificates/:certificateId',async(req,res)=>{
    try{
      const certificateId=clean(req.params.certificateId,100);
      const cert=await Certificate.findOne({certificateId}).lean();
      if(!cert)return res.status(404).json({message:'Certificate not found'});
      const trainee=await Trainee.findOne({traineeId:cert.traineeId}).lean();
      const courseQuery=mongoose.Types.ObjectId.isValid(String(cert.courseId||''))?{_id:new mongoose.Types.ObjectId(String(cert.courseId))}:{$or:[{code:cert.courseId},{slug:cert.courseId},{id:cert.courseId},{nameEn:cert.courseNameEn},{courseNameEn:cert.courseNameEn},{en:cert.courseNameEn}]};
      const course=await mongoose.connection.collection('trainingcourses').findOne(courseQuery);
      const legacy=LEGACY_COURSE_META[cert.trainingId||cert.courseId]||{};
      const durationHours=cert.durationHours??course?.durationHours??legacy.durationHours??'';
      const level=cert.level||course?.level||legacy.level||'';
      const trainingTopics=Array.isArray(cert.trainingTopics)&&cert.trainingTopics.length?cert.trainingTopics:(Array.isArray(course?.trainingTopics)&&course.trainingTopics.length?course.trainingTopics:(legacy.trainingTopics||[]));
      const trainerName=cert.trainerName||course?.trainerName||course?.instructor||'';
      const signatureName=cert.signatureName||trainerName;
      res.set('Cache-Control','no-store').json({...cert,idType:cert.idType||trainee?.idType||'',idNumber:cert.idNumber||trainee?.idNumber||'',trainingId:cert.trainingId||course?.code||cert.courseId||'',durationHours,level,trainingTopics,trainerName,signatureName});
    }catch(err){console.error('Certificate load failed',err);res.status(500).json({message:'Unable to load certificate'})}
  });
  app.get('/api/training-certificates/:certificateId/qr',async(req,res)=>{
    try{
      const certificateId=clean(req.params.certificateId,100);
      const cert=await Certificate.findOne({certificateId}).lean();
      if(!cert)return res.status(404).end();
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
      const rawId=String(cert.idNumber||trainee?.idNumber||''); const maskedId=rawId.length>4?'•'.repeat(Math.max(0,rawId.length-4))+rawId.slice(-4):rawId; res.set('Cache-Control','no-store').json({valid:cert.verificationStatus==='valid',documentType:'Training Certificate',documentTypeAr:'شهادة إتمام دورة تدريبية',certificateId:cert.certificateId,recipientNameEn:cert.recipientNameEn,recipientNameAr:cert.recipientNameAr,courseNameEn:cert.courseNameEn,courseNameAr:cert.courseNameAr,idType:cert.idType||trainee?.idType||'',idNumberMasked:maskedId,issuedAt:cert.issuedAt,status:cert.verificationStatus,verificationUrl:verifyLink(certificateId)});
    }catch(err){console.error('Certificate verification failed',err);res.status(500).json({valid:false,message:'Unable to verify certificate'})}
  });
}

module.exports={issueForEnrollment,registerTrainingCertificateDirectRoutes};
