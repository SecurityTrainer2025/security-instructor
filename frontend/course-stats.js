(function(){
  var slug=new URLSearchParams(location.search).get('course');
  if(!slug)return;
  var API=(window.APP_CONFIG&&window.APP_CONFIG.API_BASE)||'https://security-instructor.onrender.com';
  API=API.replace(/\/$/,'');

  var css=document.createElement('style');
  css.textContent=''+
    '#courseStats{margin:42px 0 0;border:1px solid #294158;background:#102A43;padding:28px;color:#fff;box-sizing:border-box}'+
    '#courseStats *{box-sizing:border-box}'+
    '#courseStats .stats-title{margin:0 0 5px;color:#fff!important;font-size:28px;line-height:1.25}'+
    '#courseStats .stats-ar{display:block;margin-top:5px;color:#c8a96b!important;font:800 21px/1.5 Tahoma,Arial,sans-serif;direction:rtl;text-align:right}'+
    '#courseStats .stats-sub{margin:0 0 22px;color:#cbd5df!important;font-size:15px;line-height:1.7}'+
    '#courseStats .stats-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}'+
    '#courseStats .stat-card{background:#0d2439!important;border:1px solid #294158!important;padding:18px 12px;text-align:center;min-width:0}'+
    '#courseStats .stat-en{color:#c8a96b!important;font-size:12px;font-weight:800;letter-spacing:.02em}'+
    '#courseStats .stat-value{color:#fff!important;font-size:25px;font-weight:900;line-height:1.2;margin:7px 0}'+
    '#courseStats .stat-ar{color:#dbe2e8!important;font:700 13px/1.5 Tahoma,Arial,sans-serif;direction:rtl}'+
    '#courseStats .rating-box{margin-top:22px;border-top:1px solid #294158;padding-top:20px}'+
    '#courseStats .rating-title{color:#c8a96b!important;font-weight:800}'+
    '#courseStats .stars{margin-top:12px;display:flex;gap:8px;flex-wrap:wrap}'+
    '#courseStats .star-btn{border:1px solid #c8a96b!important;background:transparent!important;color:#c8a96b!important;padding:9px 14px;cursor:pointer;font-weight:800}'+
    '#courseStats .star-btn:hover{background:#c8a96b!important;color:#101820!important}'+
    '#courseStats .rating-msg{margin-top:10px;color:#cbd5df!important;font-size:14px}'+
    '.course-details-fix .section-title small{color:#c8a96b!important}'+
    '.course-details-fix .panel,.course-details-fix .module{color:#fff!important}'+
    '.course-details-fix .panel li,.course-details-fix .module span{color:#fff!important}'+
    '.course-details-fix .panel h3,.course-details-fix .module b{color:#c8a96b!important}'+
    '.course-details-fix .module .ar{color:#dbe2e8!important}'+
    '.course-details-fix .practical p{color:#dbe2e8!important}'+
    '@media(max-width:850px){#courseStats .stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}'+
    '@media(max-width:520px){#courseStats .stats-grid{grid-template-columns:1fr}.course-details-fix .course-hero{grid-template-columns:1fr!important}.course-details-fix .objectives-grid{grid-template-columns:1fr!important}.course-details-fix .modules{grid-template-columns:1fr!important}}';
  document.head.appendChild(css);

  var main=document.querySelector('#course');
  if(main)main.classList.add('course-details-fix');

  var wrap=document.createElement('section');
  wrap.id='courseStats';
  wrap.innerHTML='<h2 class="stats-title">Course Statistics<span class="stats-ar">إحصائيات الدورة</span></h2><p class="stats-sub">Live course activity and learner ratings / نشاط الدورة وتقييمات المتدربين</p><div class="stats-grid" id="statsGrid"></div><div class="rating-box"><div class="rating-title">Rate this course / قيّم هذه الدورة</div><div class="stars" id="stars"></div><div class="rating-msg" id="ratingMsg"></div></div>';

  var target=document.querySelector('.footer-actions');
  if(target)target.parentNode.insertBefore(wrap,target); else if(main)main.appendChild(wrap); else document.body.appendChild(wrap);

  var labels=[['Views','المشاهدات','views'],['Course Entries','مرات الدخول','entries'],['Positive Ratings','التقييمات الإيجابية','positiveRatings'],['Average Rating','متوسط التقييم','averageRating'],['Rating Count','عدد التقييمات','ratingCount']];
  var grid=wrap.querySelector('#statsGrid');
  labels.forEach(function(x){
    var d=document.createElement('div');d.className='stat-card';d.dataset.key=x[2];
    d.innerHTML='<div class="stat-en">'+x[0]+'</div><div class="stat-value">—</div><div class="stat-ar">'+x[1]+'</div>';
    grid.appendChild(d);
  });

  function setStats(s){if(!s)return;labels.forEach(function(x){var d=grid.querySelector('[data-key="'+x[2]+'"]');if(!d)return;var v=s[x[2]];if(x[2]==='averageRating'&&typeof v==='number')v=v.toFixed(1);d.querySelector('.stat-value').textContent=(v===undefined||v===null)?'—':v;});}
  function getStats(){return fetch(API+'/api/course-stats/'+encodeURIComponent(slug),{credentials:'omit'}).then(function(r){if(!r.ok)throw Error();return r.json()}).then(setStats)}
  function recordEntry(){return fetch(API+'/api/course-stats/'+encodeURIComponent(slug)+'/entry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'entry'})}).then(function(r){if(!r.ok)throw Error();return r.json()}).then(setStats)}

  var stars=wrap.querySelector('#stars');
  for(var i=1;i<=5;i++)(function(n){var b=document.createElement('button');b.type='button';b.className='star-btn';b.textContent='★ '+n;b.onclick=function(){b.disabled=true;fetch(API+'/api/course-stats/'+encodeURIComponent(slug)+'/rating',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({rating:n})}).then(function(r){if(!r.ok)throw Error();return r.json()}).then(function(s){setStats(s);wrap.querySelector('#ratingMsg').textContent='Thank you for your rating. / شكرًا لتقييمك.'}).catch(function(){wrap.querySelector('#ratingMsg').textContent='Unable to save the rating right now. / تعذر حفظ التقييم حاليًا.'}).finally(function(){b.disabled=false})};stars.appendChild(b)})(i);

  getStats().catch(function(){});
  recordEntry().catch(function(){});
})();
