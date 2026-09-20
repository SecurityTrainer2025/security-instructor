const express=require('express');
const mongoose=require('mongoose');
const crypto=require('crypto');
const {issueForEnrollment}=require('./training-certificate-routes.js');
require('dotenv').config();

const clean=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
const verifyAdmin=req=>{try{const h=String(req.headers.authorization||'');if(!h.startsWith('Bearer '))return false;const token=h.slice(7),parts=token.split('.'),secret=String(process.env.ADMIN_SESSION_SECRET||''),email=String(process.env.ADMIN_EMAIL||'Abdallah-Shalaby1@outlook.com').trim().toLowerCase();if(!secret||parts.length!==2)return false;const expected=crypto.createHmac('sha256',secret).update(parts[0]).digest('base64url');const a=Buffer.from(parts[1]),b=Buffer.from(expected);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return false;const payload=JSON.parse(Buffer.from(parts[0],'base64url').toString('utf8'));return !!payload.exp&&Number(payload.exp)>Date.now()&&String(payload.email||'').trim().toLowerCase()===email}catch{return false}};

if(!express.application.__si_certificate_admin_list_route){
  express.application.__si_certificate_admin_list_route=true;
  const originalGet=express.application.get;
  express.application.get=function(route,...handlers){
    if(route==='/api/admin/certificates'||route==='/api/admin/certificates/list'||route==='/api/admin/training-certificates'){
      return originalGet.call(this,route,async(req,res)=>{
        if(!verifyAdmin(req))return res.status(401).json({message:'Admin authentication required'});
        try{
          const db=mongoose.connection.db;
          if(!db)throw new Error('Database connection is not ready');
          const completed=await db.collection('enrollments').find({status:'completed'},{projection:{enrollmentId:1}}).limit(20000).toArray();for(const row of completed){try{await issueForEnrollment(row.enrollmentId)}catch(e){console.error('Certificate list repair failed for',row.enrollmentId,e)}}const rows=await db.collection('trainingcertificates').find({}).sort({issuedAt:-1}).limit(20000).toArray();
          res.status(200).json({summary:{certificates:rows.length},certificates:rows});
        }catch(e){console.error('Certificate admin list error',e);res.status(500).json({message:'Unable to load training certificates: '+clean(e.message,240)})}
      });
    }
    return originalGet.call(this,route,...handlers);
  };
}
