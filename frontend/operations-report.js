(function(){
  const API='https://security-instructor.onrender.com',K='securityInstructorAdminToken';
  const auth=()=>({Authorization:'Bearer '+(localStorage.getItem(K)||'')});
  const originalFetch=window.fetch.bind(window);
  window.fetch=async function(input,init){
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(url.startsWith(API+'/api/admin/reports?')){
      const u=new URL(url);if(u.searchParams.get('type')==='operations'){
        const qs=new URLSearchParams();['from','to','course','status'].forEach(k=>qs.set(k,u.searchParams.get(k)||''));
        return originalFetch(API+'/api/admin/operations/report?'+qs.toString(),{headers:{...auth(),...(init&&init.headers||{})}});
      }
    }
    return originalFetch(input,init);
  };
  function enhance(){
    const type=document.getElementById('reportType');if(!type)return false;
    if(!type.querySelector('option[value="operations"]'))type.insertAdjacentHTML('beforeend','<option value="operations">Training Operations Report</option>');
    const status=document.getElementById('reportStatus');
    if(status&&!status.querySelector('option[value="eligible"]'))status.insertAdjacentHTML('beforeend','<option value="eligible">Eligible for Certificate</option><option value="retake-required">Retake Required</option><option value="retake-scheduled">Retake Scheduled</option><option value="certified">Certified</option><option value="not-recorded">Attendance Not Recorded</option>');
    return true;
  }
  let tries=0;const timer=setInterval(()=>{if(enhance()||++tries>100)clearInterval(timer)},100);
})();
