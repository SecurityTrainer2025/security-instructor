// Course-specific Self-Study content. Fire Safety remains in its existing module.
// Traffic content is a separate pilot and does not modify legacy course records.
const TRAFFIC_SLUG='traffic-management-vehicle-control';
const TRAFFIC_META={
  code:'CRS-TRAFFIC-001',
  en:'TRAFFIC CONTROL | TRAFFIC MARSHAL',
  ar:'التحكم بحركة المرور',
  mode:'self-study',freeOpening:true,accessHours:120,durationHours:24,
  activeStudyHours:24,pilotProject:true,masteryScore:80,finalQuestions:30,
  finalPassScore:70,finalRetakes:2,
  modules:[
    {id:'tm1',en:"Traffic Control Fundamentals and TMP",ar:"أسس التحكم بحركة المرور وخطة TMP"},
    {id:'tm2',en:"Access Points and Driver Guidance",ar:"البوابات وتوجيه السائقين"},
    {id:'tm3',en:"Pedestrians, Parking and Traffic Calming",ar:"المشاة والمواقف وتهدئة الحركة"},
    {id:'tm4',en:"Safety, Weather and Incident Reporting",ar:"السلامة والطقس وتقارير الحوادث"},
    {id:'tm5',en:"Traffic Marshal Signals and Practice",ar:"إشارات منظم الحركة والتطبيق"}
  ]
};
const q=(question,answers,correct=0)=>({q:question,a:answers,correct});
const TRAFFIC_SCREENS=[
{id:'tm1s1',videoUrl:'assets/traffic-videos/00_course_introduction.mp4',slide:1,titleEn:'Traffic Control and the Traffic Marshal Role',titleAr:'التحكم بحركة المرور ودور منظم حركة المرور',bodyEn:'## Learning objectives\n• Define the Traffic Marshal role, limits and duty areas.\n• Prioritise pedestrians and safe vehicle movement.\n## Traffic Marshal duties\nA Traffic Marshal, also called Traffic Controller in some sites, guides authorised vehicle movements and pedestrians within an approved site plan. The role does not confer the powers of the traffic police.\n## Typical duties\n• Keep gate queues and emergency routes clear.\n• Separate pedestrians, including older people and people with disabilities, from moving vehicles.\n• Use high-visibility clothing, a safe position, clear instructions and an escape route.\n## Scenario\nVehicles queue at a pedestrian crossing near the gate. Stop movement safely, protect pedestrians and coordinate with the gate team.\n## Key takeaway\nPeople before speed; site plans before improvisation.',bodyAr:'## أهداف التعلم\n• تحديد مهام منظم حركة المرور Traffic Marshal وصلاحياته.\n• إعطاء الأولوية لسلامة المشاة والمركبات.\n## دور منظم حركة المرور\nيتولى منظم حركة المرور، ويسمى Traffic Controller ببعض المواقع، توجيه حركة المركبات والمشاة داخل الموقع وفق الخطة والتفويض المعتمدين، ولا يحل محل سلطات المرور.\n## مهام رئيسية\n• تنظيم طوابير البوابات وإبقاء مسارات الطوارئ مفتوحة.\n• فصل المشاة، وخاصة كبار السن وأصحاب الهمم، عن حركة المركبات.\n• ارتداء ملابس عالية الوضوح، واختيار موقع آمن، وتوفير مسار للهروب.\n## موقف تطبيقي\nتكدست المركبات عند معبر مشاة قريب من البوابة. أوقف الحركة بأمان واحمِ المشاة ونسق مع فريق البوابة.\n## خلاصة\nسلامة الأشخاص قبل سرعة الحركة؛ وخطة الموقع قبل الاجتهاد.',questions:[
q('What is the first priority in traffic control? / ما الأولوية الأولى في التحكم المروري؟',['Life safety / سلامة الأرواح','Fast vehicle flow / سرعة حركة المركبات','Parking convenience / سهولة الوقوف','Keeping schedules only / الالتزام بالجدول فقط']),
q('What is the purpose of a site traffic plan? / ما هدف خطة المرور بالموقع؟',['Organize safe movement / تنظيم الحركة الآمنة','Replace all signs / استبدال جميع اللافتات','Increase vehicle speed / زيادة سرعة المركبات','Remove pedestrian routes / إلغاء مسارات المشاة']),
q('Which source should guide traffic control? / ما المصدر الذي يوجه التحكم المروري؟',['Approved site procedures / إجراءات الموقع المعتمدة','Personal preference / التفضيل الشخصي','Unverified messages / رسائل غير مؤكدة','Driver pressure / ضغط السائق']),
q('Why should vehicle movement be predictable? / لماذا ينبغي أن تكون حركة المركبات متوقعة؟',['To reduce conflict and collisions / لتقليل التعارض والتصادم','To allow sudden turns / للسماح بالانعطافات المفاجئة','To avoid communication / لتجنب التواصل','To ignore signs / لتجاهل اللافتات']),
q('What should staff do when a control is unclear? / ماذا يفعل الموظف إذا كان الإجراء غير واضح؟',['Pause safely and seek clarification / التوقف بأمان وطلب التوضيح','Guess and continue / التخمين والاستمرار','Wave every vehicle through / السماح للجميع بالمرور','Ignore the risk / تجاهل الخطر'])
]},
{id:'tm1s2',videoUrl:'assets/traffic-videos/06_risk_position.mp4',slide:2,titleEn:'Traffic Management Plan, Routes and Risk Assessment',titleAr:'خطة إدارة المرور والمسارات وتقييم المخاطر',bodyEn:'## Learning objectives\n• Read the Traffic Management Plan (TMP).\n• Identify approved routes, speed restrictions and hazards.\n## Site traffic plan\nLocate entry and exit points, one-way lanes, pedestrian paths, loading bays, heavy-vehicle zones, restricted areas and emergency access. Follow site-specific rules; do not change a route without authorisation.\n## Risk assessment\nCheck sightlines, vehicle turning paths, blind spots, stopping distances and safe escape routes. A central position in an intersection is not automatically safe.\n## Weather scenario\nFog or a sandstorm reduces visibility. Inform control, slow or suspend vehicle movements as required by the approved plan and request additional precautions.\n## Key takeaway\nRead the plan and assess risk before directing movement.',bodyAr:'## أهداف التعلم\n• قراءة خطة إدارة المرور TMP.\n• تحديد المسارات والسرعات والمخاطر المعتمدة.\n## خطة حركة الموقع\nحدد المداخل والمخارج واتجاهات السير ومعابر المشاة ومناطق التحميل والمركبات الثقيلة والمناطق المحظورة ومسارات الطوارئ. لا تغير المسارات دون تفويض.\n## تقييم المخاطر\nراجع خطوط الرؤية والنقاط العمياء ومسار التفاف المركبة ومسافة التوقف وطريق الهروب. التمركز وسط التقاطع ليس آمنًا تلقائيًا.\n## موقف تطبيقي\nانخفضت الرؤية بسبب الضباب أو عاصفة رملية. أبلغ غرفة التحكم وخفّض أو أوقف الحركة وفق الخطة المعتمدة واطلب احتياطات إضافية.\n## خلاصة\nاقرأ الخطة وقيّم المخاطر قبل توجيه المركبات.',questions:[
q('Which condition can increase driving risk? / أي حالة قد تزيد مخاطر القيادة؟',['Poor visibility / ضعف الرؤية','Clear markings / وضوح العلامات','Good lighting / الإضاءة الجيدة','Low pedestrian activity / قلة حركة المشاة']),
q('How should drivers respond to poor visibility? / كيف يستجيب السائق لضعف الرؤية؟',['Slow down and follow site rules / تخفيف السرعة واتباع تعليمات الموقع','Maintain speed regardless / الحفاظ على السرعة مهما حدث','Use a phone torch while driving / استخدام الهاتف أثناء القيادة','Drive close to the vehicle ahead / الاقتراب من المركبة الأمامية']),
q('What should determine speed on site? / ما الذي يحدد السرعة داخل الموقع؟',['Posted limits and current conditions / الحدود المعلنة والظروف الحالية','Urgency alone / الاستعجال فقط','Vehicle size alone / حجم المركبة فقط','Driver confidence / ثقة السائق']),
q('Why is tailgating unsafe? / لماذا تعد متابعة المركبة عن قرب غير آمنة؟',['It reduces stopping distance / تقلل مسافة التوقف المتاحة','It improves visibility / تحسن الرؤية','It prevents all collisions / تمنع كل التصادمات','It is required in queues / مطلوبة في الطوابير']),
q('What is the safe response to a slippery surface? / ما التصرف الآمن عند انزلاق السطح؟',['Reduce speed and avoid sudden actions / تخفيف السرعة وتجنب الحركات المفاجئة','Brake sharply at all times / الضغط المفاجئ على المكابح دائماً','Accelerate through turns / التسارع في المنعطفات','Ignore warning signs / تجاهل التحذيرات'])
]},
{id:'tm2s1',videoUrl:'assets/traffic-videos/01_gate_access.mp4',slide:3,titleEn:'Access Control Points and Inspection Traffic',titleAr:'نقاط التحكم بالدخول وحركة المركبات عند التفتيش',bodyEn:'## Learning objectives\n• Manage approaching vehicles at Access Control Points (ACP).\n• Coordinate safely with security inspection teams.\n## Gate traffic\nUse designated waiting lanes, preserve clear emergency access and prevent queues from blocking public roads. Authorised security personnel perform identity and permit checks; the Traffic Marshal controls movement only as instructed.\n## Inspection lanes\nConfirm that an inspection bay is ready before releasing a vehicle. Direct visitors, deliveries and rejected vehicles solely to authorised areas.\n## Scenario\nInspection lanes are full and another delivery arrives. Hold it in an approved position and coordinate with the inspection supervisor.\n## Key takeaway\nSafe flow supports security screening and never replaces it.',bodyAr:'## أهداف التعلم\n• تنظيم المركبات عند نقاط التحكم بالدخول ACP.\n• التنسيق مع فرق التفتيش.\n## حركة البوابات\nاستخدم حارات الانتظار المعتمدة، ولا تعطل مسارات الطوارئ أو الطرق العامة. يتولى أفراد الأمن المخولون فحص الهويات والتصاريح، بينما ينظم Traffic Marshal الحركة بتوجيهاتهم.\n## مسارات التفتيش\nتأكد من جاهزية الحارة قبل إرسال مركبة. وجّه الموردين والزوار والمركبات المرفوضة إلى الأماكن المصرح بها فقط.\n## موقف تطبيقي\nامتلأت حارات التفتيش ووصلت مركبة توريد. ضعها في موضع انتظار معتمد ونسّق مع مشرف التفتيش.\n## خلاصة\nانسيابية الحركة الآمنة تدعم التفتيش الأمني ولا تحل محله.',questions:[
q('What should be checked before controlled entry? / ما الذي يجب التحقق منه قبل الدخول المنظم؟',['Vehicle authorization / تصريح المركبة','Driver preference / رغبة السائق','Vehicle colour only / لون المركبة فقط','Arrival time only / وقت الوصول فقط']),
q('Where should vehicles be directed? / إلى أين يجب توجيه المركبات؟',['Approved lanes and stop points / المسارات ونقاط التوقف المعتمدة','Any open space / أي مساحة مفتوحة','Pedestrian walkways / ممرات المشاة','Emergency access lanes / مسارات الطوارئ']),
q('What is tailgating at an access point? / ما المقصود بالدخول خلف مركبة أخرى دون تحقق؟',['An unauthorized vehicle following through / دخول مركبة غير مصرح بها خلف أخرى','A vehicle parking correctly / وقوف المركبة بشكل صحيح','A routine inspection / فحص روتيني','A marked pedestrian crossing / ممر مشاة محدد']),
q('What should happen if authorization cannot be confirmed? / ماذا يحدث إذا تعذر تأكيد التصريح؟',['Hold safely and verify through procedure / إيقاف المركبة بأمان والتحقق وفق الإجراء','Allow entry to avoid delay / السماح بالدخول لتجنب التأخير','Remove the barrier / إزالة الحاجز','Ask another driver to decide / ترك القرار لسائق آخر']),
q('Who may authorize an exception? / من يمكنه اعتماد استثناء؟',['An authorized person under site procedure / شخص مخول وفق إجراءات الموقع','Any waiting driver / أي سائق منتظر','A visitor / زائر','Nobody needs to approve / لا حاجة للموافقة'])
]},
{id:'tm2s2',videoUrl:'assets/traffic-videos/01_gate_access.mp4',slide:4,titleEn:'Driver Induction, Site Rules and Noncompliance',titleAr:'توعية السائقين وقواعد الموقع والتعامل مع المخالفات',bodyEn:'## Learning objectives\n• Brief drivers on routes, speed and crossings.\n• Respond professionally to refusal or unsafe behaviour.\n## Driver induction\nTell drivers the approved route, site speed limit, parking and loading locations, pedestrian crossings and emergency restrictions. Confirm that instructions are understood.\n## Noncompliance\nStay calm and out of moving traffic. Escalate refusal, unsafe driving or inspection disputes to the authorised supervisor. Denial of entry, wheel immobilisation or enforcement requires legal authority and written procedures.\n## Cultural awareness\nUse concise, respectful language and protect privacy during inspections.\n## Scenario\nA driver refuses to use the assigned inspection lane. Stop movement safely and escalate, not argue in a vehicle lane.\n## Key takeaway\nClear directions and controlled escalation prevent avoidable incidents.',bodyAr:'## أهداف التعلم\n• توعية السائق بمسارات الدخول والسرعات والمعابر.\n• التعامل المهني مع المخالفة أو رفض التعليمات.\n## توعية السائق Site Induction\nاشرح المسار المعتمد وحد السرعة وأماكن الوقوف والتحميل ومعابر المشاة وقيود الطوارئ، وتأكد من فهم السائق.\n## التعامل مع الرفض\nحافظ على هدوئك وابتعد عن حركة المركبات. صعّد مخالفات السير أو رفض التفتيش للمشرف المخول. المنع أو تثبيت العجلات أو إنفاذ أي إجراء يخضع للقانون والصلاحيات والسياسات المكتوبة.\n## الاعتبارات الثقافية\nاستخدم لغة واضحة ومحترمة واحفظ الخصوصية أثناء التفتيش.\n## موقف تطبيقي\nرفض سائق دخول حارة التفتيش المحددة. أوقف الحركة بأمان وأبلغ المشرف بدلًا من الجدال وسط الطريق.\n## خلاصة\nالتوجيه الواضح والتصعيد المنظم يمنعان الحوادث.',questions:[
q('Who should conduct a vehicle inspection? / من الذي ينبغي أن يجري فحص المركبة؟',['Authorized and trained personnel / أفراد مخولون ومدربون','Any nearby visitor / أي زائر قريب','Another driver / سائق آخر','Untrained bystanders / أشخاص غير مدربين']),
q('Where should staff avoid standing? / أين يجب تجنب الوقوف؟',['Blind spots and unsafe gaps / النقاط العمياء والفجوات غير الآمنة','Marked safe area / منطقة آمنة محددة','Approved inspection point / نقطة الفحص المعتمدة','Protected walkway / ممر محمي']),
q('What should happen before an inspection starts? / ماذا يجب أن يحدث قبل بدء الفحص؟',['Ensure the vehicle is safely positioned / التأكد من تموضع المركبة بأمان','Stand behind it immediately / الوقوف خلفها فوراً','Ignore nearby traffic / تجاهل حركة المرور','Ask the driver to move without direction / طلب الحركة دون توجيه']),
q('Why should inspection procedures be followed? / لماذا يجب اتباع إجراءات الفحص؟',['To maintain safety and consistency / للحفاظ على السلامة والاتساق','To avoid records / لتجنب السجلات','To speed up at any cost / التسريع بأي ثمن','To skip authorization / لتجاوز التصريح']),
q('What is the safe response to an unsafe position? / ما التصرف الآمن عند وجود موقع غير آمن؟',['Stop and move to a safe position / التوقف والانتقال إلى موقع آمن','Continue to save time / الاستمرار لتوفير الوقت','Stand closer to traffic / الاقتراب من حركة المرور','Ignore the concern / تجاهل الخطر'])
]},
{id:'tm3s1',videoUrl:'assets/traffic-videos/02_pedestrian_separation.mp4',slide:5,titleEn:'Pedestrian Separation and Traffic Calming',titleAr:'فصل مسارات المشاة وتهدئة الحركة المرورية',bodyEn:'## Learning objectives\n• Separate people from vehicle routes.\n• Recognise safe traffic calming measures.\n## Pedestrian safety\nUse designated walkways, protected crossings, barriers and adequate sightlines. Provide accessible routes for people with disabilities. Avoid exposing pedestrians to reversing vehicles.\n## Traffic calming\nApproved speed humps, road markings, raised crossings, cones and temporary barriers help reduce vehicle speed. Install or move controls only as authorised after risk assessment.\n## Scenario\nA delivery vehicle obstructs a protected crossing. Secure movement and coordinate removal before reopening the crossing.\n## Key takeaway\nSafe separation requires planned physical controls, not warnings alone.',bodyAr:'## أهداف التعلم\n• فصل المشاة عن المركبات.\n• التعرف على وسائل تهدئة الحركة المعتمدة.\n## سلامة المشاة\nاستخدم ممرات ومعابر وحواجز مخصصة وخطوط رؤية واضحة. وفر مسارات مناسبة لأصحاب الهمم، وامنع وجود المشاة خلف المركبات التي ترجع للخلف.\n## تهدئة الحركة\nتساعد المطبات والمعابر المرتفعة والعلامات الأرضية والأقماع والحواجز في خفض السرعة، بشرط اعتمادها وتقييم مخاطرها قبل تركيبها أو تغيير موضعها.\n## موقف تطبيقي\nأغلقت مركبة توريد معبرًا للمشاة. أمّن الحركة ونسق لإزالة العائق قبل إعادة فتح المعبر.\n## خلاصة\nالفصل المادي والتخطيط السليم أهم من التحذير الشفهي وحده.',questions:[
q('What is a good way to reduce pedestrian risk? / ما الطريقة الجيدة لتقليل مخاطر المشاة؟',['Separate pedestrian and vehicle routes / فصل مسارات المشاة عن المركبات','Mix both flows / خلط المسارين','Block marked crossings / إغلاق المعابر المحددة','Remove warning signs / إزالة التحذيرات']),
q('What should a crossing be? / كيف ينبغي أن يكون معبر المشاة؟',['Visible and unobstructed / واضحاً وخالياً من العوائق','Used for storage / مستخدماً للتخزين','Hidden behind parked vehicles / مخفياً خلف المركبات','Blocked during busy periods / مغلقاً وقت الازدحام']),
q('Where should pedestrians not be directed? / إلى أين لا ينبغي توجيه المشاة؟',['Into a live vehicle path / إلى مسار مركبات نشط','To a marked safe crossing / إلى معبر آمن محدد','To a protected walkway / إلى ممر محمي','To an assembly point / إلى نقطة تجمع']),
q('What should a controller do near a busy crossing? / ماذا يفعل مراقب المرور قرب معبر مزدحم؟',['Follow site controls and maintain clear sightlines / اتباع ضوابط الموقع والحفاظ على وضوح الرؤية','Look away while directing / صرف النظر أثناء التوجيه','Allow reversing without checking / السماح بالرجوع دون تحقق','Stand in the traffic lane / الوقوف في مسار المرور']),
q('Why must walkways remain clear? / لماذا يجب إبقاء الممرات خالية؟',['To support safe and accessible movement / لدعم الحركة الآمنة وسهولة المرور','To create extra parking / لإنشاء مواقف إضافية','To hide signs / لإخفاء اللافتات','To store equipment / لتخزين المعدات'])
]},
{id:'tm3s2',videoUrl:'assets/traffic-videos/03_parking_operations.mp4',slide:6,titleEn:'Parking Operations, Reversing and Smart Systems',titleAr:'إدارة المواقف والرجوع الآمن والأنظمة الذكية',bodyEn:'## Learning objectives\n• Manage parking and loading safely.\n• Recognise reversing and smart access risks.\n## Parking management\nGuide vehicles to marked spaces, protect accessible and VIP spaces as authorised, keep loading lanes and emergency routes clear. Use automated barriers, ANPR and occupancy indicators according to site privacy policy.\n## Reversing\nPrefer forward travel. If trained and authorised to guide reversing, agree the signals and stop rule first, stay visible outside the path and never stand behind a moving vehicle.\n## Scenario\nA driver reverses toward a busy pedestrian path. Stop the manoeuvre by the agreed safe signal and secure the pedestrian route.\n## Key takeaway\nGood parking management is safe circulation, not just filling spaces.',bodyAr:'## أهداف التعلم\n• إدارة مواقف المركبات ومناطق التحميل.\n• فهم مخاطر الرجوع للخلف والأنظمة الذكية.\n## إدارة المواقف\nوجّه المركبات إلى الأماكن المحددة، وحافظ على المواقف المخصصة لأصحاب الهمم وكبار الشخصيات ضمن التفويض. لا تعق مسارات التحميل والطوارئ. استخدم الحواجز الآلية وأنظمة ANPR ومستشعرات الإشغال وفق سياسة الخصوصية.\n## الرجوع للخلف\nفضّل الحركة للأمام. عند الاضطرار للتوجيه الخلفي، يجب تدريب المنظم وتفويضه والاتفاق على الإشارات وقاعدة التوقف، مع البقاء مرئيًا خارج مسار المركبة.\n## موقف تطبيقي\nبدأ سائق الرجوع قرب ممر مشاة مزدحم. أوقف المناورة بإشارة آمنة ومتفق عليها وأمّن الممر.\n## خلاصة\nالموقف الناجح يضمن حركة آمنة وليس مجرد زيادة عدد المركبات.',questions:[
q('Where should vehicles park? / أين يجب أن تقف المركبات؟',['In designated parking areas / في مناطق الوقوف المحددة','Across pedestrian routes / عبر مسارات المشاة','In emergency lanes / في مسارات الطوارئ','Wherever convenient / حيثما كان مناسباً']),
q('Why is reversing risky? / لماذا يعد الرجوع للخلف محفوفاً بالمخاطر؟',['Visibility may be limited / قد تكون الرؤية محدودة','It always increases visibility / يزيد الرؤية دائماً','It removes blind spots / يلغي النقاط العمياء','It needs no attention / لا يحتاج إلى انتباه']),
q('When should a driver stop reversing? / متى يجب على السائق التوقف عن الرجوع؟',['When the path is not safely visible / عندما لا يكون المسار مرئياً بأمان','When the route is clear / عندما يكون المسار واضحاً','When authorized guidance is available / عندما يتوفر توجيه معتمد','After checking all hazards / بعد التحقق من جميع المخاطر']),
q('What should loading areas have? / ماذا ينبغي أن يتوفر في مناطق التحميل؟',['Clear controls and separation from pedestrians / ضوابط واضحة وفصل عن المشاة','Unmarked vehicle routes / مسارات غير محددة','Blocked emergency access / وصول طوارئ مغلق','Uncontrolled reversing / رجوع غير مسيطر عليه']),
q('What is the role of a spotter when required? / ما دور الموجّه عند الحاجة؟',['Give agreed signals from a safe position / إعطاء إشارات متفق عليها من موقع آمن','Stand behind the moving vehicle / الوقوف خلف المركبة المتحركة','Use unclear gestures / استخدام إشارات غير واضحة','Distract the driver / تشتيت السائق'])
]},
{id:'tm4s1',videoUrl:'assets/traffic-videos/04_incident_response.mp4',slide:7,titleEn:'PPE, Extreme Weather and Emergency Access',titleAr:'معدات الوقاية والطقس القاسي ومسارات الطوارئ',bodyEn:'## Learning objectives\n• Select suitable PPE and safe standing positions.\n• Recognise heat stress and reduced visibility.\n• Protect emergency routes.\n## Personal protection\nUse high-visibility clothing, suitable footwear and a safe escape route. Stay outside vehicle blind spots and turning paths.\n## Heat and weather\nFollow the employer\'s heat plan: regular access to drinking water, breaks, shade or cooling and gradual acclimatisation. Fluid needs vary; no fixed daily quantity suits everyone. Report confusion, dizziness or collapse and summon help. In sand, rain or fog, follow approved restrictions or suspend movement.\n## Emergency access\nKeep fire, ambulance and police routes unobstructed. Call the control room and responders. Provide first aid only if trained and the scene is safe.\n## Scenario\nA colleague becomes unwell beside a busy roadway in extreme heat. Stop movement safely, summon assistance and follow the site plan.\n## Key takeaway\nThe Traffic Marshal must stay safe to protect others.',bodyAr:'## أهداف التعلم\n• اختيار معدات الوقاية والتمركز الآمن.\n• التعرف على الإجهاد الحراري وضعف الرؤية.\n• المحافظة على مسارات الطوارئ.\n## الحماية الشخصية\nارتدِ ملابس عالية الوضوح وأحذية مناسبة، واحتفظ بمسار هروب بعيدًا عن النقاط العمياء ومناطق التفاف المركبات.\n## الحرارة والطقس\nاتبع خطة الإجهاد الحراري بالموقع: الماء بانتظام والراحة والظل أو التبريد والتأقلم التدريجي. تختلف حاجة السوائل من شخص لآخر، ولا توجد كمية يومية ثابتة تناسب الجميع. أبلغ عن الدوار أو الارتباك أو الإغماء واطلب المساعدة. أثناء العواصف الرملية والمطر والضباب التزم بتقييد الحركة أو إيقافها وفق الخطة.\n## مسارات الطوارئ\nأبقِ طرق الإسعاف والإطفاء والشرطة خالية. اتصل بغرفة التحكم والمستجيبين، وقدم الإسعافات فقط ضمن تدريبك وبعد تأمين المكان.\n## موقف تطبيقي\nأصيب زميل بإعياء حراري قرب طريق مزدحم. أمّن الحركة واطلب الدعم واتبع خطة الموقع.\n## خلاصة\nسلامة منظم الحركة شرط لحماية الجميع.',questions:[
q('What comes first at a traffic incident? / ما الأولوية الأولى عند حادث مروري؟',['Protect life and make the area safe / حماية الأرواح وتأمين المنطقة','Move vehicles before checking people / تحريك المركبات قبل فحص الأشخاص','Take photographs / التقاط الصور','Resume normal flow immediately / استئناف الحركة فوراً']),
q('What should staff avoid at an unsafe scene? / ما الذي ينبغي تجنبه في موقع غير آمن؟',['Entering or exposing themselves to traffic / الدخول أو التعرض لحركة المرور','Raising an alarm / إطلاق التنبيه','Following emergency procedures / اتباع إجراءات الطوارئ','Requesting trained responders / طلب المستجيبين المدربين']),
q('Why keep emergency access clear? / لماذا يجب إبقاء وصول الطوارئ خالياً؟',['To allow responders to reach the scene / لتمكين فرق الاستجابة من الوصول','To reserve space for parking / لتخصيص موقف','To delay response / لتأخير الاستجابة','To store equipment / لتخزين المعدات']),
q('What should be done if someone is injured? / ماذا ينبغي فعله إذا أصيب شخص؟',['Call the appropriate emergency response and follow training / طلب الاستجابة المناسبة واتباع التدريب','Move them without assessing danger / تحريكه دون تقييم الخطر','Ignore them until traffic clears / تجاهله حتى تخف الحركة','Ask untrained people to treat serious injuries / تكليف غير المدربين بعلاج إصابات خطيرة']),
q('What guides the response to an incident? / ما الذي يوجه الاستجابة للحادث؟',['The site emergency plan and trained roles / خطة الطوارئ وأدوار المدربين','Rumours / الشائعات','Personal guesses / التخمين الشخصي','Social media posts / منشورات التواصل'])
]},
{id:'tm4s2',videoUrl:'assets/traffic-videos/04_incident_response.mp4',slide:8,titleEn:'Incident Reporting, SCRIM and Factual Records',titleAr:'تقارير الحوادث والمخالفات والتوثيق وفق SCRIM',bodyEn:'## Learning objectives\n• Make objective, chronological traffic notes.\n• Record vehicle descriptions and report violations.\n## Incident records\nRecord date, time, exact location, direction, observed behaviour, conditions, witnesses and response. Distinguish verified facts from assumptions; preserve evidence under site policy.\n## SCRIM\nSCRIM may be taught as a local memory aid for vehicle shape, colour, registration, identifying marks and make/model. It is not a universal legal standard; use the organisation\'s reporting form.\n## Compliance\nReport dangerous driving, obstruction or damage to the supervisor. Never seize documents, immobilise vehicles or detain a driver without lawful authorisation.\n## Scenario\nA vehicle enters a prohibited lane then leaves. Describe only what you saw and can verify.\n## Key takeaway\nAccurate facts support safe decisions and fair investigation.',bodyAr:'## أهداف التعلم\n• كتابة تقارير موضوعية متسلسلة زمنيًا.\n• تسجيل بيانات المركبات والإبلاغ عن المخالفات.\n## سجل الحادث\nدوّن التاريخ والوقت والموقع والاتجاه وما شاهدته من سلوك وظروف وشهود وإجراءات. ميّز الحقائق المؤكدة عن التخمين واحفظ الأدلة وفق الإجراءات.\n## قاعدة SCRIM\nيمكن استخدام SCRIM كمساعد تعليمي لتذكر شكل المركبة ولونها ورقم لوحتها وعلاماتها المميزة ونوعها وطرازها، وليس باعتبارها نموذجًا قانونيًا موحدًا. استخدم نموذج التقارير المعتمد بالموقع.\n## الالتزام والصلاحيات\nأبلغ عن القيادة الخطرة أو العوائق أو التلف. لا تصادر وثائق أو تثبت عجلات أو تحتجز سائقًا دون تفويض قانوني.\n## موقف تطبيقي\nدخلت مركبة حارة ممنوعة ثم غادرت. وثق فقط ما شاهدته وتأكدت منه.\n## خلاصة\nالمعلومات الدقيقة أساس القرار السليم والتحقيق العادل.',questions:[
q('What should an incident report contain? / ماذا يجب أن يتضمن تقرير الحادث؟',['Objective facts and actions taken / حقائق موضوعية وإجراءات متخذة','Rumours and assumptions / شائعات وافتراضات','Personal blame / اتهامات شخصية','Unverified online comments / تعليقات غير مؤكدة عبر الإنترنت']),
q('When should an incident be reported? / متى ينبغي الإبلاغ عن الحادث؟',['Promptly through approved channels / سريعاً عبر القنوات المعتمدة','Only at the end of the month / في نهاية الشهر فقط','Only if a manager asks later / فقط إذا طلب المدير لاحقاً','Never if there is no photograph / لا يُبلغ عنه إذا لم توجد صورة']),
q('Which detail is objective? / أي معلومة تعد موضوعية؟',['Observed time and location / الوقت والموقع الملحوظان','A guess about intent / تخمين النية','A rumour about the driver / شائعة عن السائق','An unsupported accusation / اتهام بلا دليل']),
q('Who may receive incident information? / من يمكنه استلام معلومات الحادث؟',['Authorized recipients / الجهات المخولة','Anyone who asks / كل من يسأل','Social media followers / متابعو التواصل','Other drivers without a need / سائقون لا حاجة لديهم للمعلومة']),
q('Why avoid speculation in reports? / لماذا يجب تجنب التكهن في التقارير؟',['To keep records accurate and fair / للحفاظ على دقة السجلات وعدالتها','To make reports longer / لإطالة التقارير','To assign blame quickly / لإلقاء اللوم بسرعة','To avoid verification / لتجنب التحقق'])
]},
{id:'tm5s1',videoUrl:'assets/traffic-videos/05_hand_signals.mp4',slide:9,titleEn:'Traffic Marshal Hand Signals and Field Communication',titleAr:'إشارات يد منظم حركة المرور والتواصل الميداني',bodyEn:'## Learning objectives\n• Recognise six common training movement commands.\n• Use agreed visual and radio communication safely.\n## Movement commands\nTrain in stop, emergency stop, forward, reverse, right turn and left turn using only the approved site signal system. There is no universal six-signal legal standard for every region. Agree meanings with the driver and never improvise.\n## Tools and position\nA whistle attracts attention; illuminated red and green batons may help at night when authorised. Keep the Marshal visible and outside the vehicle path. If eye contact or understanding fails, stop movement and re-establish communication.\n## Scenario\nA driver misunderstands a turning signal. Stop safely and clarify before any further movement.\n## Key takeaway\nA clear, agreed signal is more important than fast movement.',bodyAr:'## أهداف التعلم\n• التعرف على ست حركات تدريبية شائعة.\n• استخدام الإشارات والاتصال اللاسلكي بأمان.\n## إشارات الحركة\nتدرّب على التوقف والتوقف الطارئ والتقدم والرجوع والانعطاف يمينًا ويسارًا وفق إشارات الموقع المعتمدة فقط. لا توجد مجموعة قانونية موحدة من ست إشارات لكل الدول؛ تأكد من الاتفاق مع السائق ولا ترتجل.\n## الأدوات والتمركز\nتستخدم الصفارة لجذب الانتباه ويمكن استخدام العصي الضوئية الحمراء والخضراء ليلًا عند السماح بها. ابقَ مرئيًا وخارج مسار المركبة. إذا فقدت التواصل أو لم يفهم السائق الإشارة، أوقف الحركة وأعد التوضيح.\n## موقف تطبيقي\nفهم السائق إشارة انعطاف بصورة خاطئة. أوقف الحركة بأمان وأعد شرح الإشارة قبل الاستمرار.\n## خلاصة\nالإشارة الواضحة المتفق عليها أهم من سرعة التوجيه.',questions:[
q('What makes a traffic instruction effective? / ما الذي يجعل توجيه المرور فعالاً؟',['Clear, short and unambiguous wording / كلمات واضحة ومختصرة وغير ملتبسة','Long unclear gestures / إشارات طويلة وغير واضحة','Conflicting instructions / تعليمات متعارضة','Shouting from an unsafe position / الصراخ من موقع غير آمن']),
q('What should happen after an important direction? / ماذا ينبغي بعد إعطاء توجيه مهم؟',['Confirm it was understood / التأكد من فهمه','Assume it was understood / افتراض أنه فُهم','Change it without warning / تغييره دون تنبيه','Ignore driver response / تجاهل استجابة السائق']),
q('Which signals should staff use? / ما الإشارات التي ينبغي استخدامها؟',['Approved and agreed signals / الإشارات المعتمدة والمتفق عليها','Invented gestures / إشارات مرتجلة','Signals hidden from drivers / إشارات مخفية عن السائقين','Different signals at once / إشارات مختلفة في الوقت نفسه']),
q('Where should a controller stand? / أين ينبغي أن يقف مراقب المرور؟',['In a designated safe position / في موقع آمن محدد','In the vehicle path / في مسار المركبة','Behind a reversing vehicle / خلف مركبة ترجع للخلف','Where visibility is blocked / حيث تكون الرؤية محجوبة']),
q('What should staff do if communication fails? / ماذا يفعل الموظف إذا فشل الاتصال؟',['Pause movement safely and restore clear communication / إيقاف الحركة بأمان واستعادة الاتصال الواضح','Continue by guessing / الاستمرار بالتخمين','Wave all vehicles through / السماح لجميع المركبات بالمرور','Ignore the failed signal / تجاهل فشل الإشارة'])
]},
{id:'tm5s2',videoUrl:'assets/traffic-videos/05_hand_signals.mp4',slide:10,titleEn:'Radio Calls, Shift Handover and Traffic Marshal Practice',titleAr:'الاتصالات اللاسلكية وتسليم المناوبة والتطبيق العملي',bodyEn:'## Learning objectives\n• Use authorised radio call signs and concise reporting.\n• Carry out a structured traffic duty handover.\n• Practise safe movement controls in supervised conditions.\n## Radio reporting\nState call sign, location, observed hazard and required action, and confirm receipt. Use the approved fallback method when radio communications fail.\n## Shift handover\nRecord changed routes, incidents, blocked lanes, traffic controls, faulty equipment, pending inspections and emergency arrangements. Explain outstanding issues to the incoming Marshal.\n## Controlled practice\nUnder a qualified instructor, rehearse stopping and releasing vehicles, pedestrian crossing control, gate queues and emergency access in a controlled training area. Stop if the Marshal or driver loses visual contact.\n## Competence\nAn online completion result does not automatically grant legal or operational authority: local employer authorisation and practical assessment may still be required.\n## Key takeaway\nSafe traffic control depends on teamwork, clear signals and documented handover.',bodyAr:'## أهداف التعلم\n• استخدام نداءات اللاسلكي المعتمدة والبلاغات المختصرة.\n• تسليم المناوبة وفق ترتيب واضح.\n• تطبيق مهارات منظم حركة المرور في بيئة تدريب محكومة.\n## البلاغ اللاسلكي\nاذكر رمز النداء والموقع والخطر والإجراء المطلوب، وتأكد من استلام الرسالة. استخدم خطة الاتصال البديلة إذا تعطلت الأجهزة.\n## تسليم المناوبة\nسجل تغير المسارات والحوادث والعوائق والأجهزة المعطلة والتفتيش المؤجل وترتيبات الطوارئ، وأوضح الملاحظات للمنظم المستلم.\n## التدريب العملي\nتحت إشراف مدرب مؤهل، تدرب على إيقاف المركبات وتحريكها وعبور المشاة وطوابير البوابات ومسارات الطوارئ في منطقة آمنة. أوقف المناورة إذا فقد السائق أو المنظم التواصل البصري.\n## الكفاءة والتفويض\nلا يمنح إكمال الدورة عبر الإنترنت تصريحًا قانونيًا أو تشغيليًا تلقائيًا؛ وقد يُشترط تقييم عملي وتفويض من جهة العمل.\n## خلاصة\nالعمل الآمن يتطلب تعاون الفريق وإشارات واضحة وتسليمًا موثقًا.',questions:[
q('What should be included in handover? / ماذا يجب أن يشمله تسليم المناوبة؟',['Current hazards and outstanding actions / المخاطر الحالية والإجراءات المعلقة','Only personal opinions / الآراء الشخصية فقط','No incident details / عدم ذكر الحوادث','Unconfirmed rumours / الشائعات غير المؤكدة']),
q('Why record temporary traffic changes? / لماذا يجب تسجيل تغييرات المرور المؤقتة؟',['So all teams follow the same safe arrangement / لكي تتبع جميع الفرق الترتيب الآمن نفسه','To keep them secret / لإبقائها سرية','To avoid review / لتجنب المراجعة','To remove accountability / لإلغاء المساءلة']),
q('What should happen to an equipment fault? / ماذا ينبغي أن يحدث عند وجود عطل في المعدات؟',['Report it and follow the control procedure / الإبلاغ عنه واتباع إجراء التحكم','Ignore it until next shift / تجاهله حتى المناوبة التالية','Hide it from the next team / إخفاؤه عن الفريق التالي','Continue using it regardless / الاستمرار باستخدامه مهما كان']),
q('How should a handover be confirmed? / كيف يتم التأكد من التسليم؟',['Communicate key details and confirm understanding / توصيل التفاصيل المهمة والتأكد من فهمها','Leave an unclear note / ترك ملاحظة غير واضحة','Assume the next team knows / افتراض أن الفريق التالي يعرف','Share only verbally with one person / إبلاغ شخص واحد شفهياً فقط']),
q('What supports improvement after an incident? / ما الذي يدعم التحسين بعد الحادث؟',['Review facts and agreed corrective actions / مراجعة الحقائق والإجراءات التصحيحية المتفق عليها','Blame without evidence / إلقاء اللوم دون دليل','Delete the record / حذف السجل','Ignore recurring risks / تجاهل المخاطر المتكررة'])
]}
];
const TRAFFIC_FINAL_ASSESSMENT=[
  {
    "q": "Why is site traffic control important? / لماذا تعتبر إدارة المرور بالموقع مهمة؟",
    "a": [
      "It supports safe movement of vehicles and pedestrians / يدعم الحركة الآمنة للمركبات والمشاة",
      "It increases congestion / يزيد الازدحام",
      "It removes signs / يزيل اللافتات",
      "It stops all vehicles / يوقف جميع المركبات"
    ],
    "correct": 0
  },
  {
    "q": "What areas can traffic duty include? / ما المناطق التي قد تشملها مهام المرور؟",
    "a": [
      "Intersections, gates and parking areas / التقاطعات والبوابات ومناطق المواقف",
      "Only offices / المكاتب فقط",
      "Only elevators / المصاعد فقط",
      "Only warehouses / المستودعات فقط"
    ],
    "correct": 0
  },
  {
    "q": "What is a center roadway position good for? / لماذا يستخدم التمركز في وسط التقاطع؟",
    "a": [
      "It provides a full view of the intersection / يوفر رؤية كاملة للتقاطع",
      "It is always the safest position / هو دائمًا الموقع الأكثر أمانًا",
      "It is for parking only / يُستخدم للمواقف فقط",
      "It is for fire inspection / يُستخدم لفحص الحريق"
    ],
    "correct": 0
  },
  {
    "q": "When may the center position be used? / متى يمكن استخدام التمركز في وسط التقاطع؟",
    "a": [
      "When signals are inoperative and speeds are low / عندما تكون الإشارات معطلة وتكون السرعات منخفضة",
      "At all times / في جميع الأوقات",
      "Only at night / ليلًا فقط",
      "Only in parking lots / في مواقف السيارات فقط"
    ],
    "correct": 0
  },
  {
    "q": "What is an advantage of the corner position? / ما ميزة التمركز عند زاوية التقاطع؟",
    "a": [
      "Greater personal safety / مزيد من السلامة الشخصية",
      "Less visibility / رؤية أقل",
      "No control of traffic / عدم التحكم في المرور",
      "Higher collision risk / ارتفاع خطر الاصطدام"
    ],
    "correct": 0
  },
  {
    "q": "What is one function of a STOP sign? / ما إحدى وظائف لوحة STOP؟",
    "a": [
      "Regulate vehicle flow / تنظيم حركة المركبات",
      "Increase speed / زيادة السرعة",
      "Hide intersections / إخفاء التقاطعات",
      "Replace all officers / استبدال جميع رجال الأمن"
    ],
    "correct": 0
  },
  {
    "q": "When is a point-control officer needed? / متى يحتاج الموقع إلى رجل أمن للتحكم بالنقطة؟",
    "a": [
      "During construction, accidents, peak hours or congestion / أثناء أعمال الإنشاء أو الحوادث أو ساعات الذروة أو الازدحام",
      "Only during lunch / أثناء الغداء فقط",
      "Only when traffic is empty / عندما تكون حركة المرور خالية فقط",
      "Never / أبدًا"
    ],
    "correct": 0
  },
  {
    "q": "What does professional posture communicate? / ماذا توصل الوقفة المهنية؟",
    "a": [
      "That the officer is in command / أن رجل الأمن هو المسؤول",
      "That the officer is off duty / أن رجل الأمن خارج الخدمة",
      "That traffic is closed forever / أن المرور مغلق إلى الأبد",
      "That no rules apply / أن القواعد لا تنطبق"
    ],
    "correct": 0
  },
  {
    "q": "What should be worn for high visibility? / ماذا يجب ارتداؤه لرفع مستوى الوضوح البصري؟",
    "a": [
      "Reflective/high-visibility material / مواد عاكسة أو عالية الوضوح",
      "Dark clothing only / ملابس داكنة فقط",
      "No safety gear / دون معدات سلامة",
      "Office shoes only / أحذية مكتبية فقط"
    ],
    "correct": 0
  },
  {
    "q": "Why are clear hand signals important? / لماذا تعتبر إشارات اليد الواضحة مهمة؟",
    "a": [
      "They support prompt driver compliance / تساعد على امتثال السائقين بسرعة",
      "They create confusion / تسبب الارتباك",
      "They replace all signs / تستبدل جميع اللافتات",
      "They stop pedestrians / توقف المشاة"
    ],
    "correct": 0
  },
  {
    "q": "What should the officer maintain with the driver? / ما الذي يجب أن يحافظ عليه رجل الأمن مع السائق؟",
    "a": [
      "Comfortable eye contact / تواصل بصري مريح",
      "No visibility / انعدام الرؤية",
      "Continuous shouting / الصراخ المستمر",
      "No communication / عدم التواصل"
    ],
    "correct": 0
  },
  {
    "q": "How is the STOP hand signal started? / كيف تبدأ إشارة إيقاف المرور باليد؟",
    "a": [
      "Look at and point to the selected driver / النظر إلى السائق المحدد والإشارة إليه",
      "Turn away from traffic / الابتعاد عن حركة المرور",
      "Close both eyes / إغلاق كلتا العينين",
      "Walk behind the vehicle / المشي خلف المركبة"
    ],
    "correct": 0
  },
  {
    "q": "Where should the palm face for a stop signal? / إلى أين تتجه راحة اليد عند إشارة التوقف؟",
    "a": [
      "Toward the driver / نحو السائق",
      "Toward the ground / نحو الأرض",
      "Toward the rear only / نحو الخلف فقط",
      "Toward the officer's face / نحو وجه رجل الأمن"
    ],
    "correct": 0
  },
  {
    "q": "Before starting waiting traffic, what should be checked? / ماذا يجب التأكد منه قبل بدء حركة المركبات المنتظرة؟",
    "a": [
      "That the intersection is clear / أن التقاطع خالٍ",
      "That the parking lot is full / أن موقف السيارات ممتلئ",
      "That all alarms are off / أن جميع الإنذارات متوقفة",
      "That pedestrians are absent everywhere / عدم وجود مشاة في أي مكان"
    ],
    "correct": 0
  },
  {
    "q": "What can help a slow driver respond? / ما الذي يمكن أن يساعد السائق البطيء على الاستجابة؟",
    "a": [
      "A clearer/faster decisive gesture / إشارة أو حركة أكثر وضوحًا وحسمًا وسرعة",
      "Random shouting / الصراخ العشوائي",
      "Turning away / الابتعاد",
      "Removing all signs / إزالة جميع اللافتات"
    ],
    "correct": 0
  },
  {
    "q": "What is the whistle used for? / فيما تستخدم الصافرة؟",
    "a": [
      "Attracting attention and gaining compliance / جذب الانتباه والحصول على الامتثال",
      "Starting a fire / إشعال حريق",
      "Opening vehicles / فتح المركبات",
      "Checking IDs / التحقق من الهويات"
    ],
    "correct": 0
  },
  {
    "q": "What does one long whistle blast mean in the course? / ماذا تعني صفارة طويلة واحدة وفقاً للدورة؟",
    "a": [
      "STOP / توقف",
      "START / ابدأ",
      "TURN LEFT / انعطف يسارًا",
      "PARK / اركن"
    ],
    "correct": 0
  },
  {
    "q": "What should be avoided when directing traffic? / ما الذي يجب تجنبه عند توجيه المرور؟",
    "a": [
      "Complicated arm movements and shouting / حركات الذراع المعقدة والصراخ",
      "Clear gestures / الإشارات الواضحة",
      "Eye contact / التواصل البصري",
      "Reflective clothing / الملابس العاكسة"
    ],
    "correct": 0
  },
  {
    "q": "Why are shoulders aligned with traffic flow? / لماذا يجب أن تكون الكتفان موازيتين لتدفق المرور؟",
    "a": [
      "To support safe movement and response / لدعم الحركة والاستجابة الآمنة",
      "To hide from drivers / الاختباء من السائقين",
      "To increase confusion / زيادة الارتباك",
      "To stop all pedestrians / إيقاف جميع المشاة"
    ],
    "correct": 0
  },
  {
    "q": "What is a key safety concern for a cold or wet officer? / ما أحد مخاطر رجل الأمن البارد أو المبتل؟",
    "a": [
      "Reduced safety for the officer and motorists / انخفاض مستوى السلامة لرجل الأمن وسائقي المركبات",
      "Improved visibility / تحسن الرؤية",
      "No risk / لا يوجد خطر",
      "Better traffic flow automatically / تحسن حركة المرور تلقائيًا"
    ],
    "correct": 0
  },
  {
    "q": "What does traffic separation help achieve? / ماذا يساعد فصل الحركة المرورية على تحقيقه؟",
    "a": [
      "Safer movement of different traffic types / حركة أكثر أمانًا لأنواع المرور المختلفة",
      "More conflicts / مزيد من التعارضات",
      "Less visibility / رؤية أقل",
      "No organization / عدم وجود تنظيم"
    ],
    "correct": 0
  },
  {
    "q": "What is a traffic induction intended to do? / ما الهدف من الإيجاز التعريفي المروري؟",
    "a": [
      "Explain site traffic rules and arrangements / شرح قواعد المرور وترتيبات الموقع",
      "Replace all signs / استبدال جميع اللافتات",
      "Stop training / إيقاف التدريب",
      "Remove barriers / إزالة الحواجز"
    ],
    "correct": 0
  },
  {
    "q": "Why are parking rules important? / لماذا تعتبر قواعد المواقف مهمة؟",
    "a": [
      "They organize vehicle parking and movement / تنظيم مواقف المركبات وحركتها",
      "They increase random parking / زيادة المواقف العشوائية",
      "They remove access routes / إزالة مسارات الوصول",
      "They stop all pedestrians / إيقاف جميع المشاة"
    ],
    "correct": 0
  },
  {
    "q": "What is traffic calming intended to reduce? / ما الذي تهدف تدابير تهدئة المرور إلى تقليله؟",
    "a": [
      "Vehicle speed and accidents / سرعة المركبات والحوادث",
      "Safety / السلامة",
      "Visibility / الرؤية",
      "Communication / التواصل"
    ],
    "correct": 0
  },
  {
    "q": "What can parking technologies support? / ماذا يمكن أن تدعم تقنيات إدارة المواقف؟",
    "a": [
      "Organized parking management / إدارة منظمة للمواقف",
      "Fire growth / نمو الحريق",
      "Crowd panic / هلع الحشد",
      "Baggage searches / تفتيش الأمتعة"
    ],
    "correct": 0
  },
  {
    "q": "What is the role of a gate-duty officer? / ما دور رجل الأمن في واجب البوابة؟",
    "a": [
      "Control and direct site access and traffic / التحكم في دخول الموقع وحركة المرور وتوجيههما",
      "Ignore vehicles / تجاهل المركبات",
      "Repair engines / إصلاح المحركات",
      "Run fire extinguishers / تشغيل طفايات الحريق"
    ],
    "correct": 0
  },
  {
    "q": "Why should traffic officers be visible? / لماذا يجب أن يكون رجال المرور واضحين للسائقين؟",
    "a": [
      "To communicate commands safely / التواصل بالأوامر بأمان",
      "To hide from traffic / الاختباء من حركة المرور",
      "To reduce compliance / تقليل الامتثال",
      "To avoid all communication / تجنب جميع أشكال التواصل"
    ],
    "correct": 0
  },
  {
    "q": "What can improper hand signals cause? / ماذا قد تسبب إشارات اليد الخاطئة؟",
    "a": [
      "Confusion, hesitation and accidents / الارتباك والتردد والحوادث",
      "Better traffic flow / تحسن حركة المرور",
      "Automatic parking / إيقاف المواقف تلقائيًا",
      "Fire suppression / إخماد الحريق"
    ],
    "correct": 0
  },
  {
    "q": "What should the officer do when not signaling? / ماذا يفعل رجل الأمن عندما لا يعطي إشارة؟",
    "a": [
      "Stand facing traffic in the specified ready position / الوقوف في مواجهة حركة المرور في وضع الاستعداد المحدد",
      "Turn his back to traffic / إدارة الظهر لحركة المرور",
      "Sit in the roadway / الجلوس في الطريق",
      "Leave the post / مغادرة الموقع"
    ],
    "correct": 0
  },
  {
    "q": "What is the overall aim of traffic control? / ما الهدف العام من التحكم في المرور؟",
    "a": [
      "Safe and orderly movement / حركة آمنة ومنظمة",
      "Maximum congestion / أقصى قدر من الازدحام",
      "Random vehicle movement / حركة عشوائية للمركبات",
      "No pedestrian protection / عدم حماية المشاة"
    ],
    "correct": 0
  }
];
// Fail closed if an editor accidentally changes the approved self-study structure.
const isValidQuestion=(item)=>item&&typeof item.q==='string'&&item.q.trim().length>0&&
  Array.isArray(item.a)&&item.a.length===4&&
  item.a.every(answer=>typeof answer==='string'&&answer.trim().length>0)&&
  new Set(item.a.map(answer=>answer.trim().toLowerCase())).size===4&&
  Number.isInteger(item.correct)&&item.correct>=0&&item.correct<4;
const screenIds=TRAFFIC_SCREENS.map(screen=>screen.id);
const finalQuestionTexts=TRAFFIC_FINAL_ASSESSMENT.map(item=>item.q.trim().toLowerCase());
if(TRAFFIC_SCREENS.length!==10||
  new Set(screenIds).size!==10||
  TRAFFIC_SCREENS.some(screen=>!screen.titleEn||!screen.titleAr||!screen.bodyEn||!screen.bodyAr||
    !Array.isArray(screen.questions)||screen.questions.length!==5||screen.questions.some(item=>!isValidQuestion(item)))||
  TRAFFIC_FINAL_ASSESSMENT.length!==30||
  TRAFFIC_FINAL_ASSESSMENT.some(item=>!isValidQuestion(item))||
  new Set(finalQuestionTexts).size!==30)
  throw new Error('Traffic self-study content validation failed');
module.exports={TRAFFIC_SLUG,TRAFFIC_META,TRAFFIC_SCREENS,TRAFFIC_FINAL_ASSESSMENT};
