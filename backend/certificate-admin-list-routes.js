const express=require('express');
const mongoose=require('mongoose');
require('dotenv').config();

const clean=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
const adminAuth=async req=>{try{const h=String(req.headers.authorization||'');if(!h.startsWith('Bearer '))return false;const r=await fetch('http://127.0.0.1:'+(process.env.PORT||10000)+'/api/admin/me',{headers:{Authorization:h}});return r.ok}catch{return false}};

if(!express.application.__si_certificate_admin_list_route){
  express.application.__si_certificate_admin_list_route=true;
  const originalGet=express.application.get;
  express.application.get=function(route,...handlers){
    if(route==='/api/admin/certificates'||route==='/api/admin/training-certificates'){
      return originalGet.call(this,route,async(req,res)=>{
        if(!(await adminAuth(req)))return res.status(401).json({message:'Admin authentication required'});
        try{
          const db=mongoose.connection.db;
          if(!db)throw new Error('Database connection is not ready');
          const rows=await db.collection('trainingcertificates').find({}).sort({issuedAt:-1}).limit(20000).toArray();
          res.status(200).json({summary:{certificates:rows.length},certificates:rows});
        }catch(e){console.error('Certificate admin list error',e);res.status(500).json({message:'Unable to load training certificates: '+clean(e.message,240)})}
      });
    }
    return originalGet.call(this,route,...handlers);
  };
}
