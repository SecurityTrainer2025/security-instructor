(function(){
  const isStaging = new URLSearchParams(window.location.search).get('api') === 'staging'
    || window.location.hostname === 'si-avs-staging-test.onrender.com';
  const PRODUCTION_API = 'https://security-instructor.onrender.com';
  const API = isStaging ? window.location.origin : PRODUCTION_API;
  const K = isStaging ? 'securityInstructorAdminToken:staging' : 'securityInstructorAdminToken';
  const auth=()=>({Authorization:'Bearer '+(localStorage.getItem(K)||'')});
  const originalFetch=window.fetch.bind(window);
  window.fetch=async function(input,init){
    const originalUrl=typeof input==='string'?input:(input&&input.url)||'';
    const url=isStaging && originalUrl.startsWith(PRODUCTION_API)
      ? API + originalUrl.slice(PRODUCTION_API.length)
      : originalUrl;
    if(url.startsWith(API+'/api/admin/reports?')){
      const u=new URL(url);if(u.searchParams.get('type')==='operations'){
        const qs=new URLSearchParams();['from','to','course','status'].forEach(k=>qs.set(k,u.searchParams.get(k)||''));
        const headers={...auth(),...(init&&init.headers||{})};
        return originalFetch(API+'/api/admin/operations/report?'+qs.toString(),{headers});
      }
    }
    if(isStaging && url !== originalUrl){
      if(typeof input === 'string') return originalFetch(url,init);
      if(input instanceof Request) return originalFetch(new Request(url,input),init);
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
