const express=require('express');
if(!express.application.__si_reports_bootstrap_listen){
  express.application.__si_reports_bootstrap_listen=true;
  const originalListen=express.application.listen;
  express.application.listen=function(...args){
    const app=this;
    const noop=(req,res)=>res.status(404).json({message:'Route not available'});
    try{
      app.get('/api/site-content',noop);
      app.get('/api/admin/site-content',noop);
      app.patch('/api/admin/site-content',noop);
      app.get('/api/admin/activity',noop);
      app.post('/api/admin/activity',noop);
      app.patch('/api/admin/articles/:id/archive',noop);
      app.get('/api/admin/reports',noop);
    }catch(e){console.error('Reports bootstrap route registration error',e)}
    return originalListen.apply(app,args);
  };
}
