const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const helmet=require('helmet');
const rateLimit=require('express-rate-limit');
const crypto=require('crypto');
require('dotenv').config();

const app=express();
app.set('trust proxy',1);
const origins=(process.env.FRONTEND_URL||'').split(',').map(x=>x.trim()).filter(Boolean);
app.use(helmet());
app.use(cors({origin:origins.length?origins:true,credentials:false}));
app.use(express.json({limit:'50kb'}));
app.use(rateLimit({windowMs:60*1000,max:120,standardHeaders:true,legacyHeaders:false}));

const ADMIN_EMAIL=(process.env.ADMIN_EMAIL||'Abdallah-Shalaby1@outlook.com').trim().toLowerCase();
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'';
const ADMIN_SESSION_SECRET=process.env.ADMIN_SESSION_SECRET||'';
const adminLoginLimiter=rateLimit({windowMs:15*60*1000,max:10,standardHeaders:true,legacyHeaders:false,message:{message:'Too many login attempts. Please try again later.'}});

const StatSchema=new mongoose.Schema({slug:{type:String,unique:true,index:true},views:{type:Number,default:0},entries:{type:Number,default:0},positiveRatings:{type:Number,default:0},ratingSum:{type:Number,default:0},ratingCount:{type:Number,default:0}},{timestamps:true});
const Stat=mongoose.model('CourseStat',StatSchema);
const FeedbackSchema=new mongoose.Schema({slug:{type:String,index:true},note:{type:String,required:true,maxlength:300,trim:true}},{timestamps:true});
const Feedback=mongoose.model('CourseFeedback',FeedbackSchema);
const ContactMessageSchema=new mongoose.Schema({
  name:{type:String,required:true,trim:true,maxlength:120},
  email:{type:String,required:true,trim:true,lowercase:true,maxlength:180},
  message:{type:String,required:true,trim:true,maxlength:5000},
  status:{type:String,enum:['new','replied','closed'],default:'new',index:true},
  repliedAt:{type:Date,default:null},
  createdAt:{type:Date,default:Date.now}
},{timestamps:true});
const ContactMessage=mongoose.model('ContactMessage',ContactMessageSchema);

const VisitorSchema=new mongoose.Schema({visitorId:{type:String,required:true,unique:true,index:true},name:{type:String,required:true,trim:true,maxlength:120},email:{type:String,required:true,trim:true,lowercase:true,maxlength:180},linkedin:{type:String,trim:true,maxlength:300,default:''},egyptPhone:{type:String,trim:true,maxlength:30,default:''},outlookEmail:{type:String,trim:true,lowercase:true,maxlength:180,default:''},consent:{type:Boolean,required:true,default:false},registeredAt:{type:Date,default:Date.now},challengeStartedAt:{type:Date,default:null},challengeCompletedAt:{type:Date,default:null},score:{type:Number,min:0,max:10,default:null}},{timestamps:true});
const Visitor=mongoose.model('Visitor',VisitorSchema);

const TraineeSchema=new mongoose.Schema({
  traineeId:{type:String,required:true,unique:true,index:true},
  arabicFirstName:{type:String,required:true,trim:true,maxlength:60},
  arabicMiddleName:{type:String,required:true,trim:true,maxlength:60},
  arabicLastName:{type:String,required:true,trim:true,maxlength:60},
  englishFirstName:{type:String,required:true,trim:true,maxlength:60},
  englishMiddleName:{type:String,required:true,trim:true,maxlength:60},
  englishLastName:{type:String,required:true,trim:true,maxlength:60},
  idType:{type:String,required:true,enum:['national_id','iqama','passport']},
  idNumber:{type:String,required:true,trim:true,maxlength:40,index:true},
  mobile:{type:String,required:true,trim:true,maxlength:30},
  email:{type:String,required:true,trim:true,lowercase:true,maxlength:180,index:true}
},{timestamps:true});
const Trainee=mongoose.model('Trainee',TraineeSchema);

const EnrollmentSchema=new mongoose.Schema({
  enrollmentId:{type:String,required:true,unique:true,index:true},
  traineeId:{type:String,required:true,index:true},
  courseId:{type:String,required:true,index:true},
  courseNameEn:{type:String,required:true},
  courseNameAr:{type:String,required:true},
  registrationType:{type:String,required:true,enum:['individual','company']},
  companyName:{type:String,trim:true,maxlength:160,default:''},
  companyContact:{type:String,trim:true,maxlength:120,default:''},
  companyEmail:{type:String,trim:true,lowercase:true,maxlength:180,default:''},
  status:{type:String,enum:['pending','confirmed','active','completed','cancelled'],default:'pending',index:true},
  registeredAt:{type:Date,default:Date.now}
},{timestamps:true});
EnrollmentSchema.index({traineeId:1,courseId:1},{unique:true});
const Enrollment=mongoose.model('Enrollment',EnrollmentSchema);

