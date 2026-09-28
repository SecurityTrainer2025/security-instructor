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
      const payload={visitorId:visitorId(),attemptId:id||'',courseSlug:course,recipientName:name,score:Number(arguments[3]||0)};
      let r=null,d={};
      for(let n=0;n<2;n++){
        try{
          r=await fetch(API+'/api/visitor/thank-you-letter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),cache:'no-store'});
          d={};try{d=await r.json()}catch{}
          if(r.ok)break;
        }catch(err){
          if(n===1)throw err;
          await new Promise(resolve=>setTimeout(resolve,1500));
        }
      }
      if(!r?.ok)throw new Error(d.message||'Unable to issue thank-you letter');
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
      issueLetter(attempt.attemptId,name,button,attempt.score);
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

  async function handleResult(score,savedAttempt){
    if(stopped)return;
    const server=await getAssessmentStatus();
    if(stopped)return;
    const eligibleAttempt=server?.eligibleAttempt || (savedAttempt&&savedAttempt.passed&&Number(savedAttempt.score)>=7 ? {attemptId:savedAttempt.attemptId,attemptNumber:savedAttempt.attemptNumber,score:savedAttempt.score}:null);

    if(score>=7){
      showNotice('siVisitorPassNotice','Congratulations on successfully completing the initial assessment. / تهانينا على اجتياز التقييم المبدئي بنجاح. Your result reflects a good level of initial knowledge. We invite you to register for this course to further develop your knowledge and practical skills. / تعكس نتيجتك مستوى جيدًا من المعرفة الأولية، وندعوك للتسجيل في هذه الدورة لتطوير معارفك ومهاراتك العملية.');
      const letterAttempt=eligibleAttempt||(
        savedAttempt&&savedAttempt.attemptId
          ? {attemptId:savedAttempt.attemptId,attemptNumber:savedAttempt.attemptNumber||attemptNumber||1,score:savedAttempt.score||score}
          : {attemptId:attemptId||'',attemptNumber:attemptNumber||1,score}
      );
      showLetterBox(letterAttempt);
      const retry=document.getElementById('retry');if(retry)retry.style.display='none';
    }else{
      const retry=document.getElementById('retry');
      const retryText=attemptNumber===1
        ?'Thank you for completing the initial assessment. Your result shows areas that can be developed, and you may use your second attempt or register for the course to strengthen your knowledge and skills. / شكرًا لك على إكمال التقييم المبدئي. توضح نتيجتك بعض الجوانب التي يمكن تطويرها، ويمكنك استخدام المحاولة الثانية أو التسجيل في الدورة لتعزيز معرفتك ومهاراتك.'
        :'Thank you for completing the initial assessment. We encourage you to register for the course to benefit from the training content and further develop your knowledge and practical skills. / شكرًا لك على إكمال التقييم المبدئي. نشجعك على التسجيل في الدورة للاستفادة من المحتوى التدريبي وتطوير معرفتك ومهاراتك العملية.';
      showNotice('siVisitorFailNotice',retryText);
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
    if(pollTimer){clearInterval(pollTimer);pollTimer=null}
    status.textContent=score>=7?'Passed 7/10+ / اجتياز':'Below 7/10 / أقل من 7 من 10';
    try{
      let savedAttempt=null;
      if(attemptId&&window.SIVisitorSecurity?.completeAttempt){
        try{savedAttempt=await window.SIVisitorSecurity.completeAttempt(attemptId,score);if(savedAttempt?.error)console.warn('Visitor attempt save failed:',savedAttempt.error)}catch(err){console.warn('Visitor attempt save failed:',err)}
      }
      await handleResult(score,savedAttempt);
    }finally{checking=false}
  }

  function startPolling(){
    stopPolling();
    stopped=false;
    pollTimer=setInterval(checkResult,500);
    checkResult();
  }

  async function start(){
    let gate=null;
    if(window.__siAssessmentAttemptPromise){
      gate=await window.__siAssessmentAttemptPromise;
    }else{
      const existingAttemptId=window.__siAssessmentAttemptId||'';
      const existingAttemptNumber=Number(window.__siAssessmentAttemptNumber)||null;
      gate=existingAttemptId
        ? {attemptId:existingAttemptId,attemptNumber:existingAttemptNumber}
        : await window.SIVisitorSecurity.startAttempt('assessment',course);
    }
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
  s.src='security-visitor.js?v=20260927-06';
  s.onload=waitSecurity;
  s.onerror=()=>{status.textContent='Security module unavailable / تعذر تحميل وحدة الحماية'};
  document.head.appendChild(s);
})();