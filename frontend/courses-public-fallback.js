(function(){
  const catalog=[
    {titleEn:'TRAFFIC MANAGEMENT & VEHICLE CONTROL',titleAr:'إدارة حركة المرور والتحكم في المركبات في الموقع',image:'assets/courses/04_Vehicle_Search_Security_Inspection.jpg',statusEn:'Available',statusAr:'متاحة'},
    {titleEn:'CROWD MANAGEMENT & EVENT SECURITY',titleAr:'إدارة الحشود وتأمين الفعاليات والمناسبات الكبرى',image:'assets/courses/02_Crowd_Management_Event_Security.jpg',statusEn:'Available',statusAr:'متاحة'},
    {titleEn:'FIRE SAFETY & EMERGENCY RESPONSE',titleAr:'السلامة من الحرائق وتدابير الاستجابة للطوارئ',image:'assets/courses/03_Fire_Safety_Emergency_Response.jpg',statusEn:'Available',statusAr:'متاحة'},
    {titleEn:'VEHICLE SEARCH & SECURITY INSPECTION',titleAr:'تفتيش المركبات والتفتيش الأمني',image:'assets/courses/01_Traffic_Management_Vehicle_Control.jpg',statusEn:'Coming Soon',statusAr:'قريباً'},
    {titleEn:'PERSON SEARCH & SECURITY SCREENING',titleAr:'تفتيش الأشخاص وإجراءات التفتيش الأمني',image:'assets/courses/05_Person_Search_Security_Screening.jpg',statusEn:'Coming Soon',statusAr:'قريباً'}
  ];
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  const bi=(en,ar,cls='')=>`<div class="bi ${cls}"><span class="bi-en" dir="ltr">${esc(en)}</span><span class="bi-ar" dir="rtl">${esc(ar)}</span></div>`;
  function render(){
    const grid=document.getElementById('courseGrid');
    if(!grid)return;
    if(!grid.querySelector('.course-card')){
      grid.innerHTML=catalog.map((c,i)=>`<article class="course-card"><div class="course-card-media"><img src="${c.image}" onerror="this.src='assets/course-previews/course-placeholder.svg'" alt="${esc(c.titleEn)}"><span>${bi(c.statusEn,c.statusAr)}</span></div><div class="course-card-body">${bi(c.titleEn,c.titleAr,'course-title-bi')}${bi('Course objectives and selected highlights.','أهداف الدورة وأبرز المحاور المختارة.','course-summary')}<button class="btn gold" type="button" data-fallback-course="${i}">${bi(c.statusEn==='Coming Soon'?'Preview Course':'View Course',c.statusEn==='Coming Soon'?'معاينة الدورة':'عرض الدورة')}</button></div></article>`).join('');
    }
    grid.querySelectorAll('[data-fallback-course]').forEach(btn=>btn.addEventListener('click',function(){
      const c=catalog[Number(this.dataset.fallbackCourse)];
      if(typeof window.openCourse==='function') window.openCourse(c);
    }));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
  setTimeout(render,700);
})();