const courses={
 'traffic-management-vehicle-control':{id:'CRS-TRAFFIC-001',en:'TRAFFIC MANAGEMENT & VEHICLE CONTROL',ar:'إدارة حركة المرور والتحكم في المركبات في الموقع'},
 'crowd-management-event-security':{id:'CRS-CROWD-001',en:'CROWD MANAGEMENT & EVENT SECURITY',ar:'إدارة الحشود وتأمين الفعاليات والمناسبات الكبرى'},
 'fire-safety-emergency-response':{id:'CRS-FIRE-001',en:'FIRE SAFETY & EMERGENCY RESPONSE',ar:'السلامة من الحرائق وتدابير الاستجابة للطوارئ'},
 'vehicle-search-security-inspection':{id:'CRS-VEHICLE-001',en:'VEHICLE SEARCH & SECURITY INSPECTION',ar:'تفتيش المركبات والتفتيش الأمني'},
 'person-search-security-screening':{id:'CRS-PERSON-001',en:'PERSON SEARCH & SECURITY SCREENING',ar:'تفتيش الأشخاص وإجراءات التفتيش الأمني'}
};
const allowed=new Set(Object.keys(courses));
function validSlug(req,res,next){if(!allowed.has(req.params.slug))return res.status(404).json({message:'Course not found'});next()}
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}
function publicStats(s){return {slug:s.slug,views:s.views,entries:s.entries,positiveRatings:s.ratingCount?Math.round((s.positiveRatings/s.ratingCount)*100):0,ratingCount:s.ratingCount,averageRating:s.ratingCount?Math.round((s.ratingSum/s.ratingCount)*10)/10:0}}
function clean(v,max){return typeof v==='string'?v.trim().slice(0,max):''}
async function nextNumber(model,prefix,field){const last=await model.findOne({[field]:new RegExp('^'+prefix+'\\d+$')}).sort({[field]:-1}).lean();const n=last?parseInt(last[field].slice(prefix.length),10)+1:1;return prefix+String(n).padStart(6,'0')}
function signToken(payload){const body=Buffer.from(JSON.stringify(payload)).toString('base64url');const sig=crypto.createHmac('sha256',ADMIN_SESSION_SECRET).update(body).digest('base64url');return body+'.'+sig}
function verifyToken(token){try{if(!ADMIN_SESSION_SECRET||typeof token!=='string')return null;const p=token.split('.');if(p.length!==2)return null;const expSig=crypto.createHmac('sha256',ADMIN_SESSION_SECRET).update(p[0]).digest('base64url');const a=Buffer.from(p[1]),b=Buffer.from(expSig);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return null;const payload=JSON.parse(Buffer.from(p[0],'base64url').toString('utf8'));return payload.exp>Date.now()?payload:null}catch{return null}}
function requireAdmin(req,res,next){const auth=req.headers.authorization||'';const session=verifyToken(auth.startsWith('Bearer ')?auth.slice(7):'');if(!session||session.email!==ADMIN_EMAIL)return res.status(401).json({message:'Admin authentication required'});req.admin=session;next()}
function traineeView(t){return {traineeId:t.traineeId,nameAr:[t.arabicFirstName,t.arabicMiddleName,t.arabicLastName].filter(Boolean).join(' '),nameEn:[t.englishFirstName,t.englishMiddleName,t.englishLastName].filter(Boolean).join(' '),idType:t.idType,idNumber:t.idNumber,mobile:t.mobile,email:t.email,createdAt:t.createdAt}}
function enrollmentView(e){return {enrollmentId:e.enrollmentId,traineeId:e.traineeId,courseId:e.courseId,courseNameEn:e.courseNameEn,courseNameAr:e.courseNameAr,registrationType:e.registrationType,companyName:e.companyName,companyContact:e.companyContact,companyEmail:e.companyEmail,status:e.status,registeredAt:e.registeredAt}}
function visitorView(v){return {visitorId:v.visitorId,name:v.name,email:v.email,linkedin:v.linkedin,egyptPhone:v.egyptPhone,outlookEmail:v.outlookEmail,consent:v.consent,registeredAt:v.registeredAt,challengeStartedAt:v.challengeStartedAt,challengeCompletedAt:v.challengeCompletedAt,score:v.score}}

