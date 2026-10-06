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

const FIRE_SCREENS={
m1:[
{id:'m1s1',titleEn:'Why Fire Safety Matters',titleAr:'لماذا تعتبر السلامة من الحرائق مهمة؟',bodyEn:'Fire can injure people, damage property and stop normal operations. Security staff may be among the first to notice a fire or alarm.',bodyAr:'قد يؤدي الحريق إلى إصابات وخسائر مادية وتعطيل العمليات. وقد يكون أفراد الأمن من أوائل من يلاحظون الحريق أو الإنذار.',videoUrl:'',questions:[
{q:'What is a key reason security staff need fire-safety awareness?',a:['To protect life and support safe response','To replace the fire service','To repair fire pumps','To ignore alarms'],correct:0},
{q:'What should come first during a fire emergency?',a:['Life safety','Property protection','Routine paperwork','Vehicle parking'],correct:0},
{q:'A security officer may be among the first people to:',a:['Notice a fire or alarm','Design a sprinkler system','Certify a building code','Repair an alarm panel'],correct:0}]},
{id:'m1s2',titleEn:'The Fire Triangle',titleAr:'مثلث الحريق',bodyEn:'Combustion requires heat, fuel and oxygen. Removing one element can interrupt combustion.',bodyAr:'يحتاج الاحتراق إلى الحرارة والوقود والأكسجين. ويمكن أن يؤدي إزالة أحد هذه العناصر إلى إيقاف الاحتراق.',videoUrl:'',questions:[
{q:'Which three elements form the basic fire triangle?',a:['Heat, fuel and oxygen','Water, smoke and air','Fuel, smoke and water','Heat, alarm and water'],correct:0},
{q:'What happens when one triangle element is removed?',a:['Combustion can be interrupted','The fire must become larger','The alarm stops automatically','Evacuation is no longer needed'],correct:0},
{q:'Which is an example of fuel?',a:['Wood','Oxygen','Heat','Alarm sound'],correct:0}]},
{id:'m1s3',titleEn:'Heat, Fuel and Oxygen',titleAr:'الحرارة والوقود والأكسجين',bodyEn:'Heat can come from sparks, flames, hot surfaces or friction. Fuel may be solid, liquid, vapour or gas. Oxygen commonly comes from surrounding air.',bodyAr:'قد تأتي الحرارة من الشرر أو اللهب أو الأسطح الساخنة أو الاحتكاك. وقد يكون الوقود صلبًا أو سائلًا أو بخارًا أو غازًا. ويأتي الأكسجين عادةً من الهواء المحيط.',videoUrl:'',questions:[
{q:'Which is a possible ignition source?',a:['Electrical spark','Assembly point','Emergency exit sign','Attendance sheet'],correct:0},
{q:'Which can be a fuel?',a:['Propane gas','Oxygen only','Alarm signal','Escape route'],correct:0},
{q:'Oxygen commonly comes from:',a:['Surrounding air','The alarm panel','The fire exit sign','The attendance list'],correct:0}]}
],
m2:[
{id:'m2s1',titleEn:'Fire Classification',titleAr:'تصنيف الحرائق',bodyEn:'Classifying a fire by the fuel involved helps personnel select suitable equipment and communicate the hazard. Always follow current local procedures and extinguisher labels.',bodyAr:'يساعد تصنيف الحريق حسب نوع الوقود على اختيار وسيلة الإطفاء المناسبة والتواصل بشأن الخطر. يجب دائمًا اتباع الإجراءات المحلية الحالية وملصقات طفايات الحريق.',videoUrl:'',questions:[
{q:'Why is fire classification useful?',a:['It helps identify suitable extinguishing equipment','It removes the need for evacuation','It replaces the emergency plan','It guarantees a fire is small'],correct:0},
{q:'What should be checked before using an extinguisher?',a:['Its label and site procedures','Only its color','Only its weight','The parking plan'],correct:0},
{q:'Who should use fire equipment?',a:['People trained and authorized to do so','Anyone who sees a fire','Only visitors','Only reception staff'],correct:0}]},
{id:'m2s2',titleEn:'Portable Extinguishing Agents',titleAr:'وسائط الإطفاء المحمولة',bodyEn:'Different fires require suitable extinguishing agents. Equipment must match the fire type and be used only when conditions are safe and the person is trained.',bodyAr:'تتطلب أنواع الحرائق المختلفة وسائط إطفاء مناسبة. يجب أن تتوافق المعدة مع نوع الحريق وأن تستخدم فقط عندما تكون الظروف آمنة والشخص مدربًا.',videoUrl:'',questions:[
{q:'Why must the extinguisher match the fire?',a:['An unsuitable agent can be ineffective or unsafe','All extinguishers work on every fire','It changes the alarm code','It removes the need for training'],correct:0},
{q:'When should a portable extinguisher be used?',a:['Only when trained and conditions are safe','Whenever smoke is visible','Before raising the alarm','When an escape route is blocked'],correct:0},
{q:'Where should the escape route be?',a:['Clear and available behind the user','Blocked by equipment','Outside the building only','Inside the fire room'],correct:0}]},
{id:'m2s3',titleEn:'PASS and Fire Blankets',titleAr:'طريقة PASS وبطانيات الحريق',bodyEn:'PASS means Pull, Aim, Squeeze and Sweep. A fire blanket may be used on a small contained fire when appropriate and safe.',bodyAr:'تعني PASS: اسحب، وجّه، اضغط، وحرّك. ويمكن استخدام بطانية الحريق على حريق صغير ومحدود عندما يكون ذلك مناسبًا وآمنًا.',videoUrl:'',questions:[
{q:'What does PASS begin with?',a:['Pull','Aim','Squeeze','Sweep'],correct:0},
{q:'What is a fire blanket mainly intended to do?',a:['Smother a small contained fire','Increase oxygen','Cool an entire building','Replace evacuation'],correct:0},
{q:'After using a fire blanket on a small fire, what should be done?',a:['Leave it in place and follow emergency procedures','Remove it immediately','Return to normal work','Ignore the alarm'],correct:0}]}
],
m3:[
{id:'m3s1',titleEn:'Fire Detection and Alarm Systems',titleAr:'أنظمة كشف وإنذار الحريق',bodyEn:'Buildings may use detectors, alarms and a control panel. Security personnel should know the installed system and authorized response procedures.',bodyAr:'قد تستخدم المنشآت كواشف وإنذارات ولوحة تحكم. ويجب أن يعرف أفراد الأمن النظام المركب وإجراءات الاستجابة المعتمدة.',videoUrl:'',questions:[
{q:'What should security personnel know about an alarm system?',a:['The installed system and authorized procedures','How to redesign it','How to disable it','Only its color'],correct:0},
{q:'A control panel can help identify:',a:['The indicated alarm location','The final certificate score','The visitor list','The weather'],correct:0},
{q:'Should alarms be ignored until smoke is visible?',a:['No','Yes','Only at night','Only during drills'],correct:0}]},
{id:'m3s2',titleEn:'Responding to an Alarm',titleAr:'الاستجابة للإنذار',bodyEn:'Use the approved response sequence. Locate the indicated area, verify safely through authorized methods and escalate according to site procedures.',bodyAr:'استخدم تسلسل الاستجابة المعتمد. حدد المنطقة المشار إليها وتحقق بطريقة آمنة من خلال الوسائل المصرح بها وصعّد البلاغ وفق إجراءات الموقع.',videoUrl:'',questions:[
{q:'How should an alarm be checked?',a:['Using authorized and safe procedures','By entering any fire area immediately','By switching off the alarm','By waiting for others to notice'],correct:0},
{q:'If a fire is confirmed, what should happen?',a:['Raise the alarm and start emergency procedures','Hide the information','Continue routine duties','Block emergency access'],correct:0},
{q:'What should guide the response?',a:['Site emergency procedures','Personal guesses','Social media posts','Visitor requests'],correct:0}]},
{id:'m3s3',titleEn:'RACE: Discovering a Fire',titleAr:'RACE: عند اكتشاف حريق',bodyEn:'RACE: Rescue people from immediate danger when safe; Alert others; Confine by closing doors if safe; Extinguish only if trained, safe and the fire is small.',bodyAr:'RACE: إنقاذ الأشخاص من الخطر المباشر عندما يكون ذلك آمنًا؛ تنبيه الآخرين؛ حصر الحريق بإغلاق الأبواب إذا كان آمنًا؛ وإطفاؤه فقط عند التدريب وتوافر الأمان وصغر الحريق.',videoUrl:'',questions:[
{q:'What does the A in RACE mean?',a:['Alert','Aim','Assess','Access'],correct:0},
{q:'When should you extinguish a fire?',a:['Only if trained, safe and the fire is small','Whenever the alarm sounds','Before warning people','If smoke is heavy'],correct:0},
{q:'What does Confine mean in RACE?',a:['Close doors if safe to limit fire spread','Move everyone into the fire room','Disable alarms','Open all doors'],correct:0}]}
],
m4:[
{id:'m4s1',titleEn:'Before Fighting a Fire',titleAr:'قبل محاولة إطفاء الحريق',bodyEn:'Keep an escape route clear, warn people, begin evacuation when required and use equipment only within training and site procedures.',bodyAr:'حافظ على طريق هروب واضح، وحذّر الأشخاص، وابدأ الإخلاء عند الحاجة، واستخدم المعدات فقط ضمن التدريب وإجراءات الموقع.',videoUrl:'',questions:[
{q:'What must remain available before using an extinguisher?',a:['A clear escape route','A locked exit','A blocked corridor','A closed alarm panel'],correct:0},
{q:'When should you retreat?',a:['If the fire grows, smoke increases or escape is threatened','Only after the fire is extinguished','Never','Only when a supervisor leaves'],correct:0},
{q:'What takes priority over property protection?',a:['Life safety','Vehicle movement','Paperwork','Cleaning'],correct:0}]},
{id:'m4s2',titleEn:'Facility Fire Plans and Site Procedures',titleAr:'خطط الحريق وإجراءات المنشأة',bodyEn:'Know exits, alarm signals, emergency contacts, assembly points and the responsibilities assigned to security and fire wardens.',bodyAr:'اعرف المخارج وإشارات الإنذار وجهات الاتصال في الطوارئ ونقاط التجمع والمسؤوليات الموكلة إلى الأمن ومراقبي الحريق.',videoUrl:'',questions:[
{q:'Why should security personnel know the fire plan?',a:['To support a coordinated and safe response','To replace emergency responders','To change building design','To avoid reporting incidents'],correct:0},
{q:'Which location should be known in advance?',a:['Assembly point','Private office only','Parking payment desk','Cafeteria menu'],correct:0},
{q:'Emergency contacts should be:',a:['Known and available through site procedures','Kept secret from security','Used only after evacuation ends','Stored only on paper in a locked room'],correct:0}]},
{id:'m4s3',titleEn:'Security Vigilance and Deliberate Fire',titleAr:'اليقظة الأمنية والحريق المتعمد',bodyEn:'Observe and report facts such as suspicious activity, tampering with alarms or unusual ignition materials. Avoid unsupported accusations.',bodyAr:'راقب وأبلغ عن الحقائق مثل النشاط المشبوه أو العبث بأجهزة الإنذار أو وجود مواد إشعال غير معتادة. وتجنب الاتهامات غير المدعومة بالأدلة.',videoUrl:'',questions:[
{q:'What should security staff report?',a:['Objective observations through site procedures','Rumors','Unsupported accusations','Personal social media posts'],correct:0},
{q:'What may require attention?',a:['Tampering with alarms or detectors','A normal meeting','A clean exit','A posted emergency map'],correct:0},
{q:'What should be avoided?',a:['Unsupported accusations','Factual reporting','Following procedures','Preserving evidence'],correct:0}]}
],
m5:[
{id:'m5s1',titleEn:'Emergency Evacuation',titleAr:'الإخلاء في حالات الطوارئ',bodyEn:'Know exits, escape routes and assembly points. Keep emergency access, exits, hydrants and hose reels clear.',bodyAr:'اعرف المخارج ومسارات الهروب ونقاط التجمع. وحافظ على خلو مسارات الطوارئ والمخارج ومآخذ المياه وبكرات الخراطيم.',videoUrl:'',questions:[
{q:'What should people know before an emergency?',a:['Exits, routes and assembly points','Only the nearest lift','Only the parking area','Only the reception desk'],correct:0},
{q:'Emergency access should be:',a:['Kept clear','Used for parking','Blocked by equipment','Closed permanently'],correct:0},
{q:'What is an assembly point for?',a:['Safe gathering and accountability after evacuation','Storing extinguishers','Parking vehicles','Replacing the alarm system'],correct:0}]},
{id:'m5s2',titleEn:'Directing an Evacuation',titleAr:'توجيه عملية الإخلاء',bodyEn:'Stay calm, give clear directions, assist people who need support and support accountability at the assembly point.',bodyAr:'حافظ على الهدوء، وقدّم توجيهات واضحة، وساعد الأشخاص الذين يحتاجون إلى دعم، وساهم في حصر الأفراد عند نقطة التجمع.',videoUrl:'',questions:[
{q:'How should evacuation directions be given?',a:['Calmly and clearly','By shouting conflicting instructions','Without following the plan','Only after everyone leaves'],correct:0},
{q:'Who may need additional assistance?',a:['People requiring support','Only supervisors','Only visitors','No one'],correct:0},
{q:'What is accountability used for?',a:['Checking who reached the assembly point','Counting vehicles','Checking room temperatures','Issuing certificates'],correct:0}]},
{id:'m5s3',titleEn:'Incident Command and Final Review',titleAr:'إدارة الحوادث والمراجعة النهائية',bodyEn:'Incident command supports organized emergency response. Learners should connect fire recognition, alarm, evacuation, communication and safe decision-making.',bodyAr:'تساعد إدارة الحوادث على تنظيم الاستجابة للطوارئ. ويجب على المتدرب ربط التعرف على الحريق والإنذار والإخلاء والتواصل واتخاذ القرار الآمن.',videoUrl:'',questions:[
{q:'What is a main purpose of incident command?',a:['Organize the emergency response','Replace all site procedures','Prevent communication','Delay evacuation'],correct:0},
{q:'Which elements should be connected during the course?',a:['Recognition, alarm, evacuation and communication','Parking, catering and finance','Sales, marketing and travel','Only equipment cleaning'],correct:0},
{q:'What is the course mastery threshold for a learning screen?',a:['80%','50%','60%','100%'],correct:0}]}
]};
const FIRE_SCREEN_LIST=Object.values(FIRE_SCREENS).flat();
const screenById=new Map(FIRE_SCREEN_LIST.map(x=>[x.id,x]));

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

