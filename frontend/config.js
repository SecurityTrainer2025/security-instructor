// Set this to the deployed statistics API URL, e.g. https://your-api.example.com
window.APP_CONFIG={API_BASE:''};

// Security Knowledge Challenge — mandatory first visit before entering the website
window.addEventListener('DOMContentLoaded',function(){
  var isHome=location.pathname.endsWith('/index.html') || location.pathname.endsWith('/');
  var challengeDone=localStorage.getItem('securityKnowledgeChallengeCompleted')==='true';

  if(isHome && !challengeDone){
    location.replace('challenge.html');
    return;
  }

  // Challenge access point in the main navigation
  var nav=document.querySelector('.topbar nav');
  if(nav && !nav.querySelector('a[href="challenge.html"]')){
    var link=document.createElement('a');
    link.href='challenge.html';
    link.innerHTML='Challenge / التحدي';
    link.setAttribute('aria-label','Security Knowledge Challenge / قِس معلوماتك الأمنية');
    var courses=nav.querySelector('a[href="#courses"]');
    if(courses && courses.nextSibling) nav.insertBefore(link,courses.nextSibling); else nav.appendChild(link);
  }

  // Prominent challenge section after the hero
  var hero=document.getElementById('home');
  if(hero && !document.getElementById('securityChallengePromo')){
    var section=document.createElement('section');
    section.id='securityChallengePromo';
    section.style.cssText='margin:0 0 0;padding:34px 7%;background:linear-gradient(135deg,#102A43,#0B1F33);border-top:1px solid #294158;border-bottom:1px solid #294158;';
    section.innerHTML='<div style="max-width:1180px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:28px;flex-wrap:wrap">'+
      '<div style="flex:1;min-width:280px"><div style="font-size:13px;letter-spacing:.12em;font-weight:700;color:#c8a96b;margin-bottom:8px">SECURITY AWARENESS • PRACTICAL SITUATIONS</div><h2 style="margin:0 0 8px;font-size:clamp(24px,3vw,38px);color:#fff">🛡️ SECURITY KNOWLEDGE CHALLENGE</h2><div style="font-size:22px;font-weight:700;color:#dbe2e8;margin-bottom:10px;direction:rtl;text-align:left">قِس معلوماتك الأمنية</div><p style="margin:0;color:#cbd5df;line-height:1.7;max-width:760px">Test your general security awareness with 10 randomly selected questions from our 100-question bank.<br><span style="direction:rtl;display:inline-block">اختبر معلوماتك الأمنية العامة من خلال 10 أسئلة عشوائية يتم اختيارها من بنك يضم 100 سؤال.</span></p></div>'+
      '<div style="flex:0 0 auto"><a href="challenge.html" style="display:inline-block;background:#c8a96b;color:#101820;text-decoration:none;font-weight:800;padding:15px 24px;border:1px solid #c8a96b">Start Challenge / ابدأ التحدي</a></div>'+
      '</div>';
    hero.insertAdjacentElement('afterend',section);
  }
});