app.get('/health',(req,res)=>res.json({ok:true}));
app.get('/api/courses',async(req,res)=>res.json(Object.entries(courses).map(([slug,c])=>({slug,...c}))));
app.get('/api/course-stats/:slug',validSlug,async(req,res)=>{try{const s=await Stat.findOneAndUpdate({slug:req.params.slug},{$setOnInsert:{slug:req.params.slug}},{new:true,upsert:true});res.json(publicStats(s))}catch(e){res.status(500).json({message:'Unable to load statistics'})}});
app.post('/api/course-stats/:slug/entry',validSlug,async(req,res)=>{try{const s=await Stat.findOneAndUpdate({slug:req.params.slug},{$inc:{views:1,entries:1}},{new:true,upsert:true});res.json(publicStats(s))}catch(e){res.status(500).json({message:'Unable to record entry'})}});
app.post('/api/course-stats/:slug/rating',validSlug,async(req,res)=>{try{const rating=Number(req.body?.rating);if(!Number.isInteger(rating)||rating<1||rating>5)return res.status(400).json({message:'Rating must be 1-5'});const positive=rating>=4?1:0;const s=await Stat.findOneAndUpdate({slug:req.params.slug},{$inc:{ratingSum:rating,ratingCount:1,positiveRatings:positive}},{new:true,upsert:true});res.json(publicStats(s))}catch(e){res.status(500).json({message:'Unable to record rating'})}});
app.post('/api/course-feedback/:slug',validSlug,async(req,res)=>{try{const note=typeof req.body?.note==='string'?req.body.note.trim():'';if(!note)return res.status(400).json({message:'Note is required'});if(note.length>300)return res.status(400).json({message:'Note must be 300 characters or fewer'});await Feedback.create({slug:req.params.slug,note});res.json({ok:true,message:'Feedback received'});}catch(e){res.status(500).json({message:'Unable to save feedback'})}});
app.post('/api/contact-messages',async(req,res)=>{try{const name=clean(req.body?.name,120),email=clean(req.body?.email,180).toLowerCase(),message=clean(req.body?.message,5000);if(name.length<2)return res.status(400).json({message:'Please enter your name'});if(!validEmail(email))return res.status(400).json({message:'Please enter a valid email'});if(message.length<2)return res.status(400).json({message:'Please enter your message'});const row=await ContactMessage.create({name,email,message});res.status(201).json({ok:true,id:row._id,createdAt:row.createdAt,status:row.status});}catch(e){console.error(e);res.status(500).json({message:'Unable to save contact message'})}});

