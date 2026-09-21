const express=require('express');
const mongoose=require('mongoose');
const crypto=require('crypto');
require('dotenv').config();

const verifyAdmin=req=>{try{
 const h=String(req.headers.authorization||'');if(!h.startsWith('Bearer '))return false;
 const p=h.slice(7).split('.'),secret=String(process.env.ADMIN_SESSION_SECRET||''),email=String(process.env.ADMIN_EMAIL||'Abdallah-Shalaby1@outlook.com').trim().toLowerCase();
 if(!secret||p.length!==2)return false;
 const sig=crypto.createHmac('sha256',secret).update(p[0]).digest('base64url');
 const a=Buffer.from(p[1]),b=Buffer.from(sig);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return false;
 const x=JSON.parse(Buffer.from(p[0],'base64url').toString('utf8'));
 return !!x.exp&&Number(x.exp)>Date.now()&&String(x.email||'').toLowerCase()===email;
}catch{return false}};

if(!express.application.__si_certificate_admin_management){
 express.application.__si_certificate_admin_management=true;
 const originalPatch=express.application.patch;
 express.application.patch=function(route,...handlers){
  if(route==='/api/admin/training-certificates/:certificateId/revoke'){
   return originalPatch.call(this,route,async(req,res)=>{
    if(!verifyAdmin(req))return res.status(401).json({message:'Admin authentication required'});
    try{
     const id=String(req.params.certificateId||'').trim().slice(0,100);
     if(!id)return res.status(400).json({message:'Certificate ID is required'});
     const db=mongoose.connection.db;if(!db)return res.status(503).json({message:'Database connection is not ready'});
     const reason=typeof req.body?.reason==='string'?req.body.reason.trim().slice(0,500):'Revoked by administrator';
     const result=await db.collection('trainingcertificates').updateOne({certificateId:id},{$set:{verificationStatus:'revoked',revokedAt:new Date(),revocationReason:reason,updatedAt:new Date()}});
     if(!result.matchedCount)return res.status(404).json({message:'Certificate not found'});
     const certificate=await db.collection('trainingcertificates').findOne({certificateId:id});
     res.json({ok:true,certificateId:id,verificationStatus:certificate?.verificationStatus||'revoked',revokedAt:certificate?.revokedAt||null});
    }catch(e){console.error('Certificate revoke error',e);res.status(500).json({message:'Unable to revoke certificate'})}
   });
  }
  return originalPatch.call(this,route,...handlers);
 };
}