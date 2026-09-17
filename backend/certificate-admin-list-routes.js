const express=require('express');
const mongoose=require('mongoose');
const crypto=require('crypto');
require('dotenv').config();

const clean=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
const verifyAdmin=req=>{try{const h=String(req.headers.authorization||'');if(!h.startsWith('Bearer '))return false;const t=h.slice(7),p=t.split('.'),secret=process.env.ADMIN_SESSION_SECRET||'',email=(process.env.ADMIN_EMAIL||'Abdallah-Shalaby1@outlook.com').trim().toLowerCase();if(!secret||p.length!==2)return false;const sig=crypto.createHmac('sha256',secret).update(p[0]).digest('base64url'),a=Buffer.from(p[1]),b=Buffer.from(sig);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return false;const x=JSON.parse(Buffer.from(p[0],'base64url').toString('utf8'));return !!x.exp&&x.exp>Date.now()&&String(x.email||'').toLowerCase()===email}catch{return false}};

if(!express.application.__si_certificate_admin_list_route){
  express.application.__si_certificate_admin_list_route=true;
  const originalGet=express.application.get;
  express.application.get=function(route,...handlers){
    if(route==='/api/admin/training-certificates'){
      return originalGet.call(this,route,async(req,res)=>{
        if(!verifyAdmin(req))return res.status(401).json({message:'Admin authentication required'});
        try{
          const rows=await mongoose.connection.collection('trainingcertificates').find({}).sort({issuedAt:-1}).limit(20000).toArray();
          res.json({summary:{certificates:rows.length},certificates:rows});
        }catch(e){console.error('Certificate admin list error',e);res.status(500).json({message:'Unable to load training certificates: '+clean(e.message,240)})}
      });
    }
    return originalGet.call(this,route,...handlers);
  };
}