async function sendAccessEmail({to,name,course,token,expiresAt}){
  const apiKey=(process.env.BREVO_API_KEY||'').trim();
  const from=(process.env.MAIL_FROM||'').trim();
  if(!apiKey||!from)return {sent:false,error:'Brevo email settings are not configured'};
  const link=FRONTEND_URL+'#token='+encodeURIComponent(token);
  const expiry=new Date(expiresAt).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'});
  const subject='SECURITY INSTRUCTOR — Fire Safety Self-Study Access';
  const text='Dear '+name+',\\n\\nYour access to '+course.en+' / '+course.ar+' is ready.\\n\\nAccess window: '+course.accessHours+' hours.\\nStart: '+link+'\\nAccess expires: '+expiry+'\\n\\nComplete the learning screens, achieve at least 80% on required knowledge checks, then complete the 30-question final assessment. The final assessment pass mark is 70%.\\n\\nSECURITY INSTRUCTOR';
  const html='<!doctype html><html><body style="font-family:Arial,sans-serif;color:#0B1F33"><h2 style="color:#0B1F33">SECURITY INSTRUCTOR</h2><p>Dear '+name+',</p><p>Your access to <strong>'+course.en+'</strong> / <strong>'+course.ar+'</strong> is ready.</p><p>This is a self-study course. Your access window is <strong>'+course.accessHours+' hours</strong>.</p><p><a href="'+link+'" style="display:inline-block;padding:12px 18px;background:#C8A96B;color:#0B1F33;text-decoration:none;font-weight:bold">START SELF-STUDY / ابدأ الدراسة الذاتية</a></p><p>Access expires: '+expiry+'</p><p>Complete the learning screens, achieve at least 80% on required knowledge checks, then complete the 30-question final assessment. The final assessment pass mark is 70%.</p><p>SECURITY INSTRUCTOR<br>Knowledge • Skills • Safer Tomorrow</p></body></html>';
  const response=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{accept:'application/json','api-key':apiKey,'content-type':'application/json'},body:JSON.stringify({sender:{name:'SECURITY INSTRUCTOR',email:from},replyTo:{email:from},to:[{email:to}],subject,textContent:text,htmlContent:html})});
  if(!response.ok){const detail=await response.text().catch(()=> '');throw new Error('Brevo email failed ('+response.status+'): '+detail.slice(0,300));}
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

