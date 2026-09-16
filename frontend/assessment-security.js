(function(){
  const qs=new URLSearchParams(location.search);
  const course=qs.get('course')||'traffic-management-vehicle-control';
  const status=document.createElement('div');
  status.id='siAssessmentStatus';
  status.style.cssText='position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:2147482000;background:rgba(11,31,51,.96);border:1px solid #c8a96b;color:#fff;padding:7px 12px;font:700 11px Arial;border-radius:4px;pointer-events:none';
  status.textContent='SI • Protected Assessment / التقييم المحمي';
  document.body.appendChild(status);
  function waitSecurity(){
    if(!window.SIVisitorSecurity){setTimeout(waitSecurity,100);return;}
    window.SIVisitorSecurity.protect();
    start();
  }
  async function start(){
    const gate=await window.SIVisitorSecurity.startAttempt('assessment',course);
    if(gate.error){
      status.textContent=gate.error+' / تعذر بدء المحاولة';
      const quiz=document.getElementById('quiz'); if(quiz)quiz.style.display='none';
      const result=document.getElementById('result'); if(result){result.style.display='block';result.innerHTML='<div class="eyebrow">ASSESSMENT ACCESS</div><h2>لا يمكن بدء التقييم</h2><p>'+gate.error+'</p>'}
      return;
    }
    status.textContent='Attempt '+gate.attemptNumber+' of 2 / المحاولة '+gate.attemptNumber+' من 2';
    observeResult(gate.attemptId);
  }
  function observeResult(attemptId){
    let sent=false;
    const check=()=>{
      if(sent)return;
      const result=document.getElementById('result'),scoreEl=document.getElementById('score');
      if(!result||!scoreEl||getComputedStyle(result).display==='none')return;
      if(getComputedStyle(result).display==='none')return;
      const m=String(scoreEl.textContent||'').match(/(\d+)\s*\/\s*10/); if(!m)return;
      sent=true;
      const score=Number(m[1]),pass=score>=7;
      window.SIVisitorSecurity.completeAttempt(attemptId,score).then(()=>{
        status.textContent=pass?'Passed 7/10+ / اجتياز':'Below 7/10 / أقل من 7 من 10';
        const box=document.createElement('div');
        box.style.cssText='background:#0B1F33;color:#fff;border:1px solid #c8a96b;padding:18px;margin:20px;text-align:center;font-family:Arial';
        if(pass){
          box.innerHTML='<b style="color:#c8a96b;font-size:18px">Certificate eligible / مؤهل للشهادة</b><br><button id="siIssueAssessmentCert" style="margin-top:12px;padding:10px 14px;background:#c8a96b;color:#101820;border:1px solid #c8a96b;font-weight:800;cursor:pointer">Issue Certificate / إصدار الشهادة</button>';
          result.appendChild(box);
          document.getElementById('siIssueAssessmentCert').onclick=()=>window.SIVisitorSecurity.certPrompt({attemptId});
        }else{
          box.innerHTML='<span>First attempt did not reach 7/10. You may use one more attempt. / المحاولة الأولى لم تصل إلى 7 من 10، ويمكنك استخدام محاولة أخرى.</span>';
          result.appendChild(box);
        }
      });
    };
    const observer=new MutationObserver(check); observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
    setInterval(check,500);
  }
  const s=document.createElement('script');s.src='security-visitor.js?v=20260916';s.onload=waitSecurity;document.head.appendChild(s);
})();