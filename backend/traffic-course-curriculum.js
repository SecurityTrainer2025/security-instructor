const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const legacy=require('./self-study-traffic-config');
const {applyReferenceReview}=require('./traffic-reference-review');

const CURRICULUM_VERSION=2;
const introduction={
  en:'This 24-hour bilingual course prepares traffic marshals and supervisors to plan and monitor safe workplace vehicle and pedestrian movement. Work through eight units and 40 lessons, from risk controls, gate operations and pedestrian protection to supervised signaling and venue scenarios. Use the illustrations to identify conflicts, pause the demonstration videos to explain decisions, and compare each proposed response with your own site plan. Pass the lesson checks at 80%, complete the satisfaction survey and pass the 30-question final at 70%. The online result assesses knowledge. Practical competence and authorization must be verified under local rules by a qualified supervisor.',
  ar:'تُعِدّ هذه الدورة الثنائية اللغة التي تستغرق 24 ساعة منظمي المرور والمشرفين لتخطيط ومراقبة الحركة الآمنة للمركبات والمشاة في مواقع العمل. أكمل ثماني وحدات وأربعين درسًا تبدأ بضوابط المخاطر وتشغيل البوابات وحماية المشاة، وتمتد إلى الإشارات تحت الإشراف وسيناريوهات المنشآت. استخدم الرسوم لتحديد نقاط التعارض، وأوقف الفيديوهات مؤقتًا لشرح القرارات، وقارن كل استجابة بخطة موقعك. اجتز اختبارات الدروس بدرجة 80٪، وأكمل استبيان الرضا، ثم اجتز الاختبار النهائي المكوّن من 30 سؤالًا بدرجة 70٪. تقيس النتيجة الإلكترونية المعرفة، ويتحقق مشرف مؤهل من الكفاءة العملية والتفويض وفق القواعد المحلية.'
};

const modules=[
  ...legacy.TRAFFIC_META.modules,
  {id:'tm6',en:'Airports and Stadiums',ar:'المطارات والاستادات'},
  {id:'tm7',en:'Major Events and Shopping Centres',ar:'الفعاليات الكبرى والمجمعات التجارية'},
  {id:'tm8',en:'Industrial Sites and Integrated Practice',ar:'المنشآت الصناعية والتطبيق المتكامل'}
];

const media=[
  '01_where_traffic_marshal_works','02_tmp_and_risk_assessment','03_access_control_points',
  '04_driver_induction','05_pedestrian_safety','06_parking_and_reversing','07_ppe_heat_weather',
  '08_incident_reporting','09_six_hand_signals','10_radios_and_shift_handover'
];

const diagrams=[
  ['Identify exposure','حدّد التعرض','Separate routes','افصل المسارات','Verify the control','تحقق من الضابط'],
  ['Check authorization','تحقق من التصريح','Use the holding area','استخدم منطقة الانتظار','Confirm the route','أكّد المسار'],
  ['Identify conflict points','حدّد نقاط التعارض','Protect the crossing','احمِ المعبر','Release only when clear','اسمح بالحركة عند خلو المسار'],
  ['Hold movement safely','أوقف الحركة بأمان','Notify control','أبلغ غرفة التحكم','Record and review','وثّق وراجع'],
  ['Agree the signal','اتفق على الإشارة','Confirm the read-back','تحقق من إعادة التأكيد','Stop if contact is lost','توقف إذا انقطع الاتصال'],
  ['Observe the surge','راقب الذروة','Protect pedestrian flow','احمِ تدفق المشاة','Coordinate reopening','نسّق إعادة الفتح'],
  ['Check capacity','تحقق من السعة','Activate protected overflow','فعّل منطقة الفائض المحمية','Check access again','تحقق من الوصول مجددًا'],
  ['Verify segregated routes','تحقق من فصل المسارات','Confirm a safe hold','أكّد الانتظار الآمن','Release on formal approval','اسمح بالحركة بعد الاعتماد الرسمي']
];

const extraLessons=readFileSync(join(__dirname,'traffic-course-lessons.txt'),'utf8').trim().split('\n').map(line=>{
  const fields=line.split('|');
  if(fields.length!==15||fields.some(field=>!field.trim()))throw new Error('Invalid Traffic lesson row');
  const [unit,titleEn,titleAr,explanationEn,explanationAr,caseEn,caseAr,...answers]=fields;
  const answerPairs=Array.from({length:4},(_,i)=>answers.slice(i*2,i*2+2).join(' / '));
  return {
    moduleId:'tm'+unit,titleEn,titleAr,
    bodyEn:'## Principles and application\n'+explanationEn+'\n## Scenario\n'+caseEn,
    bodyAr:'## المبادئ والتطبيق\n'+explanationAr+'\n## السيناريو\n'+caseAr,
    questions:[{q:caseEn+' / '+caseAr,a:answerPairs,correct:0}]
  };
});

const screens=modules.flatMap((module,unit)=>{
  const diagram=Array.from({length:3},(_,i)=>({en:diagrams[unit][i*2],ar:diagrams[unit][i*2+1]}));
  const original=legacy.TRAFFIC_SCREENS.filter(screen=>screen.id.startsWith(module.id+'s')).map(screen=>{
    const index=legacy.TRAFFIC_SCREENS.indexOf(screen);
    return {
      ...screen,moduleId:module.id,diagram,
      bodyEn:index===0?'## Course introduction\n'+introduction.en+'\n'+screen.bodyEn:screen.bodyEn,
      bodyAr:index===0?'## مقدمة الدورة\n'+introduction.ar+'\n'+screen.bodyAr:screen.bodyAr,
      videoUrl:'assets/traffic-videos/'+media[index]+'.mp4',approvedVideo:true,
      imageUrl:'assets/traffic-lesson-photos/'+screen.id+'.jpg'
    };
  });
  const extra=extraLessons.filter(screen=>screen.moduleId===module.id).map((screen,index)=>({
    ...screen,id:module.id+'s'+(original.length+index+1),diagram
  }));
  return [...original,...extra].map(applyReferenceReview);
});

const assessmentPools=modules.map(({id})=>screens.filter(lesson=>lesson.moduleId===id).flatMap(lesson=>lesson.questions));
if(screens.length!==40||new Set(screens.map(s=>s.id)).size!==40||
  modules.some(({id})=>screens.filter(s=>s.moduleId===id).length!==5)||
  assessmentPools.some(pool=>pool.length<4)||screens.filter(s=>s.approvedVideo).length!==10){
  throw new Error('Invalid 40-lesson Traffic curriculum');
}

module.exports={CURRICULUM_VERSION,meta:{...legacy.TRAFFIC_META,modules,introduction},screens,assessmentPools};
