const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const legacy=require('./self-study-traffic-config');
const {applyReferenceReview}=require('./traffic-reference-review');

const banks=require('./traffic-assessment-banks');
const CURRICULUM_VERSION=3;
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

const previousScreens=modules.flatMap((module,unit)=>{
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

const assessmentPools=modules.map(({id})=>previousScreens.filter(lesson=>lesson.moduleId===id).flatMap(lesson=>lesson.questions));
const siteMaps={
  tm3s3:'protected-crossing',tm6s1:'airport-dropoff',tm6s4:'stadium-arrivals',
  tm7s1:'festival-diversion',tm7s4:'retail-parking',tm8s1:'industrial-yard'
};
const fieldPractice={
  tm1s4:[
    'A driver reacts in two seconds at 10 m/s. The vehicle travels 20 m before braking begins. Add the braking distance for the actual load, slope and grip. This calculation is for training; the site sets and verifies operating limits.',
    'إذا استغرق رد فعل السائق ثانيتين عند سرعة 10 م/ث، تقطع المركبة 20 مترًا قبل الكبح. أضف مسافة الكبح حسب الحمولة والانحدار والتماسك الفعلي. هذا حساب تدريبي؛ يحدد الموقع حدود التشغيل ويتحقق منها.'
  ],
  tm2s3:[
    'If 18 vehicles arrive in an hour and the gate processes 12, the queue grows by six vehicles over that hour if the rates persist. Check usable holding capacity and activate the contingency before the queue reaches a crossing.',
    'إذا وصلت 18 مركبة في الساعة وعالجت البوابة 12، يزيد الطابور ست مركبات خلال الساعة إذا استمر المعدلان. تحقّق من سعة الانتظار الفعلية وفعّل البديل قبل بلوغ الطابور المعبر.'
  ],
  tm3s3:[
    'Trace a wheelchair user’s complete route on the diagram. Verify approaches on both sides, a stable surface, clear sightlines and a protected waiting position. Reject an adjustment that opens the vehicle lane while cutting off the pedestrian connection.',
    'تتبّع على المخطط مسار مستخدم الكرسي المتحرك كاملًا. تحقّق من المداخل على الجانبين والسطح المستقر ووضوح الرؤية وموضع انتظار محمي. ارفض تعديلًا يفتح حارة المركبات ويقطع اتصال مسار المشاة.'
  ],
  tm4s4:[
    'Before declaring a response route clear, confirm it along its full length with the responsible posts. Report the location of any obstruction and the alternative authorized by incident command. Keep conflicting traffic held until clearance is confirmed.',
    'قبل إعلان خلو مسار الاستجابة، أكّد حالته على امتداده مع النقاط المسؤولة. أبلغ بموقع أي عائق والبديل المعتمد من قيادة الحادث. أبقِ الحركة المتعارضة متوقفة حتى تأكيد الخلو.'
  ],
  tm5s1:[
    'In the supplemental drill, pause after the stop and start cues. Ask the driver to identify the visual instruction and the reason to stop if the guide is lost. Compare the two road-control cues with the six maneuver commands in the approved lesson and site chart.',
    'في المحاكاة المساندة، أوقف العرض بعد إشارتي التوقف والبدء. اطلب من السائق تحديد الإشارة البصرية وسبب التوقف عند فقدان الموجّه. قارن إشارتي تنظيم الطريق بإشارات المناورة الست في الدرس وجدول الموقع المعتمد.'
  ],
  tm5s4:[
    'Radio example: “Control, Post 2: crossing occupied. Keep Bay B closed.” The receiver repeats the bay and action. If they repeat Bay D, correct the location and obtain another read-back before any release.',
    'مثال لاسلكي: «التحكم، النقطة ٢: المعبر مشغول. أبقوا الباحة ب مغلقة». يعيد المتلقي الباحة والإجراء. إذا أعاد ذكر الباحة د، صحّح الموقع واطلب إعادة التأكيد قبل السماح بالحركة.'
  ],
  tm6s4:[
    'Mark the first decision point for incoming drivers and the protected route for spectators. Compare parking capacity with the capacity of the narrowest safe pedestrian section. Use the stricter limit when planning the next arrival phase.',
    'حدّد أول نقطة قرار للسائقين القادمين ومسار الجمهور المحمي. قارن سعة المواقف بسعة أضيق جزء آمن من مسار المشاة. استخدم الحد الأكثر تقييدًا عند تخطيط مرحلة الوصول التالية.'
  ],
  tm7s1:[
    'Walk the diversion from the perspective of a first-time driver before opening. Verify upstream signs, emergency access and the protected public route. Record who authorizes the next change if teardown and departure overlap.',
    'تفقّد التحويلة كما يراها سائق يزور الموقع لأول مرة قبل فتحها. تحقّق من اللوحات المبكرة ووصول الطوارئ ومسار الجمهور المحمي. وثّق صاحب صلاحية التغيير التالي إذا تداخل التفكيك مع الانصراف.'
  ],
  tm8s1:[
    'Observe the yard during an actual shift change. Compare the designated route with the line workers take, and check blind areas between pallets. If people repeatedly take a shortcut, redesign the protected connection and verify it before reopening.',
    'راقب الساحة خلال تبديل فعلي للمناوبة. قارن المسار المخصص بخط السير الذي يسلكه العاملون وافحص المواضع المحجوبة بين المنصات. إذا تكرر الاختصار، أعد تصميم الاتصال المحمي وتحقق منه قبل الفتح.'
  ],
};
const screens=previousScreens.map(lesson=>({
  ...lesson,assessmentRequired:true,questions:banks.lessons.get(lesson.id),
  ...(fieldPractice[lesson.id]?{
    bodyEn:lesson.bodyEn+'\n## Field practice\n'+fieldPractice[lesson.id][0],
    bodyAr:lesson.bodyAr+'\n## تطبيق ميداني\n'+fieldPractice[lesson.id][1]
  }:{}),
  ...(siteMaps[lesson.id]?{siteMap:'assets/traffic-practice/'+siteMaps[lesson.id]+'.png'}:{}),
  ...(lesson.id==='tm5s1'?{supplementalVideo:'assets/traffic-practice/signals-and-radio.mp4'}:{})
}));
const unitChecks=modules.map(module=>({
  id:module.id+'s-check',moduleId:module.id,kind:'unit-assessment',assessmentRequired:true,
  titleEn:'Unit assessment — '+module.en,titleAr:'تقييم الوحدة — '+module.ar,
  bodyEn:'Answer the ten questions. At least eight correct answers unlock the next step.',
  bodyAr:'أجب عن الأسئلة العشرة. تحتاج إلى ثماني إجابات صحيحة على الأقل للانتقال إلى الخطوة التالية.',
  questions:banks.units.get(module.id)
}));
const sequence=modules.flatMap(({id},index)=>[...screens.filter(lesson=>lesson.moduleId===id),unitChecks[index]]);
if(screens.length!==40||new Set(screens.map(s=>s.id)).size!==40||
  modules.some(({id})=>screens.filter(lesson=>lesson.moduleId===id).length!==5)||
  screens.some(lesson=>!lesson.questions)||unitChecks.some(check=>!check.questions)){
  throw new Error('Incomplete Traffic curriculum assessment mapping');
}
const previousMeta={...legacy.TRAFFIC_META,modules,introduction};
const meta={...previousMeta,assessmentCounts:{diagnostic:10,lessons:200,units:80,final:30,feedback:10},introduction:{
  en:introduction.en.replace('Pass the lesson checks at 80%,','Pass each five-question lesson check and each ten-question unit assessment at 80%,'),
  ar:introduction.ar.replace('اجتز اختبارات الدروس بدرجة 80٪،','اجتز تقييم كل درس من خمسة أسئلة وتقييم كل وحدة من عشرة أسئلة بدرجة 80٪،')
}};
screens[0].bodyEn=screens[0].bodyEn.replace(introduction.en,meta.introduction.en);
screens[0].bodyAr=screens[0].bodyAr.replace(introduction.ar,meta.introduction.ar);

module.exports={CURRICULUM_VERSION,meta,previousMeta,previousScreens,screens,sequence,assessmentPools,banks};
