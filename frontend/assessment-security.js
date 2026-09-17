(function(){
  const qs=new URLSearchParams(location.search);
  const course=qs.get('course')||'traffic-management-vehicle-control';
  const API=(window.APP_CONFIG&&window.APP_CONFIG.API_BASE)||'https://security-instructor.onrender.com';
  const status=document.createElement('div');
  status.id='siAssessmentStatus';
  status.style.cssText='position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:2147482000;background:rgba(11,31,51,.96);border:1px solid #c8a96b;color:#fff;padding:7px 12px;font:700 11px Arial;border-radius:4px;pointer-events:none';
  status.textContent='SI • Protected Assessment / التقييم المحمي';
  document.body.appendChild(status);

  let resultCheckTimer=null;
  let resultCheckRunning=false;
  let processedKey='';
  let lastObservedScore=null;

  function waitSecurity(){
    if(!window.SIVisitorSecurity){setTimeout(waitSecurity,100);return;}
    window.SIVisitorSecurity.protect({allowFrameFocus:true});
    start();
  }

  async function getAssessmentStatus(){
    try{
      const r=await fetch(API+'/api/visitor/assessment-status?visitorId='+encodeURIComponent(window.SIVisitorSecurity.visitorId())+'&courseSlug='+encodeURIComponent(course),{cache:'no-store'});
      if(!r.ok)return null;
      return await r.json();
    }catch{return null}
  }

  async function start(){
    const gate=await window.SIVisitorSecurity.startAttempt('assessment',course);
    if(gate.error){
      window.__siAssessmentAttemptId=null;
      window.__siAssessmentAttemptNumber=null;
      window.__siAssessmentOffline=true;
      window.__siAssessmentStatus=await getAssessmentStatus();
      status.textContent='Assessment result / نتيجة التقييم';
      observeResult(null);
      return;
    }
    window.__siAssessmentOffline=false;
    window.__siAssessmentAttemptId=gate.attemptId||null;
    window.__siAssessmentAttemptNumber=Number(gate.attemptNumber)||null;
    status.textContent='Attempt '+(gate.attemptNumber||'?')+' of 2 / المحاولة '+(gate.attemptNumber||'?')+' من 2';
    observeResult(gate.attemptId||null);
  }

  function visitorId(){return window.SIVisitorSecurity.visitorId()}
  function validThreePartName(name){return name.trim().split(/\s+/).filter(Boolean).length>=3}

  async function issueLetter(attemptId,name,button){
    try{
      button.disabled=true;
      button.textContent='Issuing… / جارٍ الإصدار';
      const r=await fetch(API+'/api/visitor/thank-you-letter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({visitorId:visitorId(),attemptId,recipientName:name})});
      let d={};try{d=await r.json()}catch{}
      if(!r.ok)throw new Error(d.message||'Unable to issue thank-you letter');
      location.href='visitor-letter.html?id='+encodeURIComponent(d.letterId);
    }catch(e){
      button.disabled=false;
      button.textContent='Issue Thank You Letter / إصدار خطاب الشكر والتقدير';
      const el=document.getElementById('siLetterError');
      if(el)el.textContent=e.message+' / تعذر إصدار خطاب الشكر';
    }
  }

  function showLetterBox(host,attemptId){
    if(document.getElementById('siVisitorLetterBox'))return;
    const box=document.createElement('div');
    box.id='siVisitorLetterBox';
    box.style.cssText='background:#102A43;color:#fff;border:1px solid #c8a96b;padding:22px;margin:24px auto;text-align:center;font-family:Arial,Tahoma,sans-serif;max-width:850px;box-shadow:0 8px 24px rgba(0,0,0,.18)';
    box.innerHTML='<div style="color:#c8a96b;font-size:20px;font-weight:900;letter-spacing:.02em">Thank You & Appreciation Letter / خطاب شكر وتقدير</div><div style="color:#fff;font-size:16px;font-weight:700;margin:10px 0">Congratulations! You passed the initial assessment. / تهانينا! لقد اجتزت التقييم المبدئي بنجاح.</div><p style="color:#cbd5df;line-height:1.8;margin:8px auto;max-width:700px">Enter your full three-part name to issue your professional thank-you letter. / أدخل اسمك الثلاثي لإصدار خطاب الشكر والتقدير المهني.</p><input id="siLetterName" maxlength="160" autocomplete="name" placeholder="Full Three-Part Name / الاسم الثلاثي" style="width:min(460px,90%);padding:12px;border:1px solid #c8a96b;background:#fff;color:#0B1F33;font-size:15px;border-radius:2px"><div style="color:#cbd5df;margin-top:8px;font-size:12px">Example: Ahmed Mohammed Ali / مثال: أحمد محمد علي</div><button id="siIssueLetter" style="margin-top:14px;padding:12px 20px;background:#c8a96b;color:#101820;border:1px solid #c8a96b;font-weight:900;cursor:pointer">Issue Thank You Letter / إصدار خطاب الشكر والتقدير</button><div id="siLetterError" style="color:#ffb4b4;margin-top:10px;font-size:13px"></div>';
    const wrap=document.querySelector('.wrap');
    (wrap||document.body).appendChild(box);
    const input=box.querySelector('#siLetterName'),button=box.querySelector('#siIssueLetter');
    button.onclick=()=>{
      const name=input.value.trim(),err=box.querySelector('#siLetterError');
      if(!validThreePartName(name)){err.textContent='Please enter your full three-part name / يرجى إدخال الاسم الثلاثي (ثلاثة أسماء على الأقل)';return}
      issueLetter(attemptId,name,button);
    };
  }

  function showSecondPassNotice(){
    if(document.getElementById('siVisitorSecondPass'))return;
    const host=document.querySelector('.wrap')||document.body;
    const box=document.createElement('div');box.id='siVisitorSecondPass';
    box.style.cssText='background:#102A43;color:#fff;border:1px solid #c8a96b;padding:18px;margin:24px auto;text-align:center;font-family:Arial,Tahoma,sans-serif;max-width:850px';
    box.innerHTML='<span>Congratulations on passing. The visitor thank-you letter is issued only for a passing first attempt. / تهانينا على الاجتياز. يُصدر خطاب شكر الزائر فقط عند اجتياز المحاولة الأولى.</span>';
    host.appendChild(box);
  }

  async function handleResult(score,attemptId){
    const currentAttempt=Number(window.__siAssessmentAttemptNumber)||null;
    const serverStatus=await getAssessmentStatus();
    window.__siAssessmentStatus=serverStatus;
    let eligibleAttemptId=null;
    let firstPassed=false;

    if(serverStatus?.letterEligible && serverStatus.firstAttempt?.attemptId){
      firstPassed=true;
      eligibleAttemptId=serverStatus.firstAttempt.attemptId;
    }else if(currentAttempt===1 && score>=7 && attemptId){
      firstPassed=true;
      eligibleAttemptId=attemptId;
    }

    if(score>=7){
      if(firstPassed&&eligibleAttemptId){
        const result=document.getElementById('result');
        showLetterBox(result||document.body,eligibleAttemptId);
        const retry=document.getElementById('retry');
        if(retry)retry.style.display='none';
      }else if(currentAttempt===2 || serverStatus?.secondAttempt?.passed){
        showSecondPassNotice();
      }
    }else{
      const host=document.querySelector('.wrap')||document.body;
      if(!document.getElementById('siVisitorFailNotice')){
        const box=document.createElement('div');box.id='siVisitorFailNotice';
        box.style.cssText='background:#102A43;color:#fff;border:1px solid #c8a96b;padding:18px;margin:24px auto;text-align:center;font-family:Arial,Tahoma,sans-serif;max-width:850px';
        box.innerHTML='<span>First attempt did not reach 7/10. You may use one more attempt. / المحاولة الأولى لم تصل إلى 7 من 10، ويمكنك استخدام محاولة أخرى.</span>';
        host.appendChild(box);
      }
    }
  }

  function scheduleResultCheck(attemptId){
    if(resultCheckTimer)return;
    resultCheckTimer=setTimeout(async()=>{
      resultCheckTimer=null;
      if(resultCheckRunning)return;
      resultCheckRunning=true;
      try{
        const result=document.getElementById('result'),scoreEl=document.getElementById('score');
        if(!result||!scoreEl||getComputedStyle(result).display==='none')return;
        const m=String(scoreEl.textContent||'').match(/(\d+)\s*\/\s*10/);
        if(!m)return;
        const score=Number(m[1]);
        const activeAttemptId=attemptId||window.__siAssessmentAttemptId||null;
        const key=String(activeAttemptId||'')+':'+score+':'+String(window.__siAssessmentAttemptNumber||'');
        if(key===processedKey)return;
        if(lastObservedScore===score && (document.getElementById('siVisitorLetterBox')||document.getElementById('siVisitorFailNotice')||document.getElementById('siVisitorSecondPass')))return;
        lastObservedScore=score;
        status.textContent=score>=7?'Passed 7/10+ / اجتياز':'Below 7/10 / أقل من 7 من 10';
        await handleResult(score,activeAttemptId);
        processedKey=key;
        if(activeAttemptId&&window.SIVisitorSecurity?.completeAttempt){
          Promise.resolve(window.SIVisitorSecurity.completeAttempt(activeAttemptId,score)).catch(err=>console.warn('Visitor attempt save failed:',err));
        }
      }finally{
        resultCheckRunning=false;
      }
    },150);
  }

  function observeResult(attemptId){
    const observer=new MutationObserver(()=>scheduleResultCheck(attemptId));
    observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
    scheduleResultCheck(attemptId);
  }

  const s=document.createElement('script');
  s.src='security-visitor.js?v=20260917-12';
  s.onload=waitSecurity;
  document.head.appendChild(s);
})();