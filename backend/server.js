const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const helmet=require('helmet');
const rateLimit=require('express-rate-limit');
require('dotenv').config();

const app=express();
app.set('trust proxy',1);
const origins=(process.env.FRONTEND_URL||'').split(',').map(x=>x.trim()).filter(Boolean);
app.use(helmet());
app.use(cors({origin:origins.length?origins:true,credentials:false}));
app.use(express.json({limit:'50kb'}));
app.use(rateLimit({windowMs:60*1000,max:120,standardHeaders:true,legacyHeaders:false}));

const StatSchema=new mongoose.Schema({slug:{type:String,unique:true,index:true},views:{type:Number,default:0},entries:{type:Number,default:0},positiveRatings:{type:Number,default:0},ratingSum:{type:Number,default:0},ratingCount:{type:Number,default:0}},{timestamps:true});
const Stat=mongoose.model('CourseStat',StatSchema);
const FeedbackSchema=new mongoose.Schema({slug:{type:String,index:true},note:{type:String,required:true,maxlength:300,trim:true}},{timestamps:true});
const Feedback=mongoose.model('CourseFeedback',FeedbackSchema);
const allowed=new Set(['traffic-management-vehicle-control','crowd-management-event-security','fire-safety-emergency-response','vehicle-search-security-inspection','person-search-security-screening']);
function validSlug(req,res,next){if(!allowed.has(req.params.slug))return res.status(404).json({message:'Course not found'});next()}
function publicStats(s){return {slug:s.slug,views:s.views,entries:s.entries,positiveRatings:s.ratingCount?Math.round((s.positiveRatings/s.ratingCount)*100):0,ratingCount:s.ratingCount,averageRating:s.ratingCount?Math.round((s.ratingSum/s.ratingCount)*10)/10:0}}
app.get('/health',(req,res)=>res.json({ok:true}));
app.get('/api/course-stats/:slug',validSlug,async(req,res)=>{try{const s=await Stat.findOneAndUpdate({slug:req.params.slug},{$setOnInsert:{slug:req.params.slug}},{new:true,upsert:true});res.json(publicStats(s))}catch(e){res.status(500).json({message:'Unable to load statistics'})}});
app.post('/api/course-stats/:slug/entry',validSlug,async(req,res)=>{try{const s=await Stat.findOneAndUpdate({slug:req.params.slug},{$inc:{views:1,entries:1}},{new:true,upsert:true});res.json(publicStats(s))}catch(e){res.status(500).json({message:'Unable to record entry'})}});
app.post('/api/course-stats/:slug/rating',validSlug,async(req,res)=>{try{const rating=Number(req.body?.rating);if(!Number.isInteger(rating)||rating<1||rating>5)return res.status(400).json({message:'Rating must be 1-5'});const positive=rating>=4?1:0;const s=await Stat.findOneAndUpdate({slug:req.params.slug},{$inc:{ratingSum:rating,ratingCount:1,positiveRatings:positive}},{new:true,upsert:true});res.json(publicStats(s))}catch(e){res.status(500).json({message:'Unable to record rating'})}});
app.post('/api/course-feedback/:slug',validSlug,async(req,res)=>{try{const note=typeof req.body?.note==='string'?req.body.note.trim():'';if(!note)return res.status(400).json({message:'Note is required'});if(note.length>300)return res.status(400).json({message:'Note must be 300 characters or fewer'});await Feedback.create({slug:req.params.slug,note});res.json({ok:true,message:'Feedback received'});}catch(e){res.status(500).json({message:'Unable to save feedback'})}});
const port=process.env.PORT||5000;
async function start(){if(!process.env.MONGODB_URI)throw new Error('MONGODB_URI is required');await mongoose.connect(process.env.MONGODB_URI);app.listen(port,()=>console.log(`Stats API listening on ${port}`))}
start().catch(e=>{console.error(e);process.exit(1)});
