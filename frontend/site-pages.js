(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='bilingual-brand.css';document.head.appendChild(css);
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  const bilingualize=()=>{
    document.querySelectorAll('[data-en][data-ar]').forEach(el=>{
      if(el.dataset.biDone==='1')return;
      el.innerHTML=`<span class="bi-en" dir="ltr">${el.dataset.en||''}</span><span class="bi-ar" dir="rtl">${el.dataset.ar||''}</span>`;
      el.dataset.biDone='1';
    });
    const plain={'Security Professionals':'متخصصو الأمن','Safety & Emergency Specialists':'متخصصو السلامة والطوارئ','Trainers & Learning Leaders':'المدربون وقادة التعلم','Security Operations':'العمليات الأمنية','Training & Competency':'التدريب والكفاءة','Digital Training Operations':'عمليات التدريب الرقمي','What happened?':'ماذا حدث؟','What was at stake?':'ما المخاطر القائمة؟','What was done?':'ماذا تم اتخاذه؟','What changed?':'ما الذي تغيّر؟','What can we learn?':'ماذا نتعلم؟','Security':'الأمن','Safety & Emergency':'السلامة والطوارئ','Training & Leadership':'التدريب والقيادة'};
    document.querySelectorAll('.expert-card h3,.case-card h3,.case-step h3,.page-card h3').forEach(el=>{if(el.querySelector('.bi-en'))return;const en=el.textContent.trim(),ar=plain[en];if(ar)el.innerHTML=`<span class="bi"><span class="bi-en" dir="ltr">${esc(en)}</span><span class="bi-ar" dir="rtl">${esc(ar)}</span></span>`});
    document.documentElement.lang='en';document.documentElement.dir='ltr';
  };
  bilingualize();
  const btn=document.getElementById('langBtn');
  if(btn){const replacement=btn.cloneNode(true);replacement.textContent='AR + EN | العربية + English';replacement.setAttribute('aria-label','Bilingual interface / واجهة ثنائية اللغة');replacement.title='Bilingual interface / واجهة ثنائية اللغة';btn.replaceWith(replacement)}
})();
