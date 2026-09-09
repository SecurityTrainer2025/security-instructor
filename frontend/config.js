// Deployed statistics API
window.APP_CONFIG={API_BASE:'https://security-instructor.onrender.com'};

window.addEventListener('DOMContentLoaded',function(){
  var isHome=location.pathname.endsWith('/index.html') || location.pathname.endsWith('/');
  var challengeDone=localStorage.getItem('securityKnowledgeChallengeCompleted')==='true';
  if(isHome && !challengeDone){ location.replace('challenge.html'); return; }

  var nav=document.querySelector('.topbar nav');
  if(nav && !nav.querySelector('a[href="challenge.html"]')){
    var link=document.createElement('a'); link.href='challenge.html'; link.innerHTML='Challenge / التحدي'; link.setAttribute('aria-label','Security Knowledge Challenge / اختبر معلوماتك الأمنية');
    var courses=nav.querySelector('a[href="#courses"]'); if(courses && courses.nextSibling) nav.insertBefore(link,courses.nextSibling); else nav.appendChild(link);
  }

  document.addEventListener('click',function(e){
    var button=e.target.closest('[data-course]'); if(!button)return; var slug=button.getAttribute('data-course'); if(!slug)return;
    e.preventDefault(); e.stopImmediatePropagation();
    if(slug==='vehicle-search-security-inspection'||slug==='person-search-security-screening') location.href='course-ready.html?course='+encodeURIComponent(slug);
    else location.href='course-details.html?course='+encodeURIComponent(slug);
  },true);

  var slugs=['traffic-management-vehicle-control','crowd-management-event-security','fire-safety-emergency-response','vehicle-search-security-inspection','person-search-security-screening'];
  slugs.forEach(function(slug){
    var trigger=document.querySelector('[data-course="'+slug+'"]');
    if(!trigger || document.querySelector('[data-course-assessment="'+slug+'"]'))return;
    var a=document.createElement('a');
    a.setAttribute('data-course-assessment',slug);
    a.href='course-assessment-v2.html?course='+encodeURIComponent(slug);
    a.innerHTML='Initial Course Assessment / التقييم المبدئي للدورة';
    a.style.cssText='display:inline-block;margin:10px 8px 0 0;padding:11px 16px;border:1px solid #c8a96b;color:#c8a96b;background:transparent;text-decoration:none;font-weight:800;';
    trigger.insertAdjacentElement('afterend',a);
  });

  var hero=document.getElementById('home');
  if(hero && !document.getElementById('securityChallengePromo')){
    var section=document.createElement('section'); section.id='securityChallengePromo';
    section.style.cssText='margin:0 0 0;padding:34px 7%;background:linear-gradient(135deg,#102A43,#0B1F33);border-top:1px solid #294158;border-bottom:1px solid #294158;';
    section.innerHTML='<div style="max-width:1180px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:28px;flex-wrap:wrap"><div style="flex:1;min-width:280px"><div style="font-size:13px;letter-spacing:.12em;font-weight:700;color:#c8a96b;margin-bottom:8px">SECURITY AWARENESS • PRACTICAL SITUATIONS</div><h2 style="margin:0 0 8px;font-size:clamp(24px,3vw,38px);color:#fff">🛡️ SECURITY KNOWLEDGE CHALLENGE</h2><div style="font-size:22px;font-weight:700;color:#dbe2e8;margin-bottom:10px;direction:rtl;text-align:left">اختبر معلوماتك الأمنية</div><p style="margin:0;color:#cbd5df;line-height:1.7;max-width:760px">Test your general security awareness with 10 randomly selected questions.<br><span style="direction:rtl;display:inline-block">اختبر معلوماتك الأمنية العامة من خلال أسئلة عشوائية.</span></p></div><div style="flex:0 0 auto"><a href="challenge.html" style="display:inline-block;background:#c8a96b;color:#101820;text-decoration:none;font-weight:800;padding:15px 24px;border:1px solid #c8a96b">Start Challenge / ابدأ التحدي</a></div></div>';
    hero.insertAdjacentElement('afterend',section);
  }

  setTimeout(function(){
    var adminCourseBtn=document.getElementById('adminCourseBtn');
    if(adminCourseBtn){
      adminCourseBtn.dataset.en='Available Courses';
      adminCourseBtn.dataset.ar='الدورات المتاحة';
      adminCourseBtn.textContent='Available Courses';
    }
    ['vehicle-search-security-inspection','person-search-security-screening'].forEach(function(slug){
      var card=document.querySelector('[data-course="'+slug+'"]');
      if(!card)return;
      var article=card.closest('.course-card');
      if(article){
        var badge=article.querySelector('.course-card-media span');
        if(badge)badge.textContent='Available / متاحة';
        card.textContent='View Course / عرض الدورة';
      }
    });
  },0);
});
