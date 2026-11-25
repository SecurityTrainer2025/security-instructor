const express=require('express');
const mongoose=require('mongoose');
const crypto=require('crypto');
const { withAllocation, nextIdentifier, courseKeys: knownCourseKeys, coursePrefix, findSeat } = require('./training-allocation.js');
require('dotenv').config();
const clean=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
const TYPES={classroom:{en:'Classroom / حضوري',ar:'تدريب حضوري'},online:{en:'Online / أونلاين',ar:'تدريب أونلاين'},'self-study':{en:'Self-Study / تعلم ذاتي',ar:'تعلم ذاتي'}};
const allowedTypes=new Set(Object.keys(TYPES));
const verifyAdmin=req=>{try{const h=String(req.headers.authorization||'');if(!h.startsWith('Bearer '))return false;const t=h.slice(7),p=t.split('.'),secret=process.env.ADMIN_SESSION_SECRET||'',email=(process.env.ADMIN_EMAIL||'Abdallah-Shalaby1@outlook.com').trim().toLowerCase();if(!secret||p.length!==2)return false;const sig=crypto.createHmac('sha256',secret).update(p[0]).digest('base64url'),a=Buffer.from(p[1]),b=Buffer.from(sig);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return false;const x=JSON.parse(Buffer.from(p[0],'base64url').toString('utf8'));return !!x.exp&&x.exp>Date.now()&&String(x.email||'').toLowerCase()===email}catch{return false}};
const view=(b,count=0)=>({batchId:b.batchId,batchCode:b.batchCode||'',courseId:b.courseId,courseNameEn:b.courseNameEn||'',courseNameAr:b.courseNameAr||'',trainingType:b.trainingType||'classroom',trainingTypeLabel:TYPES[b.trainingType||'classroom']?.en||'Classroom / حضوري',capacity:Number(b.capacity||0),registrationOpensAt:b.registrationOpensAt||null,registrationClosesAt:b.registrationClosesAt||null,enrolled:count,remaining:Math.max(Number(b.capacity||0)-count,0),startDate:b.startDate||null,endDate:b.endDate||null,startTime:b.startTime||'',endTime:b.endTime||'',location:b.location||'',meetingLink:b.meetingLink||'',status:['closed','completed'].includes(b.status)?b.status:count>=b.capacity?'full':(b.registrationClosesAt&&new Date(b.registrationClosesAt)<=new Date())?'closed':(b.registrationOpensAt&&new Date(b.registrationOpensAt)>new Date())?'scheduled':'open',configuredStatus:b.status||'open',createdAt:b.createdAt||null,updatedAt:b.updatedAt||null});
async function courseKeys(courseId) {
  const keys=knownCourseKeys(courseId);
  const course=await mongoose.connection.collection('trainingcourses').findOne({
    $or:[{code:{$in:keys}},{slug:{$in:keys}}]
  });
  return course ? knownCourseKeys(course.code,course.slug) : keys;
}
const statuses=new Set(['open','full','closed','completed']);
function batchError(message,status=400) {
  return Object.assign(new Error(message),{status});
}
function batchChanges(body) {
  const result={};
  for(const key of ['courseId','courseNameEn','courseNameAr','trainingType','startTime','endTime','location','meetingLink','status']) {
    if(body[key]!==undefined)result[key]=clean(body[key],key==='meetingLink'?500:180);
  }
  if(result.trainingType!==undefined&&!allowedTypes.has(result.trainingType))throw batchError('Invalid training type');
  if(result.status!==undefined&&!statuses.has(result.status))throw batchError('Invalid batch status');
  if(body.capacity!==undefined){
    result.capacity=Number(body.capacity);
    if(!Number.isSafeInteger(result.capacity)||result.capacity<1)throw batchError('Capacity must be a positive whole number');
  }
  for(const key of ['startDate','endDate','registrationOpensAt','registrationClosesAt']){
    if(body[key]===undefined)continue;
    result[key]=body[key]?new Date(body[key]):null;
    if(result[key]&&!Number.isFinite(result[key].getTime()))throw batchError('Invalid batch date');
  }
  return result;
}
function checkDateRanges(batch) {
  if(batch.startDate&&batch.endDate&&new Date(batch.startDate)>new Date(batch.endDate))throw batchError('Training end must follow training start');
  if(batch.registrationOpensAt&&batch.registrationClosesAt&&new Date(batch.registrationOpensAt)>=new Date(batch.registrationClosesAt))throw batchError('Registration closing must follow opening');
}
async function insertBatch(db,session,fields) {
  const batches=db.collection('batches'), now=new Date();
  const year=(fields.startDate||now).getUTCFullYear();
  const batchId=await nextIdentifier(batches,'batchId',`${coursePrefix(fields.courseId)}-${year}-B`,3,session);
  const row={...fields,batchId,batchCode:batchId,createdAt:now,updatedAt:now};
  await batches.insertOne(row,{session});
  return row;
}
async function listBatches(req,res){if(!verifyAdmin(req))return res.status(401).json({message:'Admin authentication required'});try{const q=clean(req.query?.q,160).toLowerCase(),type=clean(req.query?.trainingType,30),courseId=clean(req.query?.courseId,100),c=mongoose.connection.collection('batches'),e=mongoose.connection.collection('enrollments');const filter={};if(type)filter.trainingType=type;if(courseId)filter.courseId={$in:await courseKeys(courseId)};let bs=await c.find(filter).sort({createdAt:-1}).limit(10000).toArray();const counts=await e.aggregate([{$match:{batchId:{$exists:true,$ne:''}}},{$group:{_id:'$batchId',count:{$sum:1}}}]).toArray();const map=Object.fromEntries(counts.map(x=>[x._id,x.count]));let rows=bs.map(b=>view(b,map[b.batchId]||0));if(q)rows=rows.filter(x=>[x.batchId,x.batchCode,x.courseId,x.courseNameEn,x.courseNameAr,x.trainingTypeLabel,x.location].some(v=>String(v||'').toLowerCase().includes(q)));res.json(rows)}catch(err){console.error('batch list error',err);res.status(500).json({message:'Unable to load batches'})}}
async function createBatch(req,res) {
  if(!verifyAdmin(req))return res.status(401).json({message:'Admin authentication required'});
  try{
    const fields=batchChanges(req.body||{});
    if(!fields.courseId||!fields.courseNameEn||!fields.courseNameAr||!fields.trainingType||!fields.capacity)
      throw batchError('Course, training type and valid capacity are required');
    const keys=await courseKeys(fields.courseId);
    fields.courseId=keys.find(key=>key.startsWith('CRS-'))||keys[0];
    checkDateRanges(fields);
    const row=await withAllocation((db,session)=>insertBatch(db,session,{status:'open',...fields}));
    res.status(201).json(view(row));
  }catch(error){res.status(error.status||500).json({message:error.status?error.message:'Unable to create batch'});}
}
async function updateBatch(req,res) {
  if(!verifyAdmin(req))return res.status(401).json({message:'Admin authentication required'});
  try{
    const batchId=clean(req.params.batchId,240),changes=batchChanges(req.body||{});
    const row=await withAllocation(async(db,session)=>{
      const batches=db.collection('batches');
      const batch=await batches.findOne({batchId},{session});
      if(!batch)throw batchError('Batch not found',404);
      for(const key of ['courseId','courseNameEn','courseNameAr','trainingType'])delete changes[key];
      const count=await db.collection('enrollments').countDocuments({batchId},{session});
      if(changes.capacity!==undefined&&changes.capacity<count)throw batchError('Capacity cannot be lower than the number of assigned trainees',409);
      const updated={...batch,...changes,updatedAt:new Date()};
      checkDateRanges(updated);
      await batches.updateOne({batchId},{$set:{...changes,updatedAt:updated.updatedAt}},{session});
      return view(updated,count);
    });
    res.json(row);
  }catch(error){res.status(error.status||500).json({message:error.status?error.message:'Unable to update batch'});}
}
async function plan(req,res){if(!verifyAdmin(req))return res.status(401).json({message:'Admin authentication required'});try{const courseId=clean(req.query?.courseId,100),trainingType=clean(req.query?.trainingType,30),capacity=Math.floor(Number(req.query?.capacity));if(!courseId||!allowedTypes.has(trainingType)||!Number.isFinite(capacity)||capacity<1)return res.status(400).json({message:'Course, training type and capacity are required'});const c=mongoose.connection.collection('enrollments'),keys=await courseKeys(courseId),filter={courseId:{$in:keys},status:{$ne:'cancelled'}};const total=await c.countDocuments(filter),unassigned=await c.countDocuments({...filter,$or:[{batchId:{$exists:false}},{batchId:''},{batchId:null}]});const batches=Math.max(1,Math.ceil(total/capacity));res.json({courseId,courseIds:keys,trainingType,trainingTypeLabel:TYPES[trainingType].en,capacity,totalTrainees:total,unassignedTrainees:unassigned,requiredBatches:batches,distribution:Array.from({length:batches},(_,i)=>Math.min(capacity,Math.max(0,total-i*capacity)))})}catch(err){console.error('batch plan error',err);res.status(500).json({message:'Unable to calculate batch plan'})}}
async function autoAssign(req,res) {
  if(!verifyAdmin(req))return res.status(401).json({message:'Admin authentication required'});
  try{
    const body=req.body||{},courseId=clean(body.courseId,100),trainingType=clean(body.trainingType,30),capacity=Number(body.capacity);
    if(!courseId||!allowedTypes.has(trainingType)||!Number.isSafeInteger(capacity)||capacity<1)
      throw batchError('Course, training type and capacity are required');
    const keys=await courseKeys(courseId);
    const batchFilter={courseId:{$in:keys},trainingType};
    const unassigned={courseId:{$in:keys},status:{$ne:'cancelled'},batchId:{$in:[null,'']},
      $or:[{trainingType},{trainingType:{$exists:false},selfStudy:{$ne:true}},
        ...(trainingType==='self-study'?[{trainingType:{$exists:false},selfStudy:true}]:[])]};
    const pending=await mongoose.connection.collection('enrollments').find(unassigned,{projection:{_id:1}}).sort({registeredAt:1,_id:1}).toArray();
    let assigned=0,createdBatches=0;
    for(const {_id} of pending){
      const result=await withAllocation(async(db,session)=>{
        const enrollments=db.collection('enrollments');
        const enrollment=await enrollments.findOne({...unassigned,_id},{session});
        if(!enrollment)return null;
        let batch=await findSeat(db,session,batchFilter);
        const created=!batch;
        if(created)batch=await insertBatch(db,session,{
          courseId:keys.find(key=>key.startsWith('CRS-'))||keys[0],courseNameEn:enrollment.courseNameEn,
          courseNameAr:enrollment.courseNameAr,trainingType,capacity,status:'open'
        });
        await enrollments.updateOne({_id},{$set:{
          batchId:batch.batchId,batchCode:batch.batchCode,trainingType,updatedAt:new Date()
        }},{session});
        return {created};
      });
      if(result){assigned++;if(result.created)createdBatches++;}
    }
    res.json({ok:true,assigned,createdBatches});
  }catch(error){res.status(error.status||500).json({message:error.status?error.message:'Unable to assign enrollments to batches'});}
}
function register(app){app.get('/api/admin/batches',listBatches);app.post('/api/admin/batches',createBatch);app.patch('/api/admin/batches/:batchId',updateBatch);app.get('/api/admin/batches/plan',plan);app.post('/api/admin/batches/auto-assign',autoAssign)}
if(!express.application.__si_batch_management){express.application.__si_batch_management=true;const original=express.application.listen;express.application.listen=function(...args){try{register(this)}catch(e){console.error('batch management route registration error',e)}return original.apply(this,args)}}