const screenHandler=async(req,res)=>{
  try{
    const s=screenById.get(clean(req.params.screenId,100));
    if(!s)return res.status(404).json({message:'Learning screen not found'});
    const p=req.selfStudy.progress||baseProgress();
    const pos=FIRE_SCREEN_LIST.findIndex(x=>x.id===s.id);
    if(pos>0){
      const previous=FIRE_SCREEN_LIST[pos-1];
      const previousScore=Number((p.screenScores||{})[previous.id]?.score||0);
      if(previousScore<80)return res.status(403).json({message:'Complete the previous learning screen with at least 80% before continuing.'});
    }
    res.json({id:s.id,moduleId:s.id.slice(0,2),slide:s.slide||null,titleEn:s.titleEn,titleAr:s.titleAr,bodyEn:s.bodyEn,bodyAr:s.bodyAr,videoUrl:s.videoUrl||'',questions:s.questions.map(q=>({q:q.q,options:q.a}))});
  }catch(e){res.status(500).json({message:'Unable to load learning screen'});}
};
const screenAssessmentHandler=async(req,res)=>{
  try{
    const s=screenById.get(clean(req.params.screenId,100));
    if(!s)return res.status(404).json({message:'Learning screen not found'});
    const answers=Array.isArray(req.body?.answers)?req.body.answers:[];
    if(answers.length!==s.questions.length)return res.status(400).json({message:'Please answer all questions'});
    const correct=s.questions.reduce((n,q,i)=>n+(Number(answers[i])===q.correct?1:0),0);
    const score=Math.round(correct/s.questions.length*100);
    const p=req.selfStudy.progress||baseProgress();
    const scores={...(p.screenScores||{})};
    const modules={...(p.modules||{})};
    const previous=scores[s.id];
    scores[s.id]={score,questions:s.questions.length,correct,attempts:Number(previous?.attempts||0)+1,updatedAt:new Date()};
    if(score>=80&&!p.completedScreens.includes(s.id))p.completedScreens=[...p.completedScreens,s.id];
    modules[s.id.slice(0,2)]=Math.max(Number(modules[s.id.slice(0,2)]||0),score);
    const all=Object.values(scores);
    p.cumulativeQuestions=all.reduce((n,x)=>n+Number(x.questions||0),0);
    p.cumulativeCorrect=all.reduce((n,x)=>n+Number(x.correct||0),0);
    p.screenScores=scores;p.modules=modules;
    await mongoose.connection.collection('selfstudyaccess').updateOne({_id:req.selfStudy._id},{$set:{progress:p,updatedAt:new Date()}});
    const cumulative=p.cumulativeQuestions?Math.round(p.cumulativeCorrect/p.cumulativeQuestions*100):0;
    res.json({ok:true,score,passed:score>=80,correct,total:s.questions.length,cumulativeScore:cumulative,attempts:scores[s.id].attempts});
  }catch(e){console.error('Self-study screen assessment error',e);res.status(500).json({message:'Unable to save screen assessment'});}
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
  app.get('/api/self-study/courses/:slug',(req,res)=>{const c=COURSE_META[clean(req.params.slug,80)];if(!c)return res.status(404).json({message:'Self-study course not found'});res.json({...c,screenCount:FIRE_SCREEN_LIST.length});});
  app.get('/api/self-study/courses/:slug/screens',(req,res)=>{const slug=clean(req.params.slug,80),c=COURSE_META[slug];if(!c)return res.status(404).json({message:'Self-study course not found'});res.json({ok:true,screens:FIRE_SCREEN_LIST.map((s,i)=>({id:s.id,moduleId:s.id.slice(0,2),slide:s.slide||null,order:i+1,titleEn:s.titleEn,titleAr:s.titleAr}))});});
  app.get('/api/self-study/screens/:screenId',sessionHandler,screenHandler);
  app.post('/api/self-study/screens/:screenId/assessment',sessionHandler,screenAssessmentHandler);
  app.post('/api/self-study/register',registerHandler);
  app.post('/api/self-study/access/request',requestAccessHandler);
  app.post('/api/self-study/session/exchange',exchangeHandler);
  app.get('/api/self-study/me',sessionHandler,meHandler);
  app.post('/api/self-study/progress',sessionHandler,progressHandler);
  app.post('/api/self-study/final-assessment',sessionHandler,finalHandler);
}
module.exports={register};