app.post('/api/admin/login',adminLoginLimiter,(req,res)=>{try{if(!ADMIN_PASSWORD||!ADMIN_SESSION_SECRET)return res.status(503).json({message:'Admin security is not configured on the server'});const email=clean(req.body?.email,180).toLowerCase();const password=typeof req.body?.password==='string'?req.body.password:'';if(email!==ADMIN_EMAIL||password!==ADMIN_PASSWORD)return res.status(401).json({message:'Invalid admin credentials'});res.json({ok:true,email:ADMIN_EMAIL,token:signToken({email:ADMIN_EMAIL,role:'admin',exp:Date.now()+8*60*60*1000})})}catch(e){res.status(500).json({message:'Unable to sign in'})}});
app.get('/api/admin/me',requireAdmin,(req,res)=>res.json({ok:true,email:req.admin.email,role:req.admin.role}));
app.get('/api/admin/dashboard',requireAdmin,async(req,res)=>{try{const [trainees,enrollments,visitors,stats,feedback]=await Promise.all([Trainee.countDocuments(),Enrollment.countDocuments(),Visitor.countDocuments(),Stat.find().sort({entries:-1}).lean(),Feedback.countDocuments()]);res.json({trainees,enrollments,visitors,feedback,stats:stats.map(publicStats)})}catch(e){res.status(500).json({message:'Unable to load dashboard'})}});
app.get('/api/admin/trainees',requireAdmin,async(req,res)=>{try{const q=clean(req.query?.q,120);const filter=q?{$or:[{traineeId:new RegExp(q,'i')},{idNumber:new RegExp(q,'i')},{email:new RegExp(q,'i')},{arabicFirstName:new RegExp(q,'i')},{arabicLastName:new RegExp(q,'i')},{englishFirstName:new RegExp(q,'i')},{englishLastName:new RegExp(q,'i') }]}:{};const rows=await Trainee.find(filter).sort({createdAt:-1}).limit(500).lean();res.json(rows.map(traineeView))}catch(e){res.status(500).json({message:'Unable to load trainees'})}});
app.get('/api/admin/enrollments',requireAdmin,async(req,res)=>{try{const q=clean(req.query?.q,120),status=clean(req.query?.status,30);const filter={};if(status)filter.status=status;if(q)filter.$or=[{enrollmentId:new RegExp(q,'i')},{traineeId:new RegExp(q,'i')},{courseNameEn:new RegExp(q,'i')},{courseNameAr:new RegExp(q,'i')},{companyName:new RegExp(q,'i')}];const rows=await Enrollment.find(filter).sort({registeredAt:-1}).limit(500).lean();res.json(rows.map(enrollmentView))}catch(e){res.status(500).json({message:'Unable to load enrollments'})}});
app.patch('/api/admin/enrollments/:enrollmentId/status',requireAdmin,async(req,res)=>{try{const status=clean(req.body?.status,30);if(!['pending','confirmed','active','completed','cancelled'].includes(status))return res.status(400).json({message:'Invalid status'});const e=await Enrollment.findOneAndUpdate({enrollmentId:req.params.enrollmentId},{$set:{status}},{new:true});if(!e)return res.status(404).json({message:'Enrollment not found'});res.json(enrollmentView(e))}catch(e){res.status(500).json({message:'Unable to update enrollment'})}});
app.get('/api/admin/visitors',requireAdmin,async(req,res)=>{try{const rows=await Visitor.find().sort({registeredAt:-1}).limit(500).lean();res.json(rows.map(visitorView))}catch(e){res.status(500).json({message:'Unable to load visitors'})}});
app.get('/api/admin/feedback',requireAdmin,async(req,res)=>{try{const rows=await Feedback.find().sort({createdAt:-1}).limit(500).lean();res.json(rows)}catch(e){res.status(500).json({message:'Unable to load feedback'})}});
app.get('/api/admin/contact-messages',requireAdmin,async(req,res)=>{try{const rows=await ContactMessage.find().sort({createdAt:-1}).limit(500).lean();res.json(rows.map(x=>({id:String(x._id),name:x.name,email:x.email,message:x.message,status:x.status,repliedAt:x.repliedAt,createdAt:x.createdAt})))}catch(e){res.status(500).json({message:'Unable to load contact messages'})}});
app.patch('/api/admin/contact-messages/:id/status',requireAdmin,async(req,res)=>{try{const status=clean(req.body?.status,20);if(!['new','replied','closed'].includes(status))return res.status(400).json({message:'Invalid status'});const row=await ContactMessage.findByIdAndUpdate(req.params.id,{$set:{status,repliedAt:status==='replied'?new Date():null}},{new:true});if(!row)return res.status(404).json({message:'Contact message not found'});res.json({ok:true,id:String(row._id),status:row.status,repliedAt:row.repliedAt})}catch(e){res.status(500).json({message:'Unable to update contact message'})}});

