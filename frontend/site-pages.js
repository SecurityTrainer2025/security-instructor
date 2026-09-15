(()=>{
  const bilingualize=()=>{
    document.querySelectorAll('[data-en][data-ar]').forEach(el=>{
      if(el.dataset.biDone==='1')return;
      const en=el.dataset.en||'';
      const ar=el.dataset.ar||'';
      el.innerHTML=`<span class="bi-en" dir="ltr">${en}</span><span class="bi-ar" dir="rtl">${ar}</span>`;
      el.dataset.biDone='1';
    });
    document.documentElement.lang='en';
    document.documentElement.dir='ltr';
  };
  bilingualize();
  const btn=document.getElementById('langBtn');
  if(btn){
    const replacement=btn.cloneNode(true);
    replacement.textContent='AR + EN | العربية + English';
    replacement.setAttribute('aria-label','Bilingual interface / واجهة ثنائية اللغة');
    replacement.title='Bilingual interface / واجهة ثنائية اللغة';
    btn.replaceWith(replacement);
  }
})();
