const API=(window.APP_CONFIG&&window.APP_CONFIG.API_BASE)||'https://security-instructor.onrender.com';
const css=document.createElement('link');css.rel='stylesheet';css.href='bilingual-brand.css';document.head.appendChild(css);
const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
const EXCHANGE={slug:'lets-exchange-knowledge',categoryEn:'Professional Knowledge Exchange',categoryAr:'تبادل المعرفة المهنية',titleEn:"Let's Exchange Our Knowledge",titleAr:'هيا نتبادل معلوماتنا',summaryEn:'Security, safety and training professionals rarely see the same challenge from the same angle. This space is an invitation to exchange practical knowledge, field lessons and professional perspectives — respectfully, clearly and without sharing confidential information.',summaryAr:'نادراً ما يرى متخصصو الأمن والسلامة والتدريب التحدي نفسه من الزاوية ذاتها. هذه المساحة دعوة لتبادل المعرفة العملية والدروس الميدانية ووجهات النظر المهنية، باحترام ووضوح ودون مشاركة أي معلومات سرية.',authorEn:'SECURITY INSTRUCTOR Knowledge Community',authorAr:'مجتمع المعرفة في SECURITY INSTRUCTOR'};
const bi=(en,ar,cls='')=>`<div class="bi ${cls}"><span class="bi-en" dir="ltr">${esc(en)}</span><span class="bi-ar" dir="rtl">${esc(ar)}</span></div>`;
const featured=()=>`<div class="featured-card"><div class="article-meta">${bi(EXCHANGE.categoryEn,EXCHANGE.categoryAr)}</div><h3>${bi(EXCHANGE.titleEn,EXCHANGE.titleAr)}</h3><p>${bi(EXCHANGE.summaryEn,EXCHANGE.summaryAr)}</p><p class="featured-byline">${bi(EXCHANGE.authorEn,EXCHANGE.authorAr)}</p><div class="launch-cta"><a class="btn gold" href="article-view.html?slug=${EXCHANGE.slug}">${bi('Read Full Article','قراءة المقال كاملًا')}</a><a class="btn outline" href="experts.html">${bi('Contribute Your Knowledge','ساهم بخبرتك')}</a></div></div><div class="featured-side"><h3>${bi('The idea behind this article','فكرة هذا المقال')}</h3><ul><li>${bi('Learn from different professional perspectives.','التعلم من وجهات نظر مهنية مختلفة.')}</li><li>${bi('Share practical lessons from real work.','مشاركة الدروس العملية من واقع العمل.')}</li><li>${bi('Exchange knowledge without exposing confidential details.','تبادل المعرفة دون كشف التفاصيل السرية.')}</li><li>${bi('Build a stronger professional security community.','بناء مجتمع مهني أقوى في مجال الأمن.')}</li></ul></div>`;
function lockHomepageBilingual(){
  document.querySelectorAll('[data-en][data-ar]').forEach(el=>{
    if(el.dataset.biLocked==='1')return;
    el.innerHTML=`<span class="bi-en" dir="ltr">${esc(el.dataset.en||'')}</span><span class="bi-ar" dir="rtl">${esc(el.dataset.ar||'')}</span>`;
    el.dataset.biLocked='1';
  });
  const map={'Security Professionals':['Security Professionals','متخصصو الأمن'],'Safety & Emergency':['Occupational Health & Safety in the Workplace','الصحة والسلامة المهنية في أماكن العمل'],'Trainers & Learning Leaders':['Trainers & Learning Leaders','المدربون وقادة التعلم'],'Security Operations':['Security Operations','العمليات الأمنية'],'Training & Competency':['Training & Competency','التدريب والكفاءة'],'Digital Training Operations':['Digital Training Operations','عمليات التدريب الرقمي']};
  document.querySelectorAll('.expert-card h3,.case-card h3,.page-card h3').forEach(el=>{if(el.querySelector('.bi-en'))return;const pair=map[el.textContent.trim()];if(pair)el.innerHTML=bi(pair[0],pair[1]);});
  const cv=document.querySelector('a[href*="Abdallah_Shalaby_CV_English_V3.pdf"]');
  if(cv){cv.href='cv.html';cv.removeAttribute('target');cv.innerHTML=bi('View CV','عرض السيرة الذاتية');}
  const lang=document.getElementById('langBtn');
  if(lang){const replacement=lang.cloneNode(true);replacement.textContent='AR + EN | العربية + English';replacement.title='Bilingual interface / واجهة ثنائية اللغة';replacement.setAttribute('aria-label','Bilingual interface / واجهة ثنائية اللغة');lang.replaceWith(replacement);}
  document.documentElement.lang='en';document.documentElement.dir='ltr';
}
const paintIndexBilingual=()=>lockHomepageBilingual();
const render=()=>{const host=document.getElementById('featuredArticle');if(host)host.innerHTML=featured();lockHomepageBilingual();};
lockHomepageBilingual();
document.addEventListener('DOMContentLoaded',lockHomepageBilingual);
setTimeout(lockHomepageBilingual,0);
fetch(API+'/api/articles',{cache:'no-store'}).then(r=>r.ok?r.json():[]).then(()=>render()).catch(()=>render());
(function loadPublicCourses(){const s=document.createElement('script');s.src='courses-public-fallback.js?v=1';s.defer=true;document.head.appendChild(s);})();
