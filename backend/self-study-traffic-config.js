// Course-specific Self-Study content. Fire Safety remains in its existing module.
// Traffic content is a separate pilot and does not modify legacy course records.
const TRAFFIC_SLUG='traffic-management-vehicle-control';
const TRAFFIC_META={
  code:'CRS-TRAFFIC-001',
  en:'TRAFFIC MANAGEMENT & VEHICLE CONTROL',
  ar:'إدارة حركة المرور والتحكم في المركبات في الموقع',
  mode:'self-study',freeOpening:true,accessHours:120,durationHours:24,
  activeStudyHours:24,pilotProject:true,masteryScore:80,finalQuestions:30,
  finalPassScore:70,finalRetakes:2,
  modules:[
    {id:'tm1',en:'Fundamentals of Traffic Control',ar:'أساسيات التحكم في حركة المرور'},
    {id:'tm2',en:'Traffic Responsibilities & Gate Duty',ar:'مسؤوليات المرور وواجبات البوابة'},
    {id:'tm3',en:'Parking Lot Management & Traffic Calming',ar:'إدارة المواقف وتهدئة حركة المرور'},
    {id:'tm4',en:'Traffic Hazards, Incidents & Reporting',ar:'مخاطر المرور والحوادث والإبلاغ'},
    {id:'tm5',en:'Hand Signals, Communication & Practice',ar:'إشارات اليد والتواصل والتطبيق العملي'}
  ]
};
const q=(question,answers,correct=0)=>({q:question,a:answers,correct});
const TRAFFIC_SCREENS=[
{id:'tm1s1',slide:1,titleEn:'Introduction to Site Traffic Control',titleAr:'مقدمة في التحكم بحركة المرور بالمواقع الحيوية',bodyEn:'## Learning objectives\n• Explain why traffic control is a core security responsibility.\n• Identify the principal duty areas: intersections, entrances, gates and parking areas.\n• Recognize the importance of professional appearance, visibility, clear communication and personal safety.\n• Describe how this course develops skills in roadway positioning, signals, gate duty, traffic plans and parking management.\n\n## Why traffic control matters\nTraffic control is one of the most visible duties of site security. Officers regularly interact with drivers, pedestrians, visitors and employees. Their conduct affects public confidence and the orderly operation of the site.\n\nA traffic officer supports safe, predictable movement by applying the approved site traffic arrangements. The officer does not replace traffic authorities or improvise instructions outside their authorization.\n\n## Where the officer may be assigned\n• Intersections: support orderly vehicle and pedestrian movement.\n• Entrances and gates: manage approaching traffic and access lanes.\n• Parking areas: guide vehicles to designated spaces and keep circulation routes clear.\n\n## Professional conduct and readiness\nMaintain a clear, calm manner and a professional appearance. Stand where approaching road users can see you, subject to the approved risk assessment and site procedures. Give understandable instructions and avoid unnecessary confrontation.\n\nCheck your personal readiness before duty. Cold, wet weather, fatigue or poor visibility can affect concentration and increase the risk of being struck by a vehicle. Notify the supervisor when conditions make the task unsafe.\n\n## Practical scenario\nA queue forms near a busy site entrance while pedestrians are crossing. Your first action is to protect people and follow the approved traffic arrangements, rather than rushing vehicles through. Coordinate with the gate team and report any unsafe condition.\n\n## Key takeaway\nSafe movement, professional conduct and compliance with the approved site plan take priority over traffic speed.',bodyAr:'## أهداف التعلم\n• توضيح أهمية تنظيم حركة المرور ضمن مسؤوليات الأمن بالموقع.\n• تحديد مواقع العمل الرئيسية: التقاطعات والمداخل والبوابات ومواقف المركبات.\n• التعرف على أهمية المظهر المهني ووضوح الرؤية والتواصل والسلامة الشخصية.\n• التعرف على موضوعات الدورة: التمركز وإشارات المرور وواجبات البوابة وخطط الحركة وإدارة المواقف.\n\n## لماذا يُعد تنظيم المرور مهمة أمنية مهمة؟\nيُعد تنظيم حركة المرور من أكثر مهام الأمن ظهورًا أمام الجمهور؛ إذ يتعامل رجل الأمن بصورة مباشرة مع السائقين والمشاة والزوار والعاملين. ويؤثر سلوكه ومظهره وطريقة تواصله في ثقة الجمهور وانتظام الحركة داخل الموقع.\n\nيساعد رجل الأمن على تنظيم حركة آمنة وواضحة وفق الخطة والإجراءات المعتمدة بالموقع، دون تجاوز الصلاحيات أو إصدار توجيهات مرتجلة تخالف تعليمات الجهات المختصة.\n\n## أين تُنفذ مهام تنظيم المرور؟\n• التقاطعات: المساعدة في تنظيم حركة المركبات وعبور المشاة.\n• المداخل والبوابات: تنظيم المركبات القادمة والحفاظ على انسيابية مسارات الدخول.\n• مواقف السيارات: توجيه المركبات إلى الأماكن المخصصة وإبقاء مسارات الحركة مفتوحة.\n\n## المظهر المهني والاستعداد للعمل\nاحرص على الهدوء والمظهر اللائق والتعليمات الواضحة. اختر موقع تمركز مرئيًا للسائقين وفق تقييم المخاطر وإجراءات الموقع المعتمدة، وتجنب المواجهات غير الضرورية.\n\nتأكد من جاهزيتك الشخصية قبل بدء العمل؛ فالطقس البارد أو الممطر والإرهاق وضعف الرؤية قد تؤثر في التركيز وتزيد خطر الاصطدام بالمركبات. أبلغ المشرف إذا أصبحت ظروف العمل غير آمنة.\n\n## موقف تطبيقي\nتراكمت المركبات أمام مدخل مزدحم أثناء عبور المشاة. الأولوية هي حماية الأشخاص والالتزام بخطة تنظيم المرور المعتمدة، وليس تمرير المركبات بسرعة. نسّق مع فريق البوابة وأبلغ عن أي خطر.\n\n## خلاصة الدرس\nسلامة الأشخاص والسلوك المهني والالتزام بخطة الموقع المعتمدة أهم من سرعة تدفق المركبات.',questions:[
q('What is the first priority in traffic control? / ما الأولوية الأولى في التحكم المروري؟',['Life safety / سلامة الأرواح','Fast vehicle flow / سرعة حركة المركبات','Parking convenience / سهولة الوقوف','Keeping schedules only / الالتزام بالجدول فقط']),
q('What is the purpose of a site traffic plan? / ما هدف خطة المرور بالموقع؟',['Organize safe movement / تنظيم الحركة الآمنة','Replace all signs / استبدال جميع اللافتات','Increase vehicle speed / زيادة سرعة المركبات','Remove pedestrian routes / إلغاء مسارات المشاة']),
q('Which source should guide traffic control? / ما المصدر الذي يوجه التحكم المروري؟',['Approved site procedures / إجراءات الموقع المعتمدة','Personal preference / التفضيل الشخصي','Unverified messages / رسائل غير مؤكدة','Driver pressure / ضغط السائق']),
q('Why should vehicle movement be predictable? / لماذا ينبغي أن تكون حركة المركبات متوقعة؟',['To reduce conflict and collisions / لتقليل التعارض والتصادم','To allow sudden turns / للسماح بالانعطافات المفاجئة','To avoid communication / لتجنب التواصل','To ignore signs / لتجاهل اللافتات']),
q('What should staff do when a control is unclear? / ماذا يفعل الموظف إذا كان الإجراء غير واضح؟',['Pause safely and seek clarification / التوقف بأمان وطلب التوضيح','Guess and continue / التخمين والاستمرار','Wave every vehicle through / السماح للجميع بالمرور','Ignore the risk / تجاهل الخطر'])
]},
{id:'tm1s2',slide:2,titleEn:'Risk Awareness and Safe Speed',titleAr:'الوعي بالمخاطر والسرعة الآمنة',bodyEn:'Traffic risks change with visibility, weather, road surface, congestion and pedestrians. Follow posted speed limits and slow further when conditions require it. The original training material distinguishes the center position, which provides a broad intersection view but exposes an officer to greater danger, from a corner position that can offer better personal protection. Only use an approved, risk-assessed position and wear suitable high-visibility clothing.\n\n## Before taking position\nReview approaching vehicle paths, pedestrian crossing points, lighting, visibility and the location of a safe exit. A central position can improve the view of an intersection but increases exposure to vehicles. A position nearer the side may reduce that exposure. Select only a position approved for the site and its risk assessment.\n\n## Safe operating sequence\n• Observe the traffic pattern before stepping into the work area.\n• Wear approved high-visibility clothing and check communication equipment.\n• Confirm the intended movements with colleagues at adjoining posts.\n• Direct one clear movement at a time and monitor the response.\n• Stop the task and seek assistance if drivers cannot see or understand the direction.\n\n## Workplace scenario\nRain and poor lighting reduce visibility near an entrance. The correct response is to reassess the position, warn colleagues and follow the approved reduced-visibility arrangement, rather than moving into the centre of traffic.\n\n## Key takeaway\nThe safest position is not always the one with the widest view.',bodyAr:'تتغير مخاطر المرور بحسب الرؤية والطقس وحالة الطريق والازدحام والمشاة. التزم بحدود السرعة المعلنة وخفّضها عند الحاجة. تميّز الحقيبة التدريبية الأصلية بين التمركز في وسط التقاطع، الذي يوفر رؤية واسعة لكنه يعرض رجل الأمن لمخاطر أكبر، والتمركز عند زاوية التقاطع الذي قد يوفر حماية شخصية أفضل. يجب اختيار موقع التمركز وفق تقييم المخاطر والإجراءات المعتمدة، مع ارتداء ملابس عالية الوضوح.\n\n## قبل اختيار موقع التمركز\nراجع اتجاهات المركبات ومعابر المشاة والإضاءة ومدى الرؤية ومكان الابتعاد الآمن عن الخطر. قد يوفر وسط التقاطع رؤية أوسع لكنه يزيد التعرض للمركبات. وقد يقلل التمركز قرب الجانب هذا التعرض. اختر موقعًا معتمدًا يتناسب مع تقييم مخاطر الموقع.\n\n## تسلسل العمل الآمن\n• راقب نمط الحركة قبل دخول منطقة العمل.\n• ارتدِ الملابس عالية الوضوح وافحص وسائل الاتصال.\n• نسق اتجاهات الحركة مع الزملاء في النقاط المجاورة.\n• أعطِ توجيهًا واحدًا واضحًا في كل مرة وراقب استجابة السائق.\n• أوقف المهمة واطلب الدعم عند تعذر رؤية الإشارة أو فهمها.\n\n## موقف عملي\nانخفضت الرؤية بسبب المطر وضعف الإضاءة قرب المدخل. الإجراء المناسب هو إعادة تقييم مكان الوقوف وإبلاغ الزملاء وتطبيق ترتيب العمل المعتمد لهذه الظروف، وليس الانتقال إلى وسط الحركة دون تقييم.\n\n## خلاصة الدرس\nالموقع الأكثر وضوحًا ليس بالضرورة الأكثر أمانًا.',questions:[
q('Which condition can increase driving risk? / أي حالة قد تزيد مخاطر القيادة؟',['Poor visibility / ضعف الرؤية','Clear markings / وضوح العلامات','Good lighting / الإضاءة الجيدة','Low pedestrian activity / قلة حركة المشاة']),
q('How should drivers respond to poor visibility? / كيف يستجيب السائق لضعف الرؤية؟',['Slow down and follow site rules / تخفيف السرعة واتباع تعليمات الموقع','Maintain speed regardless / الحفاظ على السرعة مهما حدث','Use a phone torch while driving / استخدام الهاتف أثناء القيادة','Drive close to the vehicle ahead / الاقتراب من المركبة الأمامية']),
q('What should determine speed on site? / ما الذي يحدد السرعة داخل الموقع؟',['Posted limits and current conditions / الحدود المعلنة والظروف الحالية','Urgency alone / الاستعجال فقط','Vehicle size alone / حجم المركبة فقط','Driver confidence / ثقة السائق']),
q('Why is tailgating unsafe? / لماذا تعد متابعة المركبة عن قرب غير آمنة؟',['It reduces stopping distance / تقلل مسافة التوقف المتاحة','It improves visibility / تحسن الرؤية','It prevents all collisions / تمنع كل التصادمات','It is required in queues / مطلوبة في الطوابير']),
q('What is the safe response to a slippery surface? / ما التصرف الآمن عند انزلاق السطح؟',['Reduce speed and avoid sudden actions / تخفيف السرعة وتجنب الحركات المفاجئة','Brake sharply at all times / الضغط المفاجئ على المكابح دائماً','Accelerate through turns / التسارع في المنعطفات','Ignore warning signs / تجاهل التحذيرات'])
]},
{id:'tm2s1',slide:3,titleEn:'Gate Duty, Access Control and Traffic Management Plans',titleAr:'واجبات البوابة وخطط إدارة حركة المرور',bodyEn:'At gate duty, check passes and IDs using approved procedures, keep access lanes clear, and direct vehicles through designated checkpoints. The site Traffic Management Plan (TMP), prepared by authorized site safety and security teams, defines traffic routes, pedestrian separation, signs, and temporary restrictions. Follow the current approved plan and escalate exceptions.\n\n## Managing flow without compromising safety\nThe officer observes congestion, pedestrian movement and nearby junctions. A decision at one gate can create a queue elsewhere, so coordinate with adjoining posts before changing traffic flow.\n\n## Order of priorities\n• Protect people crossing or working near vehicle routes.\n• Keep emergency access routes clear.\n• Avoid allowing queues to obstruct intersections and adjacent entrances.\n• Assist drivers with inquiries only from a safe stopping location.\n• Give extra attention to children, older people and people who need assistance.\n\n## Emergency vehicle scenario\nAn emergency vehicle approaches a busy crossing. Protect pedestrians, notify colleagues and use the approved emergency traffic arrangement. Never direct vehicles into an unverified clear route.\n\n## Key takeaway\nSafe movement is more important than maximum throughput.',bodyAr:'تشمل واجبات البوابة فحص التصاريح والهويات وفق الإجراءات المعتمدة، وإبقاء مسارات الدخول خالية، وتوجيه المركبات إلى نقاط التفتيش المحددة. وتحدد خطة إدارة حركة المرور بالموقع (TMP)، التي تعدها الجهات المختصة بالسلامة والأمن، مسارات المركبات وفصل المشاة واللوحات والقيود المؤقتة. التزم بالخطة المعتمدة وصعّد الحالات الاستثنائية.\n\n## تنظيم التدفق دون المساس بالسلامة\nيراقب رجل الأمن الازدحام وحركة المشاة والتقاطعات المجاورة. وقد يؤدي القرار عند إحدى البوابات إلى طابور عند نقطة أخرى؛ لذلك يجب التنسيق مع نقاط العمل القريبة قبل تغيير حركة المرور.\n\n## ترتيب الأولويات\n• حماية الأشخاص الذين يعبرون مسارات المركبات أو يعملون بالقرب منها.\n• إبقاء مسارات الطوارئ خالية.\n• منع امتداد الطوابير إلى التقاطعات والمداخل المجاورة.\n• تقديم الإرشادات المطولة للسائقين من مكان توقف آمن.\n• مراعاة الأطفال وكبار السن ومن يحتاجون إلى المساعدة.\n\n## موقف مركبة طوارئ\nتقترب مركبة طوارئ من معبر مزدحم. احمِ المشاة وأبلغ الزملاء وطبق ترتيبات الطوارئ المعتمدة. لا توجه المركبات إلى مسار لم تتأكد من خلوه.\n\n## خلاصة الدرس\nسلامة الحركة أهم من تمرير أكبر عدد من المركبات.',questions:[
q('What should be checked before controlled entry? / ما الذي يجب التحقق منه قبل الدخول المنظم؟',['Vehicle authorization / تصريح المركبة','Driver preference / رغبة السائق','Vehicle colour only / لون المركبة فقط','Arrival time only / وقت الوصول فقط']),
q('Where should vehicles be directed? / إلى أين يجب توجيه المركبات؟',['Approved lanes and stop points / المسارات ونقاط التوقف المعتمدة','Any open space / أي مساحة مفتوحة','Pedestrian walkways / ممرات المشاة','Emergency access lanes / مسارات الطوارئ']),
q('What is tailgating at an access point? / ما المقصود بالدخول خلف مركبة أخرى دون تحقق؟',['An unauthorized vehicle following through / دخول مركبة غير مصرح بها خلف أخرى','A vehicle parking correctly / وقوف المركبة بشكل صحيح','A routine inspection / فحص روتيني','A marked pedestrian crossing / ممر مشاة محدد']),
q('What should happen if authorization cannot be confirmed? / ماذا يحدث إذا تعذر تأكيد التصريح؟',['Hold safely and verify through procedure / إيقاف المركبة بأمان والتحقق وفق الإجراء','Allow entry to avoid delay / السماح بالدخول لتجنب التأخير','Remove the barrier / إزالة الحاجز','Ask another driver to decide / ترك القرار لسائق آخر']),
q('Who may authorize an exception? / من يمكنه اعتماد استثناء؟',['An authorized person under site procedure / شخص مخول وفق إجراءات الموقع','Any waiting driver / أي سائق منتظر','A visitor / زائر','Nobody needs to approve / لا حاجة للموافقة'])
]},
{id:'tm2s2',slide:4,titleEn:'Vehicle Movement, Driver Induction and Noncompliance',titleAr:'حركة المركبات وتوعية السائقين والمخالفات',bodyEn:'Vehicle movement must follow the approved Traffic Management Plan, including designated routes, checkpoints and pedestrian separation. Driver induction explains site routes, speed restrictions, parking and emergency access. If a driver does not comply, avoid confrontation, use the authorized escalation procedure and record the facts. Never stand in a vehicle blind spot or between moving vehicles.\n\n## Two responsibilities at every gate\nGate staff must verify permission to enter while maintaining a safe vehicle approach. Position inspection and waiting points so that drivers do not stop unpredictably in an active lane.\n\n## Reading the site traffic plan\nA practical plan identifies vehicle categories, permitted routes, restricted areas, entry times, parking allocations, pedestrian separation and escalation contacts. Check the current approved version before giving directions.\n\n## Step-by-step gate process\n• Observe the approaching vehicle and identify the designated lane.\n• Guide the driver to the approved verification point.\n• Verify credentials under site procedures and resolve exceptions through the supervisor.\n• Release the vehicle only when its onward route is clear.\n• Record and report unusual delays, unsafe manoeuvres and access exceptions.\n\n## Workplace scenario\nA large delivery vehicle arrives at the visitor entrance. Hold it at a safe designated point and coordinate its authorized route; do not send it through an unsuitable pedestrian area.\n\n## Key takeaway\nEffective access control combines authorization, safe routing and communication.',bodyAr:'يجب أن تتبع حركة المركبات خطة إدارة المرور المعتمدة، بما يشمل المسارات المحددة ونقاط التحكم وفصل المشاة. وتوضح التوعية الأولية للسائقين مسارات الموقع وحدود السرعة والمواقف ومداخل الطوارئ. عند عدم التزام السائق، تجنب المواجهة واتبع إجراءات التصعيد المعتمدة وسجل الوقائع. ولا تقف في النقاط العمياء للمركبات أو بين المركبات المتحركة.\n\n## مسؤوليتان عند كل بوابة\nيتحقق فريق البوابة من صلاحية الدخول مع المحافظة على اقتراب المركبات بأمان. يجب أن تكون نقاط الفحص والانتظار محددة حتى لا تتوقف المركبات بصورة مفاجئة داخل مسار نشط.\n\n## قراءة خطة المرور بالموقع\nتحدد الخطة العملية فئات المركبات والمسارات المسموح بها والمناطق المقيدة وأوقات الدخول وتوزيع المواقف وفصل المشاة وجهات التصعيد. راجع النسخة المعتمدة قبل إصدار التوجيهات.\n\n## خطوات العمل عند البوابة\n• راقب المركبة القادمة وحدد مسارها المخصص.\n• وجه السائق إلى نقطة التحقق المعتمدة.\n• تحقق من التصاريح وفق إجراءات الموقع وارفع الحالات الاستثنائية للمشرف.\n• اسمح بمرور المركبة بعد التأكد من خلو مسارها التالي.\n• سجل وأبلغ عن التأخير غير المعتاد والمناورات الخطرة واستثناءات الدخول.\n\n## موقف عملي\nوصلت شاحنة توريد كبيرة إلى مدخل الزوار. أوقفها في نقطة آمنة مخصصة ونسق المسار المصرح لها؛ ولا توجهها عبر منطقة مشاة غير مناسبة.\n\n## خلاصة الدرس\nيجمع ضبط الدخول الفعال بين التصريح والمسار الآمن والتواصل.',questions:[
q('Who should conduct a vehicle inspection? / من الذي ينبغي أن يجري فحص المركبة؟',['Authorized and trained personnel / أفراد مخولون ومدربون','Any nearby visitor / أي زائر قريب','Another driver / سائق آخر','Untrained bystanders / أشخاص غير مدربين']),
q('Where should staff avoid standing? / أين يجب تجنب الوقوف؟',['Blind spots and unsafe gaps / النقاط العمياء والفجوات غير الآمنة','Marked safe area / منطقة آمنة محددة','Approved inspection point / نقطة الفحص المعتمدة','Protected walkway / ممر محمي']),
q('What should happen before an inspection starts? / ماذا يجب أن يحدث قبل بدء الفحص؟',['Ensure the vehicle is safely positioned / التأكد من تموضع المركبة بأمان','Stand behind it immediately / الوقوف خلفها فوراً','Ignore nearby traffic / تجاهل حركة المرور','Ask the driver to move without direction / طلب الحركة دون توجيه']),
q('Why should inspection procedures be followed? / لماذا يجب اتباع إجراءات الفحص؟',['To maintain safety and consistency / للحفاظ على السلامة والاتساق','To avoid records / لتجنب السجلات','To speed up at any cost / التسريع بأي ثمن','To skip authorization / لتجاوز التصريح']),
q('What is the safe response to an unsafe position? / ما التصرف الآمن عند وجود موقع غير آمن؟',['Stop and move to a safe position / التوقف والانتقال إلى موقع آمن','Continue to save time / الاستمرار لتوفير الوقت','Stand closer to traffic / الاقتراب من حركة المرور','Ignore the concern / تجاهل الخطر'])
]},
{id:'tm3s1',slide:5,titleEn:'Traffic Separation and Traffic Calming',titleAr:'فصل حركة المرور ووسائل تهدئة السرعة',bodyEn:'Separate pedestrians from vehicle routes using approved walkways, barriers and marked crossings. The original course describes traffic calming by visual markings, raised crossings, speed tables and horizontal deflection. These measures can lower vehicle speeds but may affect emergency access, drainage or heavy vehicles. Their design and placement require competent site approval.\n\n## Designing an orderly parking operation\nParking areas combine arriving vehicles, reversing movements and pedestrians. Identify entry and exit routes, designated bays, accessible paths and emergency access. Keep vehicle routes distinct from walking routes wherever the site plan provides separation.\n\n## How technology supports the officer\n• Barriers and access credentials regulate entry.\n• Tickets or recorded entry times can support authorized duration checks.\n• Bay sensors and occupancy signs guide drivers toward available spaces.\n• Lighting and monitoring systems help identify defects or unusual activity.\nThese tools support professional observation; they do not replace it.\n\n## Routine inspection\nLook for obstructed emergency lanes, damaged signs, unsafe reversing, poor lighting and unauthorized use of restricted spaces. Record the location and report issues through the approved channel.\n\n## Practice\nA parked vehicle blocks the emergency lane. Protect the route and request authorized action rather than attempting an unsafe removal.\n\n## Key takeaway\nA well-managed parking area protects people, routes and access.',bodyAr:'افصل مسارات المشاة عن المركبات باستخدام الممرات والحواجز والمعابر المحددة والمعتمدة. وتشرح الحقيبة الأصلية تهدئة المرور بالعلامات المرئية والمعابر المرتفعة ومطبات السرعة العريضة والانحرافات الأفقية. وقد تخفض هذه الوسائل السرعة، لكنها قد تؤثر في وصول الطوارئ أو تصريف المياه أو حركة المركبات الثقيلة، لذا يتطلب تصميمها واعتمادها جهة مختصة.\n\n## تنظيم المواقف بصورة آمنة\nتجمع المواقف بين المركبات القادمة وحركة الرجوع للخلف والمشاة. حدد مسارات الدخول والخروج والأماكن المخصصة ومسارات الوصول ومسارات الطوارئ. حافظ على الفصل بين المركبات والمشاة حيثما تنص خطة الموقع على ذلك.\n\n## دور التقنيات في دعم رجل الأمن\n• تنظم الحواجز وتصاريح الدخول حركة المركبات.\n• تساعد التذاكر أو أوقات الدخول المسجلة على متابعة المدة المصرح بها.\n• توجه حساسات الإشغال واللوحات السائقين إلى الأماكن المتاحة.\n• تساعد الإضاءة وأنظمة المراقبة في كشف الأعطال والأنشطة غير المعتادة.\nهذه الوسائل تدعم المراقبة المهنية ولا تحل محلها.\n\n## الفحص الدوري\nابحث عن مسارات الطوارئ المغلقة واللوحات التالفة والرجوع غير الآمن وضعف الإضاءة واستخدام الأماكن المقيدة دون تصريح. سجل الموقع وأبلغ عبر القناة المعتمدة.\n\n## تطبيق عملي\nأغلقت مركبة متوقفة مسار الطوارئ. احمِ المسار واطلب الإجراء المصرح به بدلًا من محاولة إزالة المركبة بطريقة خطرة.\n\n## خلاصة\nالمواقف المنظمة تحمي الأشخاص والمسارات وإمكانية الوصول.',questions:[
q('What is a good way to reduce pedestrian risk? / ما الطريقة الجيدة لتقليل مخاطر المشاة؟',['Separate pedestrian and vehicle routes / فصل مسارات المشاة عن المركبات','Mix both flows / خلط المسارين','Block marked crossings / إغلاق المعابر المحددة','Remove warning signs / إزالة التحذيرات']),
q('What should a crossing be? / كيف ينبغي أن يكون معبر المشاة؟',['Visible and unobstructed / واضحاً وخالياً من العوائق','Used for storage / مستخدماً للتخزين','Hidden behind parked vehicles / مخفياً خلف المركبات','Blocked during busy periods / مغلقاً وقت الازدحام']),
q('Where should pedestrians not be directed? / إلى أين لا ينبغي توجيه المشاة؟',['Into a live vehicle path / إلى مسار مركبات نشط','To a marked safe crossing / إلى معبر آمن محدد','To a protected walkway / إلى ممر محمي','To an assembly point / إلى نقطة تجمع']),
q('What should a controller do near a busy crossing? / ماذا يفعل مراقب المرور قرب معبر مزدحم؟',['Follow site controls and maintain clear sightlines / اتباع ضوابط الموقع والحفاظ على وضوح الرؤية','Look away while directing / صرف النظر أثناء التوجيه','Allow reversing without checking / السماح بالرجوع دون تحقق','Stand in the traffic lane / الوقوف في مسار المرور']),
q('Why must walkways remain clear? / لماذا يجب إبقاء الممرات خالية؟',['To support safe and accessible movement / لدعم الحركة الآمنة وسهولة المرور','To create extra parking / لإنشاء مواقف إضافية','To hide signs / لإخفاء اللافتات','To store equipment / لتخزين المعدات'])
]},
{id:'tm3s2',slide:6,titleEn:'Parking Management and Smart Technologies',titleAr:'إدارة المواقف والتقنيات الذكية',bodyEn:'Designated parking and loading zones require clear markings, safe pedestrian routes, and managed access. The original course describes automated barriers, access tickets, vehicle counting and occupancy displays to reduce congestion. Reversing near pedestrians is a high-risk movement; use approved controls and trained spotters where required. Security stand-off distances must be set by qualified site risk assessment.\n\n## Purpose of traffic calming\nTraffic calming reduces vehicle speed and conflict in locations where people walk or vehicles turn, park and queue. Typical measures include visible speed signs, marked crossings, speed humps, raised crossings and managed lane widths.\n\n## Evaluate the entire route\nA device that slows traffic at one point may create a queue at another. Observe approach speed, pedestrian visibility, turning space and whether vehicles bypass the measure. Report concerns for a site review rather than changing the layout yourself.\n\n## Workplace scenario\nDrivers accelerate between a parking exit and a pedestrian crossing. Record the pattern, identify the location and request an assessment of signs, crossing visibility and existing speed controls.\n\n## Good practice\n• Keep traffic calming signs and devices visible.\n• Never place improvised obstacles in a live lane.\n• Coordinate temporary changes through the authorized site team.\n• Monitor whether the measures protect pedestrians without blocking emergency access.\n\n## Key takeaway\nTraffic calming works best when design, monitoring and communication reinforce one another.',bodyAr:'تحتاج مناطق المواقف والتحميل إلى علامات واضحة ومسارات مشاة آمنة ودخول منظم. وتشرح الحقيبة الأصلية الحواجز الآلية وتذاكر الدخول وعدّ المركبات ولوحات الإشغال للحد من الازدحام. وتعد حركة الرجوع للخلف قرب المشاة عالية الخطورة، لذا تُستخدم الضوابط المعتمدة والموجّهون المدربون عند الحاجة. وتحدد مسافات الفصل الأمني وفق تقييم مخاطر متخصص بالموقع.\n\n## الغرض من تهدئة حركة المرور\nتساعد وسائل تهدئة المرور على خفض السرعة وتقليل التعارض في المناطق التي يعبرها المشاة أو تنعطف فيها المركبات أو تتوقف. ومن أمثلتها لوحات السرعة الواضحة والمعابر المحددة والمطبات والمعابر المرتفعة وتنظيم عرض المسارات.\n\n## تقييم المسار بالكامل\nقد تقلل وسيلة معينة السرعة عند نقطة لكنها تتسبب في طابور عند نقطة أخرى. راقب سرعة الاقتراب ووضوح المشاة ومساحة الانعطاف ومحاولات تجاوز وسيلة التهدئة. ارفع الملاحظات للمراجعة بدلًا من تغيير تصميم الطريق بنفسك.\n\n## موقف عملي\nتزيد بعض المركبات سرعتها بين مخرج الموقف ومعبر مشاة. سجل النمط والموقع واطلب تقييم اللوحات ووضوح المعبر ووسائل التحكم بالسرعة.\n\n## الممارسات الجيدة\n• حافظ على وضوح اللوحات ووسائل التهدئة.\n• لا تضع عوائق مرتجلة في مسار نشط.\n• نسق التغييرات المؤقتة مع الفريق المخول.\n• راقب أثر الوسائل على المشاة ومسارات الطوارئ.\n\n## خلاصة\nتنجح تهدئة المرور بتكامل التصميم والمراقبة والتواصل.',questions:[
q('Where should vehicles park? / أين يجب أن تقف المركبات؟',['In designated parking areas / في مناطق الوقوف المحددة','Across pedestrian routes / عبر مسارات المشاة','In emergency lanes / في مسارات الطوارئ','Wherever convenient / حيثما كان مناسباً']),
q('Why is reversing risky? / لماذا يعد الرجوع للخلف محفوفاً بالمخاطر؟',['Visibility may be limited / قد تكون الرؤية محدودة','It always increases visibility / يزيد الرؤية دائماً','It removes blind spots / يلغي النقاط العمياء','It needs no attention / لا يحتاج إلى انتباه']),
q('When should a driver stop reversing? / متى يجب على السائق التوقف عن الرجوع؟',['When the path is not safely visible / عندما لا يكون المسار مرئياً بأمان','When the route is clear / عندما يكون المسار واضحاً','When authorized guidance is available / عندما يتوفر توجيه معتمد','After checking all hazards / بعد التحقق من جميع المخاطر']),
q('What should loading areas have? / ماذا ينبغي أن يتوفر في مناطق التحميل؟',['Clear controls and separation from pedestrians / ضوابط واضحة وفصل عن المشاة','Unmarked vehicle routes / مسارات غير محددة','Blocked emergency access / وصول طوارئ مغلق','Uncontrolled reversing / رجوع غير مسيطر عليه']),
q('What is the role of a spotter when required? / ما دور الموجّه عند الحاجة؟',['Give agreed signals from a safe position / إعطاء إشارات متفق عليها من موقع آمن','Stand behind the moving vehicle / الوقوف خلف المركبة المتحركة','Use unclear gestures / استخدام إشارات غير واضحة','Distract the driver / تشتيت السائق'])
]},
{id:'tm4s1',slide:7,titleEn:'Emergency Vehicles and Traffic Incident Safety',titleAr:'مركبات الطوارئ والسلامة عند الحوادث المرورية',bodyEn:'Emergency vehicle movement takes priority according to applicable road rules and the approved site emergency plan. Keep emergency routes unobstructed, alert the control room and coordinate with authorized responders. At an incident, protect life first, raise the alarm and isolate hazards only when safe. Do not enter active traffic or give unapproved directions to emergency drivers.\n\n## Identify the hazard before directing movement\nVehicle blind spots, reversing manoeuvres, poor lighting, wet surfaces and mixed pedestrian routes can quickly turn routine traffic duty into a serious incident. Larger vehicles need more turning space and may hide pedestrians from the driver\'s view.\n\n## A simple risk-control sequence\n1. Observe the area and identify who may be harmed.\n2. Keep yourself and others outside the vehicle\'s likely path.\n3. Apply approved separation or temporary traffic holds.\n4. Coordinate with the designated vehicle guide or supervisor.\n5. Reassess the situation before allowing movement to resume.\n\n## Practical scenario\nA delivery truck begins reversing near a pedestrian walkway. Never stand directly behind it. Protect the walkway and use the approved vehicle-guiding arrangement.\n\n## Key takeaway\nAnticipating conflict is more effective than reacting after a collision.',bodyAr:'تُعطى حركة مركبات الطوارئ الأولوية وفق الأنظمة المرورية وخطة الطوارئ المعتمدة بالموقع. أبق مسارات الطوارئ مفتوحة، وأبلغ غرفة التحكم ونسّق مع المستجيبين المخولين. عند وقوع حادث، أعط الأولوية لحماية الأرواح وأطلق البلاغ واعزل المخاطر عندما يكون ذلك آمنًا. لا تدخل مسارات المرور النشطة ولا تصدر توجيهات غير مخولة لسائقي الطوارئ.\n\n## التعرف على الخطر قبل توجيه الحركة\nقد تحول النقاط العمياء للمركبات وحركة الرجوع للخلف وضعف الإضاءة والأسطح المبتلة واختلاط مسارات المشاة والمركبات مهمة المرور المعتادة إلى حادث خطير. تحتاج المركبات الكبيرة إلى مساحة انعطاف أوسع وقد تحجب رؤية المشاة عن السائق.\n\n## خطوات مبسطة للتحكم بالمخاطر\n1. راقب المنطقة وحدد الأشخاص المعرضين للخطر.\n2. أبعد نفسك والآخرين عن المسار المتوقع للمركبة.\n3. طبق الفصل أو الإيقاف المؤقت للحركة وفق الإجراءات المعتمدة.\n4. نسق مع موجه المركبة أو المشرف المكلف.\n5. أعد تقييم الوضع قبل استئناف الحركة.\n\n## موقف عملي\nبدأت شاحنة توريد الرجوع قرب ممر مشاة. لا تقف خلفها مباشرة. احمِ الممر واتبع ترتيب توجيه المركبات المعتمد.\n\n## خلاصة\nاستباق التعارض أكثر فاعلية من الاستجابة بعد التصادم.',questions:[
q('What comes first at a traffic incident? / ما الأولوية الأولى عند حادث مروري؟',['Protect life and make the area safe / حماية الأرواح وتأمين المنطقة','Move vehicles before checking people / تحريك المركبات قبل فحص الأشخاص','Take photographs / التقاط الصور','Resume normal flow immediately / استئناف الحركة فوراً']),
q('What should staff avoid at an unsafe scene? / ما الذي ينبغي تجنبه في موقع غير آمن؟',['Entering or exposing themselves to traffic / الدخول أو التعرض لحركة المرور','Raising an alarm / إطلاق التنبيه','Following emergency procedures / اتباع إجراءات الطوارئ','Requesting trained responders / طلب المستجيبين المدربين']),
q('Why keep emergency access clear? / لماذا يجب إبقاء وصول الطوارئ خالياً؟',['To allow responders to reach the scene / لتمكين فرق الاستجابة من الوصول','To reserve space for parking / لتخصيص موقف','To delay response / لتأخير الاستجابة','To store equipment / لتخزين المعدات']),
q('What should be done if someone is injured? / ماذا ينبغي فعله إذا أصيب شخص؟',['Call the appropriate emergency response and follow training / طلب الاستجابة المناسبة واتباع التدريب','Move them without assessing danger / تحريكه دون تقييم الخطر','Ignore them until traffic clears / تجاهله حتى تخف الحركة','Ask untrained people to treat serious injuries / تكليف غير المدربين بعلاج إصابات خطيرة']),
q('What guides the response to an incident? / ما الذي يوجه الاستجابة للحادث؟',['The site emergency plan and trained roles / خطة الطوارئ وأدوار المدربين','Rumours / الشائعات','Personal guesses / التخمين الشخصي','Social media posts / منشورات التواصل'])
]},
{id:'tm4s2',slide:8,titleEn:'Traffic Violations, SCRIM and Objective Reporting',titleAr:'المخالفات المرورية والتوثيق الموضوعي وفق SCRIM',bodyEn:'The original course covers reporting traffic violations using the SCRIM framework. Follow the exact reporting format required by your organization; do not invent details or make unsupported accusations. Record the time, place, observed conduct, vehicle identification where permitted, witnesses, immediate hazards and actions taken. Preserve evidence according to policy and escalate urgent risks promptly.\n\n## First response to a traffic incident\nProtect life and avoid creating a second incident. Do not enter moving traffic without an approved safe arrangement. Notify the control room, request emergency assistance where required, and establish a safe boundary according to the site response plan.\n\n## Reporting what happened\nRecord the time and exact location, vehicles involved, direction of movement, visible hazards, actions taken and people notified. Separate direct observation from statements made by drivers or witnesses. Avoid assigning blame or speculating about causes.\n\n## Practical scenario\nTwo vehicles collide near an entry lane and a queue begins to form. Protect the area, alert the response team, coordinate authorized diversion and keep factual notes.\n\n## Key takeaway\nSafe response prevents further harm; accurate reporting supports learning and corrective action.',bodyAr:'تتناول الحقيبة الأصلية الإبلاغ عن المخالفات المرورية وفق إطار SCRIM. اتبع نموذج الإبلاغ المعتمد لدى الجهة، ولا تضف تفاصيل غير مؤكدة أو اتهامات بلا دليل. سجل الوقت والمكان والسلوك المشاهد وبيانات المركبة حيث يسمح النظام والشهود والمخاطر الفورية والإجراءات المتخذة. احفظ الأدلة وفق السياسة المعتمدة وصعّد المخاطر العاجلة فورًا.\n\n## الاستجابة الأولى للحوادث المرورية\nاحمِ الأرواح وتجنب التسبب في حادث ثانٍ. لا تدخل مسار حركة نشطًا دون ترتيب آمن معتمد. أبلغ غرفة التحكم واطلب المساعدة الطارئة عند الحاجة وحدد منطقة آمنة وفق خطة الاستجابة بالموقع.\n\n## كتابة تقرير واقعي\nسجل الوقت والمكان الدقيق والمركبات المعنية واتجاهات الحركة والمخاطر المرئية والإجراءات المتخذة والأشخاص الذين تم إبلاغهم. ميز بين مشاهداتك المباشرة وأقوال السائقين والشهود. تجنب تحديد المسؤولية أو التخمين بشأن الأسباب.\n\n## موقف عملي\nاصطدمت مركبتان قرب مسار الدخول وبدأ طابور في التكون. احمِ المنطقة وأبلغ فريق الاستجابة ونسق تحويل الحركة المصرح به واحتفظ بملاحظات دقيقة.\n\n## خلاصة\nالاستجابة الآمنة تمنع الضرر الإضافي والتقرير الدقيق يدعم التعلم والتحسين.',questions:[
q('What should an incident report contain? / ماذا يجب أن يتضمن تقرير الحادث؟',['Objective facts and actions taken / حقائق موضوعية وإجراءات متخذة','Rumours and assumptions / شائعات وافتراضات','Personal blame / اتهامات شخصية','Unverified online comments / تعليقات غير مؤكدة عبر الإنترنت']),
q('When should an incident be reported? / متى ينبغي الإبلاغ عن الحادث؟',['Promptly through approved channels / سريعاً عبر القنوات المعتمدة','Only at the end of the month / في نهاية الشهر فقط','Only if a manager asks later / فقط إذا طلب المدير لاحقاً','Never if there is no photograph / لا يُبلغ عنه إذا لم توجد صورة']),
q('Which detail is objective? / أي معلومة تعد موضوعية؟',['Observed time and location / الوقت والموقع الملحوظان','A guess about intent / تخمين النية','A rumour about the driver / شائعة عن السائق','An unsupported accusation / اتهام بلا دليل']),
q('Who may receive incident information? / من يمكنه استلام معلومات الحادث؟',['Authorized recipients / الجهات المخولة','Anyone who asks / كل من يسأل','Social media followers / متابعو التواصل','Other drivers without a need / سائقون لا حاجة لديهم للمعلومة']),
q('Why avoid speculation in reports? / لماذا يجب تجنب التكهن في التقارير؟',['To keep records accurate and fair / للحفاظ على دقة السجلات وعدالتها','To make reports longer / لإطالة التقارير','To assign blame quickly / لإلقاء اللوم بسرعة','To avoid verification / لتجنب التحقق'])
]},
{id:'tm5s1',slide:9,titleEn:'Hand Signals, Whistle Codes and Clear Communication',titleAr:'إشارات اليد والصافرة والتواصل الواضح',bodyEn:'The original training covers decisive, visible hand signals for stopping, proceeding, turning and reversing, plus whistle use to gain attention. Signals must be standardized by the competent local authority and site procedures; do not assume a gesture or whistle pattern is universal. Maintain a safe position, high visibility, and clear eye contact when appropriate, and never override official traffic signals without authorization.\n\n## Communicating with hand signals\nSignals must be visible, unambiguous and consistent across the team. Typical instructions include stop, proceed, turn, reverse, clear the area and emergency stop. Use only signals approved by the site and practise them before directing live traffic.\n\n## Before any signal\n• Confirm that pedestrians and obstacles are clear of the intended route.\n• Stand in a safe visible position and establish the driver\'s attention.\n• Give one direction at a time and allow the driver time to respond.\n• Stop the movement if the driver appears uncertain or cannot see the signal.\n\n## Equipment readiness\nDepending on the duty assessment, check high-visibility clothing, whistle, torch, traffic wand and radio. Coordinate with other officers to avoid contradictory directions.\n\n## Practice\nA driver misinterprets your hand movement. Hold traffic safely, repeat the approved instruction and seek assistance instead of continuing a confusing manoeuvre.\n\n## Key takeaway\nClarity and control matter more than speed.',bodyAr:'تغطي الحقيبة الأصلية إشارات اليد الواضحة والحاسمة للتوقف والتحرك والانعطاف والرجوع للخلف، واستخدام الصافرة لجذب الانتباه. يجب أن تتوافق الإشارات مع تعليمات الجهة المختصة وإجراءات الموقع؛ فلا يُفترض أن أي حركة أو نمط صافرة معتمد عالميًا. حافظ على موقع آمن ووضوح بصري وتواصل مناسب مع السائق، ولا تتجاوز الإشارات المرورية الرسمية دون تصريح.\n\n## التواصل بإشارات اليد\nيجب أن تكون الإشارات واضحة ومرئية وموحدة بين أفراد الفريق. وتشمل التوجيهات المعتادة الوقوف والتقدم والانعطاف والرجوع وإخلاء المنطقة والتوقف الطارئ. استخدم الإشارات المعتمدة بالموقع وتدرب عليها قبل تنظيم حركة فعلية.\n\n## قبل إعطاء أي إشارة\n• تأكد من خلو المسار المقصود من المشاة والعوائق.\n• تمركز في موقع آمن وواضح واجذب انتباه السائق.\n• أعطِ توجيهًا واحدًا في كل مرة واترك وقتًا للاستجابة.\n• أوقف الحركة إذا بدا السائق مترددًا أو لم يستطع رؤية الإشارة.\n\n## جاهزية المعدات\nافحص السترة عالية الوضوح والصفارة والمصباح وعصا المرور وجهاز الاتصال وفق متطلبات المهمة. نسق مع الزملاء لتجنب الإشارات المتعارضة.\n\n## تطبيق عملي\nأساء سائق فهم حركة يدك. أوقف الحركة بأمان وكرر التوجيه المعتمد واطلب الدعم بدلًا من الاستمرار في مناورة غير واضحة.\n\n## خلاصة\nالوضوح والسيطرة أهم من السرعة.',questions:[
q('What makes a traffic instruction effective? / ما الذي يجعل توجيه المرور فعالاً؟',['Clear, short and unambiguous wording / كلمات واضحة ومختصرة وغير ملتبسة','Long unclear gestures / إشارات طويلة وغير واضحة','Conflicting instructions / تعليمات متعارضة','Shouting from an unsafe position / الصراخ من موقع غير آمن']),
q('What should happen after an important direction? / ماذا ينبغي بعد إعطاء توجيه مهم؟',['Confirm it was understood / التأكد من فهمه','Assume it was understood / افتراض أنه فُهم','Change it without warning / تغييره دون تنبيه','Ignore driver response / تجاهل استجابة السائق']),
q('Which signals should staff use? / ما الإشارات التي ينبغي استخدامها؟',['Approved and agreed signals / الإشارات المعتمدة والمتفق عليها','Invented gestures / إشارات مرتجلة','Signals hidden from drivers / إشارات مخفية عن السائقين','Different signals at once / إشارات مختلفة في الوقت نفسه']),
q('Where should a controller stand? / أين ينبغي أن يقف مراقب المرور؟',['In a designated safe position / في موقع آمن محدد','In the vehicle path / في مسار المركبة','Behind a reversing vehicle / خلف مركبة ترجع للخلف','Where visibility is blocked / حيث تكون الرؤية محجوبة']),
q('What should staff do if communication fails? / ماذا يفعل الموظف إذا فشل الاتصال؟',['Pause movement safely and restore clear communication / إيقاف الحركة بأمان واستعادة الاتصال الواضح','Continue by guessing / الاستمرار بالتخمين','Wave all vehicles through / السماح لجميع المركبات بالمرور','Ignore the failed signal / تجاهل فشل الإشارة'])
]},
{id:'tm5s2',slide:10,titleEn:'Traffic Direction Exercise and Shift Handover',titleAr:'التطبيق العملي لتوجيه المرور وتسليم المناوبة',bodyEn:'The original training concludes with a practical traffic direction exercise, an evaluation quiz and a course summary. Practise stopping, starting and turning movements only in a controlled training area under an authorized instructor, using site-approved signals. At shift handover, report temporary restrictions, traffic hazards, equipment faults, incidents and outstanding actions so the next team can continue safe control.\n\n## Integrating the full duty cycle\nProfessional traffic control follows a repeatable sequence: prepare, observe, communicate, direct, monitor and report. Before starting, review the current traffic plan, check equipment, identify pedestrian routes and confirm radio communication.\n\n## Integrated workplace exercise\nA visitor vehicle approaches a busy gate while a delivery truck requires a different route. Protect the pedestrian crossing, direct each driver to the designated verification point and coordinate the separate route with the gate team. Do not release either vehicle until the route is confirmed clear.\n\n## Your final self-check\n• Do I understand the permitted routes and restrictions?\n• Can approaching drivers see me clearly?\n• Are pedestrians protected before vehicles move?\n• Have colleagues confirmed the intended direction?\n• Do I know when to stop and escalate a risk?\n\n## Course conclusion\nConsistent procedures, sound judgement and respectful communication make site traffic safer for everyone.',bodyAr:'تختتم الحقيبة الأصلية بتطبيق عملي لتوجيه المرور واختبار تقييمي وملخص للدورة. تدرب على إشارات الإيقاف والتحريك والانعطاف داخل منطقة تدريب مسيطر عليها وتحت إشراف مدرب مخول، وباستخدام الإشارات المعتمدة بالموقع. وعند تسليم المناوبة، انقل معلومات القيود المؤقتة والمخاطر وأعطال المعدات والحوادث والإجراءات المعلقة لضمان استمرار تنظيم الحركة بأمان.\n\n## دمج مهارات العمل في مهمة واحدة\nتتبع الإدارة المهنية للمرور تسلسلًا متكررًا: الاستعداد والمراقبة والتواصل والتوجيه والمتابعة والإبلاغ. قبل البدء، راجع خطة الحركة الحالية وافحص المعدات وحدد مسارات المشاة وتأكد من الاتصال اللاسلكي.\n\n## تمرين عملي متكامل\nاقتربت مركبة زائر من بوابة مزدحمة بينما تحتاج شاحنة توريد إلى مسار آخر. احمِ معبر المشاة ووجه كل سائق إلى نقطة التحقق المخصصة ونسق المسار المنفصل مع فريق البوابة. لا تسمح بمرور أي مركبة قبل التأكد من خلو مسارها.\n\n## مراجعتك الذاتية الأخيرة\n• هل أفهم المسارات والقيود المعتمدة؟\n• هل يراني السائقون القادمون بوضوح؟\n• هل المشاة محميون قبل تحريك المركبات؟\n• هل أكد الزملاء اتجاه الحركة المقصود؟\n• هل أعرف متى أوقف المهمة وأصعّد الخطر؟\n\n## خاتمة الدورة\nتجعل الإجراءات المنضبطة والحكم السليم والتواصل المحترم حركة المرور أكثر أمانًا للجميع.',questions:[
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
