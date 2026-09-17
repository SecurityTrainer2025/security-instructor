(function(){
  const qs=new URLSearchParams(location.search);
  const course=qs.get('course')||'traffic-management-vehicle-control';
  const API=(window.APP_CONFIG&&window.APP_CONFIG.API_BASE)||'https://security-instructor.onrender.com';
  const status=document.createElement('div');
  status.id='siAssessmentStatus';
  status.style.cssText='position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:2147482000;background:rgba(11,31,51,.96);border:1px solid #c8a96b;color:#fff;padding:7px 12px;font:700 11px Arial;border-radius:4px;pointer-events:none';
  status.textContent='SI • Protected Assessment / التقييم المحمي';
  document.body.appendChild(status);

  let pollTimer=null;
  let checking=false;
  let processedKey='';
  let attemptId=null;
  let attemptNumber=null;
  let stopped=false;

  function visitorId(){return window.SIVisitorSecurity.visitorId()}
  function validThreePartName(name){return name.trim().split(/\s+/).filter(Boolean).length>=3}

  async function getAssessmentStatus(){
    try{
      const r=await fetch(API+'/api/visitor/assessment-status?visitorId='+encodeURIComponent(visitorId())+'&courseSlug='+encodeURIComponent(course),{cache:'no-store'});
      if(!r.ok)return null;
      return await r.json();
    }catch{return null}
  }

  async function issueLetter(id,name,button){
    try{
      button.disabled=true;
      button.textContent='Issuing… / جارٍ الإصدار';
      const r=await fetch(API+'/api/visitor/thank-you-letter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({visitorId:visitorId(),attemptId:id,recipientName:name})});
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

  function showLetterBox(attempt){
    if(document.getElementById('siVisitorLetterBox')||!attempt)return;
    const box=document.createElement('div');
    box.id='siVisitorLetterBox';
    box.style.cssText='background:#102A43;color:#fff;border:1px solid #c8a96b;padding:22px;margin:24px auto;text-align:center;font-family:Arial,Tahoma,sans-serif;max-width:850px;box-shadow:0 8px 24px rgba(0,0,0,.18)';
    box.innerHTML='<div style="color:#c8a96b;font-size:20px;font-weight:900">Thank You & Appreciation Letter / خطاب شكر وتقدير</div><div style="color:#fff;font-size:16px;font-weight:700;margin:10px 0">Congratulations! You passed the initial assessment. / تهانينا! لقد اجتزت التقييم المبدئي بنجاح.</div><p style="color:#cbd5df;line-height:1.8;margin:8px auto;max-width:700px">Enter your full three-part name to issue your professional thank-you letter. / أدخل اسمك الثلاثي لإصدار خطاب الشكر والتقدير المهني.</p><input id="siLetterName" maxlength="160" autocomplete="name" placeholder="Full Three-Part Name / الاسم الثلاثي" style="width:min(460px,90%);padding:12px;border:1px solid #c8a96b;background:#fff;color:#0B1F33;font-size:15px;border-radius:2px"><div style="color:#cbd5df;margin-top:8px;font-size:12px">Example: Ahmed Mohammed Ali / مثال: أحمد محمد علي</div><button id="siIssueLetter" style="margin-top:14px;padding:12px 20px;background:#c8a96b;color:#101820;border:1px solid #c8a96b;font-weight:900;cursor:pointer">Issue Thank You Letter / إصدار خطاب الشكر والتقدير</button><div id="siLetterError" style="color:#ffb4b4;margin-top:10px;font-size:13px"></div>';
    (document.querySelector('.wrap')||document.body).appendChild(box);
    const input=box.querySelector('#siLetterName'),button=box.querySelector('#siIssueLetter');
    button.onclick=()=>{
      const name=input.value.trim(),err=box.querySelector('#siLetterError');
      if(!validThreePartName(name)){err.textContent='Please enter your full three-part name / يرجى إدخال الاسم الثلاثي (ثلاثة أسماء على الأقل)';return}
      issueLetter(attempt.attemptId,name,button);
    };
  }

  function showNotice(id,text){
    if(document.getElementById(id))return;
    const box=document.createElement('div');box.id=id;
    box.style.cssText='background:#102A43;color:#fff;border:1px solid #c8a96b;padding:18px;margin:24px auto;text-align:center;font-family:Arial,Tahoma,sans-serif;max-width:850px';
    box.innerHTML='<span>'+text+'</span>';
    (document.querySelector('.wrap')||document.body).appendChild(box);
  }

  function stopPolling(){
    stopped=true;
    if(pollTimer){clearInterval(pollTimer);pollTimer=null}
  }

  async function handleResult(score){
    if(stopped)return;
    const server=await getAssessmentStatus();
    if(stopped)return;
    const first=server?.firstAttempt||null;
    const second=server?.secondAttempt||null;
    const firstPassed=!!(server?.letterEligible&&first?.attemptId);
    const eligibleAttempt=firstPassed?first:null;

    if(score>=7){
      if(firstPassed){
        showLetterBox(eligibleAttempt);
        const retry=document.getElementById('retry');if(retry)retry.style.display='none';
      }else if(attemptNumber===2||second?.passed){
        showNotice('siVisitorSecondPass','Congratulations on passing. The visitor thank-you letter is issued only for a passing first attempt. / تهانينا على الاجتياز. يُصدر خطاب شكر الزائر فقط عند اجتياز المحاولة الأولى.');
      }
    }else if(attemptNumber===1){
      showNotice('siVisitorFailNotice','First attempt did not reach 7/10. You may use one more attempt. / المحاولة الأولى لم تصل إلى 7 من 10، ويمكنك استخدام محاولة أخرى.');
    }
  }

  async function checkResult(){
    if(stopped||checking)return;
    const result=document.getElementById('result');
    const scoreEl=document.getElementById('score');
    if(!result||!scoreEl||getComputedStyle(result).display==='none')return;
    const m=String(scoreEl.textContent||'').match(/(\d+)\s*\/\s*10/);
    if(!m)return;
    const score=Number(m[1]);
    const key=String(attemptId||'')+':'+score+':'+String(attemptNumber||'');
    if(key===processedKey)return;
    processedKey=key;
    checking=true;
    stopPolling();
    status.textContent=score>=7?'Passed 7/10+ / اجتياز':'Below 7/10 / أقل من 7 من 10';
    try{
      await handleResult(score);
      if(attemptId&&window.SIVisitorSecurity?.completeAttempt){
        Promise.resolve(window.SIVisitorSecurity.completeAttempt(attemptId,score)).catch(err=>console.warn('Visitor attempt save failed:',err));
      }
    }finally{checking=false}
  }

  function startPolling(){
    stopPolling();
    stopped=false;
    pollTimer=setInterval(checkResult,500);
    checkResult();
  }

  async function start(){
    const gate=await window.SIVisitorSecurity.startAttempt('assessment',course);
    if(gate.error){
      attemptId=null;attemptNumber=null;
      status.textContent='Assessment result / نتيجة التقييم';
      startPolling();
      return;
    }
    attemptId=gate.attemptId||null;
    attemptNumber=Number(gate.attemptNumber)||null;
    window.__siAssessmentAttemptId=attemptId;
    window.__siAssessmentAttemptNumber=attemptNumber;
    status.textContent='Attempt '+(attemptNumber||'?')+' of 2 / المحاولة '+(attemptNumber||'?')+' من 2';
    startPolling();
  }

  function waitSecurity(){
    if(!window.SIVisitorSecurity){setTimeout(waitSecurity,100);return}
    window.SIVisitorSecurity.protect({allowFrameFocus:true});
    start();
  }

  const s=document.createElement('script');
  s.src='security-visitor.js?v=20260917-13';
  s.onload=waitSecurity;
  s.onerror=()=>{status.textContent='Security module unavailable / تعذر تحميل وحدة الحماية'};
  document.head.appendChild(s);
})();