app.post('/api/course-registration',async(req,res)=>{
 try{
  const b=req.body||{};
  const fields={
   arabicFirstName:clean(b.arabicFirstName,60),arabicMiddleName:clean(b.arabicMiddleName,60),arabicLastName:clean(b.arabicLastName,60),
   englishFirstName:clean(b.englishFirstName,60),englishMiddleName:clean(b.englishMiddleName,60),englishLastName:clean(b.englishLastName,60),
   idType:clean(b.idType,30),idNumber:clean(b.idNumber,40),mobile:clean(b.mobile,30),email:clean(b.email,180).toLowerCase(),
   registrationType:clean(b.registrationType,20),companyName:clean(b.companyName,160),companyContact:clean(b.companyContact,120),companyEmail:clean(b.companyEmail,180).toLowerCase()
  };
  if(!allowed.has(b.courseSlug))return res.status(400).json({message:'Please select a valid course'});
  const required=['arabicFirstName','arabicMiddleName','arabicLastName','englishFirstName','englishMiddleName','englishLastName','idType','idNumber','mobile','email','registrationType'];
  if(required.some(k=>!fields[k]))return res.status(400).json({message:'Please complete all required fields'});
  if(b.consent!==true)return res.status(400).json({message:'Consent is required'});
  if(!['national_id','iqama','passport'].includes(fields.idType))return res.status(400).json({message:'Invalid ID type'});
  if(!['individual','company'].includes(fields.registrationType))return res.status(400).json({message:'Invalid registration type'});
  if(!validEmail(fields.email))return res.status(400).json({message:'Please enter a valid email'});
  if(fields.companyEmail&&!validEmail(fields.companyEmail))return res.status(400).json({message:'Please enter a valid company email'});
  if(fields.registrationType==='company'&&!fields.companyName)return res.status(400).json({message:'Company name is required for company registration'});
  const c=courses[b.courseSlug];
  let trainee=await Trainee.findOne({idNumber:fields.idNumber});
  if(trainee){trainee.set(fields);await trainee.save()}else{const traineeId=await nextNumber(Trainee,'TRN-','traineeId');trainee=await Trainee.create({traineeId,...fields})}
  const existing=await Enrollment.findOne({traineeId:trainee.traineeId,courseId:c.id});
  if(existing)return res.status(409).json({message:'This trainee is already registered for this course',traineeId:trainee.traineeId,enrollmentId:existing.enrollmentId,status:existing.status});
  const enrollmentId=await nextNumber(Enrollment,'ENR-','enrollmentId');
  const enrollment=await Enrollment.create({enrollmentId,traineeId:trainee.traineeId,courseId:c.id,courseNameEn:c.en,courseNameAr:c.ar,registrationType:fields.registrationType,companyName:fields.companyName,companyContact:fields.companyContact,companyEmail:fields.companyEmail});
  await Stat.findOneAndUpdate({slug:b.courseSlug},{$inc:{entries:1}},{upsert:true});
  res.status(201).json({ok:true,traineeId:trainee.traineeId,enrollmentId:enrollment.enrollmentId,status:enrollment.status,course:c});
 }catch(e){console.error(e);res.status(500).json({message:'Unable to complete course registration'})}
});

app.post('/api/visitor/register',async(req,res)=>{try{const {visitorId,name,email,linkedin,egyptPhone,outlookEmail,consent}=req.body||{};const cleanName=clean(name,120),cleanEmail=clean(email,180).toLowerCase(),cleanLinkedin=clean(linkedin,300),cleanEgyptPhone=clean(egyptPhone,30),cleanOutlook=clean(outlookEmail,180).toLowerCase();if(!visitorId||typeof visitorId!=='string'||visitorId.length>100)return res.status(400).json({message:'Invalid visitor ID'});if(cleanName.length<2)return res.status(400).json({message:'Please enter your name'});if(!validEmail(cleanEmail))return res.status(400).json({message:'Please enter a valid email'});if(cleanOutlook&&(!validEmail(cleanOutlook)||cleanOutlook.length>180))return res.status(400).json({message:'Please enter a valid Outlook email'});if(consent!==true)return res.status(400).json({message:'Consent is required'});const visitor=await Visitor.findOneAndUpdate({visitorId},{$set:{name:cleanName,email:cleanEmail,linkedin:cleanLinkedin,egyptPhone:cleanEgyptPhone,outlookEmail:cleanOutlook,consent:true,registeredAt:new Date(),challengeStartedAt:new Date(),challengeCompletedAt:null,score:null}},{new:true,upsert:true,setDefaultsOnInsert:true});res.json({ok:true,visitorId:visitor.visitorId,challengeStartedAt:visitor.challengeStartedAt});}catch(e){console.error(e);res.status(500).json({message:'Unable to register visitor'})}});
app.post('/api/visitor/challenge-complete',async(req,res)=>{try{const {visitorId,score}=req.body||{};const numericScore=Number(score);if(!visitorId||typeof visitorId!=='string')return res.status(400).json({message:'Invalid visitor ID'});if(!Number.isInteger(numericScore)||numericScore<0||numericScore>10)return res.status(400).json({message:'Score must be 0-10'});const visitor=await Visitor.findOneAndUpdate({visitorId},{$set:{challengeCompletedAt:new Date(),score:numericScore}},{new:true});if(!visitor)return res.status(404).json({message:'Visitor registration not found'});res.json({ok:true,challengeCompletedAt:visitor.challengeCompletedAt,score:visitor.score});}catch(e){console.error(e);res.status(500).json({message:'Unable to save challenge result'})}});

const port=process.env.PORT||5000;
async function start(){if(!process.env.MONGODB_URI)throw new Error('MONGODB_URI is required');await mongoose.connect(process.env.MONGODB_URI);app.listen(port,()=>console.log(`Training API listening on ${port}`))}
start().catch(e=>{console.error(e);process.exit(1)});
