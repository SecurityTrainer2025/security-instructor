(()=>{
 const btn=document.getElementById('langBtn');
 const apply=dir=>{document.documentElement.dir=dir;document.documentElement.lang=dir==='rtl'?'ar':'en';document.querySelectorAll('[data-en][data-ar]').forEach(el=>{el.textContent=dir==='rtl'?el.dataset.ar:el.dataset.en});if(btn)btn.textContent=dir==='rtl'?'EN + AR':'AR + EN'};
 const saved=localStorage.getItem('siLang')||'en';apply(saved==='ar'?'rtl':'ltr');
 btn?.addEventListener('click',()=>{const next=document.documentElement.dir==='rtl'?'ltr':'rtl';localStorage.setItem('siLang',next==='rtl'?'ar':'en');apply(next)});
})();
