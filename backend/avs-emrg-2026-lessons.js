'use strict';

/**
 * AVS-EMRG-2026 learner lesson draft.
 * This is general awareness content, not an airport operating procedure.
 * A qualified airport-emergency SME must review it against the current approved
 * airport emergency plan and applicable local requirements before release.
 */
const LESSONS = Object.freeze([
  { order: 1, titleEn: 'Workshop introduction', titleAr: 'مقدمة الورشة',
    objectivesEn: ['Explain the purpose of airport emergency preparedness.', 'Recognize that safe response depends on trained teams, clear roles and approved plans.'],
    objectivesAr: ['شرح هدف الاستعداد للطوارئ في المطارات.', 'إدراك أن الاستجابة الآمنة تعتمد على فرق مدربة وأدوار واضحة وخطط معتمدة.'],
    contentEn: ['Airport emergencies may affect people, aircraft, buildings and airport services.', 'Preparedness includes planning, training, communication, equipment checks and learning after exercises or events.', 'This workshop supports awareness and does not replace local procedures or role-specific training.'],
    contentAr: ['قد تؤثر طوارئ المطارات في الأشخاص والطائرات والمباني وخدمات المطار.', 'يشمل الاستعداد التخطيط والتدريب والاتصال وفحص المعدات والتعلم بعد التمارين أو الأحداث.', 'تدعم هذه الورشة الوعي ولا تحل محل الإجراءات المحلية أو التدريب الخاص بكل دور.'] },
  { order: 2, titleEn: 'Objectives & initial check', titleAr: 'الأهداف والتقييم المبدئي',
    objectivesEn: ['Identify the main learning goals.', 'Use the initial check to identify topics that may need more attention.'],
    objectivesAr: ['تحديد أهداف التعلم الرئيسية.', 'استخدام التقييم المبدئي لتحديد الموضوعات التي قد تحتاج إلى مزيد من الاهتمام.'],
    contentEn: ['The workshop covers hazard awareness, risk thinking, communication, evacuation, responder safety and review.', 'The initial diagnostic is for learning guidance only. It is not a pass/fail test and does not affect the certificate.', 'Ask the course owner or instructor to clarify any term or topic that is unfamiliar.'],
    contentAr: ['تتناول الورشة الوعي بالمخاطر والتفكير في المخاطر والاتصالات والإخلاء وسلامة فرق الاستجابة والمراجعة.', 'التقييم المبدئي للتوجيه التعليمي فقط، وليس اختبار نجاح أو رسوب ولا يؤثر في الشهادة.', 'اطلب من مسؤول الدورة أو المدرب توضيح أي مصطلح أو موضوع غير مألوف.'] },
  { order: 3, titleEn: 'The airport as an emergency system', titleAr: 'المطار كمنظومة للطوارئ',
    objectivesEn: ['Recognize the connected parts of an airport response.', 'Explain why coordination between teams matters.'],
    objectivesAr: ['التعرف على الأجزاء المترابطة في الاستجابة داخل المطار.', 'شرح أهمية التنسيق بين الفرق.'],
    contentEn: ['An airport includes airside and landside areas, terminals, service roads, utilities, operators and response agencies.', 'A disruption in one area can affect other services. Information should be shared through approved communication channels.', 'Roles, command arrangements and escalation routes must follow the current airport emergency plan.'],
    contentAr: ['يشمل المطار مناطق جوية وأرضية وصالات وطرق خدمة ومرافق ومشغلين وجهات استجابة.', 'قد يؤثر التعطل في منطقة واحدة على خدمات أخرى. يجب مشاركة المعلومات عبر قنوات الاتصال المعتمدة.', 'يجب أن تتبع الأدوار وترتيبات القيادة ومسارات التصعيد خطة الطوارئ الحالية للمطار.'] },
  { order: 4, titleEn: 'Recognize airport hazards', titleAr: 'التعرّف على مخاطر المطارات',
    objectivesEn: ['Identify common categories of hazards.', 'Report hazards through the approved process.'],
    objectivesAr: ['تحديد فئات المخاطر الشائعة.', 'الإبلاغ عن المخاطر عبر الإجراء المعتمد.'],
    contentEn: ['Hazards may include fire and smoke, vehicle movement, spills, weather, damaged equipment, crowd pressure, suspicious items and communication failure.', 'Notice the location, time, visible conditions and people who may be at risk, without entering an unsafe area.', 'Do not touch suspicious items or take action outside your training. Follow the local reporting and isolation procedure.'],
    contentAr: ['قد تشمل المخاطر الحريق والدخان وحركة المركبات والانسكابات والطقس وتلف المعدات وضغط الحشود والأجسام المشتبه بها وتعطل الاتصالات.', 'لاحظ الموقع والوقت والظروف الظاهرة والأشخاص المعرضين للخطر دون دخول منطقة غير آمنة.', 'لا تلمس الأجسام المشتبه بها ولا تتصرف خارج نطاق تدريبك. اتبع إجراء الإبلاغ والعزل المحلي.'] },
  { order: 5, titleEn: 'Risk matrix & Bowtie analysis', titleAr: 'مصفوفة المخاطر وتحليل Bowtie',
    objectivesEn: ['Distinguish a hazard from a risk.', 'Describe how preventive and recovery controls reduce risk.'],
    objectivesAr: ['التمييز بين مصدر الخطر والمخاطر الناتجة عنه.', 'شرح دور الضوابط الوقائية وضوابط الاستجابة في تقليل المخاطر.'],
    contentEn: ['A hazard is something with the potential to cause harm. Risk considers how likely harm is and how serious it could be.', 'A risk matrix helps teams compare risks consistently; use the organization’s approved matrix and definitions.', 'Bowtie analysis links a hazard to a top event, possible consequences, preventive controls and recovery controls. Record assumptions and review control effectiveness.'],
    contentAr: ['مصدر الخطر هو ما يمكن أن يسبب ضررًا. وتراعي المخاطر احتمال وقوع الضرر وشدته.', 'تساعد مصفوفة المخاطر الفرق على المقارنة بصورة متسقة؛ استخدم المصفوفة والتعريفات المعتمدة لدى المؤسسة.', 'يربط تحليل Bowtie بين مصدر الخطر والحدث الرئيسي والعواقب المحتملة والضوابط الوقائية وضوابط التعافي. وثّق الافتراضات وراجع فعالية الضوابط.'] },
  { order: 6, titleEn: 'Alarm, communication & command', titleAr: 'الإنذار والاتصالات والقيادة',
    objectivesEn: ['Explain why clear and timely messages matter.', 'Follow assigned command and reporting lines.'],
    objectivesAr: ['شرح أهمية الرسائل الواضحة وفي الوقت المناسب.', 'اتباع خطوط القيادة والإبلاغ المحددة.'],
    contentEn: ['Use only approved alert methods and communication channels. Share facts, location, time, observed hazards and immediate needs.', 'Keep messages brief, calm and clear. Confirm critical information when the local procedure requires it.', 'Do not issue unauthorized instructions or public statements. Follow the designated incident command structure.'],
    contentAr: ['استخدم وسائل التنبيه وقنوات الاتصال المعتمدة فقط. شارك الحقائق والموقع والوقت والمخاطر الملحوظة والاحتياجات العاجلة.', 'اجعل الرسائل موجزة وهادئة وواضحة، وأكّد المعلومات المهمة عندما يتطلب الإجراء المحلي ذلك.', 'لا تصدر تعليمات أو تصريحات عامة دون صلاحية. اتبع هيكل قيادة الحادث المحدد.'] },
  { order: 7, titleEn: 'Evacuation & crowd management', titleAr: 'الإخلاء وإدارة الحشود',
    objectivesEn: ['Recognize factors that affect safe movement of people.', 'Understand that evacuation decisions follow the site plan and incident command.'],
    objectivesAr: ['التعرف على العوامل المؤثرة في حركة الأشخاص بأمان.', 'فهم أن قرارات الإخلاء تتبع خطة الموقع وقيادة الحادث.'],
    contentEn: ['People may need clear information, accessible routes and support for mobility, sensory or language needs.', 'Avoid creating conflicting instructions or directing people toward an unverified route.', 'Only authorized personnel should decide and direct evacuation under the current site plan. Keep access for emergency responders clear.'],
    contentAr: ['قد يحتاج الأشخاص إلى معلومات واضحة ومسارات مناسبة ودعم لاحتياجات الحركة أو الحواس أو اللغة.', 'تجنب إصدار تعليمات متعارضة أو توجيه الأشخاص إلى مسار لم يتم التحقق منه.', 'يقرر الإخلاء ويوجهه الأشخاص المخولون وفق خطة الموقع الحالية. حافظ على خلو مسارات فرق الطوارئ.'] },
  { order: 8, titleEn: 'Aircraft fire & APU scenario', titleAr: 'سيناريو حريق الطائرة ووحدة الطاقة المساعدة',
    objectivesEn: ['Recognize why aircraft fire events need specialist response.', 'Know the limits of a general security or awareness role.'],
    objectivesAr: ['إدراك سبب احتياج حوادث حريق الطائرات إلى استجابة متخصصة.', 'معرفة حدود الدور الأمني العام أو دور التوعية.'],
    contentEn: ['Smoke, flame, unusual heat or reports of fire near an aircraft require immediate reporting through the airport emergency channel.', 'Aircraft and ground equipment hazards can change quickly. Keep clear of danger areas and follow instructions from trained responders.', 'Firefighting, aircraft approach, isolation distances and equipment use must follow airport-specific procedures and specialist training. This lesson is not an operational checklist.'],
    contentAr: ['يتطلب الدخان أو اللهب أو الحرارة غير المعتادة أو البلاغ عن حريق قرب طائرة الإبلاغ الفوري عبر قناة طوارئ المطار.', 'قد تتغير مخاطر الطائرات والمعدات الأرضية بسرعة. ابتعد عن مناطق الخطر واتبع تعليمات فرق الاستجابة المدربة.', 'يجب أن تتبع مكافحة الحريق والاقتراب من الطائرة ومسافات العزل واستخدام المعدات إجراءات المطار والتدريب المتخصص. هذا الدرس ليس قائمة تشغيلية.'] },
  { order: 9, titleEn: 'Natural disasters & continuity', titleAr: 'الكوارث الطبيعية واستمرارية الأعمال',
    objectivesEn: ['Identify how severe weather or infrastructure failure can affect airport services.', 'Understand the role of continuity plans.'],
    objectivesAr: ['تحديد تأثير الطقس الشديد أو تعطل البنية التحتية على خدمات المطار.', 'فهم دور خطط استمرارية الأعمال.'],
    contentEn: ['Flooding, high winds, extreme heat, earthquakes or utility failure may affect people, facilities, access and service availability.', 'Use official alerts and the airport’s approved escalation process. Do not rely on assumptions or unverified reports.', 'Continuity plans identify critical functions, alternative arrangements, responsible roles and conditions for safe restart.'],
    contentAr: ['قد تؤثر الفيضانات والرياح الشديدة والحرارة القصوى والزلازل أو تعطل المرافق على الأشخاص والمنشآت والوصول وتوافر الخدمات.', 'استخدم التنبيهات الرسمية ومسار التصعيد المعتمد بالمطار، ولا تعتمد على افتراضات أو بلاغات غير مؤكدة.', 'تحدد خطط الاستمرارية الوظائف الحيوية والبدائل والأدوار المسؤولة وشروط استئناف العمل بأمان.'] },
  { order: 10, titleEn: 'Suspicious objects & security threats', titleAr: 'الأجسام المشتبه بها والتهديدات الأمنية',
    objectivesEn: ['Recognize the need for safe reporting of suspicious items or threats.', 'Avoid actions that could increase danger.'],
    objectivesAr: ['إدراك أهمية الإبلاغ الآمن عن الأجسام أو التهديدات المشتبه بها.', 'تجنب التصرفات التي قد تزيد الخطر.'],
    contentEn: ['Do not touch, move, open or use a device near a suspicious item. Keep a safe distance and notify the designated authority through approved channels.', 'Share only observed facts and follow instructions from authorized responders.', 'Threat assessment, search, cordon size and clearance decisions belong to trained and authorized specialists under local procedures.'],
    contentAr: ['لا تلمس الجسم المشتبه به أو تحركه أو تفتحه، ولا تستخدم جهازًا بالقرب منه. ابتعد بمسافة آمنة وأبلغ الجهة المحددة عبر القنوات المعتمدة.', 'شارك الحقائق التي شاهدتها فقط واتبع تعليمات فرق الاستجابة المخولة.', 'يختص المتخصصون المدربون والمخولون بتقييم التهديد والتفتيش وتحديد نطاق العزل وقرار الإخلاء من الخطر وفق الإجراءات المحلية.'] },
  { order: 11, titleEn: 'Occupational safety for responders', titleAr: 'السلامة المهنية لفرق الاستجابة',
    objectivesEn: ['Recognize common responder safety risks.', 'Use training, protective equipment and stop-work reporting appropriately.'],
    objectivesAr: ['التعرف على مخاطر السلامة الشائعة لفرق الاستجابة.', 'استخدام التدريب ومعدات الوقاية والإبلاغ عن إيقاف العمل بالشكل المناسب.'],
    contentEn: ['Risks may include traffic, smoke, heat, electricity, hazardous materials, fatigue, noise and stress.', 'Use personal protective equipment suitable for the assigned task and only when trained to use it.', 'Report unsafe conditions, maintain awareness of changing surroundings and follow the designated supervisor. Never enter an unsafe area to perform a task beyond your competence.'],
    contentAr: ['قد تشمل المخاطر حركة المرور والدخان والحرارة والكهرباء والمواد الخطرة والإرهاق والضوضاء والضغط النفسي.', 'استخدم معدات الوقاية المناسبة للمهمة المحددة، وفقط إذا كنت مدربًا على استخدامها.', 'أبلغ عن الظروف غير الآمنة وراقب تغيرات المحيط واتبع المشرف المحدد. لا تدخل منطقة غير آمنة لتنفيذ مهمة تتجاوز كفاءتك.'] },
  { order: 12, titleEn: 'Practical tabletop: airport emergency', titleAr: 'تمرين مكتبي: طوارئ في المطار',
    objectivesEn: ['Apply structured discussion to a hypothetical scenario.', 'Identify information gaps, roles and coordination needs.'],
    objectivesAr: ['تطبيق النقاش المنظم على سيناريو افتراضي.', 'تحديد فجوات المعلومات والأدوار واحتياجات التنسيق.'],
    contentEn: ['In a tabletop exercise, participants discuss what they would do using their current plans; no real emergency action is carried out.', 'Ask: What is known? What is not known? Who must be notified? Which approved plan applies? What support or resources may be needed?', 'Record decisions, assumptions, communication gaps and improvement actions. Do not treat a classroom scenario as authorization to act outside your role.'],
    contentAr: ['في التمرين المكتبي يناقش المشاركون ما سيفعلونه بالاستناد إلى خططهم الحالية، دون تنفيذ استجابة طوارئ حقيقية.', 'اسأل: ما المعلومات المؤكدة؟ ما غير المعروف؟ من يجب إبلاغه؟ ما الخطة المعتمدة التي تنطبق؟ ما الدعم أو الموارد المطلوبة؟', 'سجل القرارات والافتراضات وفجوات الاتصال وإجراءات التحسين. لا تعتبر سيناريو التدريب تصريحًا بالتصرف خارج دورك.'] },
  { order: 13, titleEn: 'Review decisions & debrief', titleAr: 'مراجعة القرارات واستخلاص الدروس',
    objectivesEn: ['Review actions against the approved plan and exercise goals.', 'Turn findings into clear improvement actions.'],
    objectivesAr: ['مراجعة الإجراءات مقارنة بالخطة المعتمدة وأهداف التمرين.', 'تحويل النتائج إلى إجراءات تحسين واضحة.'],
    contentEn: ['A debrief should focus on facts, decisions, communication, coordination and the effect of controls.', 'Identify what worked, what did not work, why it happened and what evidence supports the finding.', 'Assign each improvement action to an owner with a due date and a way to confirm completion. Share lessons through approved channels.'],
    contentAr: ['تركز المراجعة اللاحقة على الحقائق والقرارات والاتصال والتنسيق وأثر الضوابط.', 'حدد ما نجح وما لم ينجح ولماذا، وما الأدلة التي تدعم النتيجة.', 'خصص لكل إجراء تحسين مسؤولًا وموعدًا وطريقة للتحقق من الإنجاز. شارك الدروس عبر القنوات المعتمدة.'] },
  { order: 14, titleEn: 'Online assessment guidance', titleAr: 'إرشادات التقييم الإلكتروني',
    objectivesEn: ['Understand the assessment sequence and pass requirements.', 'Submit answers independently and check progress.'],
    objectivesAr: ['فهم تسلسل التقييم ومتطلبات الاجتياز.', 'إرسال الإجابات بشكل مستقل ومتابعة التقدم.'],
    contentEn: ['Each formative check contains five questions. A score of at least four correct answers is required to unlock the next check.', 'After all 15 checks are passed, the final assessment contains 30 randomized questions. At least 22 correct answers are required to pass, with up to three attempts.', 'The initial diagnostic is not graded for completion. Your progress is saved on the server. Keep your private access link secure.'],
    contentAr: ['يتكون كل اختبار مرحلي من خمسة أسئلة، ويلزم الإجابة الصحيحة عن أربعة أسئلة على الأقل لفتح الاختبار التالي.', 'بعد اجتياز الاختبارات الخمسة عشر، يتكون التقييم النهائي من 30 سؤالًا بترتيب عشوائي. يلزم الإجابة الصحيحة عن 22 سؤالًا على الأقل، مع إتاحة ثلاث محاولات كحد أقصى.', 'لا يُشترط اجتياز التقييم المبدئي لإكمال الورشة. يُحفظ تقدمك على الخادم. حافظ على سرية رابط الدخول.'] },
  { order: 15, titleEn: 'Close, assessment & feedback', titleAr: 'الختام والتقييم والملاحظات',
    objectivesEn: ['Summarize the main learning themes.', 'Provide feedback to improve future learning.'],
    objectivesAr: ['تلخيص موضوعات التعلم الرئيسية.', 'تقديم ملاحظات لتحسين التعلم مستقبلًا.'],
    contentEn: ['Safe airport emergency response depends on preparation, clear communication, trained people, approved plans and learning from experience.', 'Complete the required formative checks and final assessment. Certificate eligibility depends on the server-verified completion rules.', 'The post-workshop feedback survey is approved and will be available when the workshop is released. Follow the current approved airport plan in real operations.'],
    contentAr: ['تعتمد الاستجابة الآمنة لطوارئ المطارات على الاستعداد والاتصال الواضح والأشخاص المدربين والخطط المعتمدة والتعلم من الخبرة.', 'أكمل الاختبارات المرحلية والتقييم النهائي المطلوبين. وتعتمد أهلية الشهادة على قواعد الإكمال التي يتحقق منها الخادم.', 'تم اعتماد استبيان ما بعد الورشة، وسيكون متاحًا عند إصدار الورشة. اتبع خطة المطار المعتمدة الحالية في العمليات الفعلية.'] }
]);

// Short applied scenarios turn each lesson into a practical learning activity.
// These are awareness exercises, not operational instructions; local approved plans always take priority.
const LEARNING_ACTIVITIES = Object.freeze({
  1: {
    scenarioEn: 'A colleague reports smoke near a service area but cannot confirm the source.',
    scenarioAr: 'أبلغك زميل بوجود دخان قرب منطقة خدمات، لكنه لا يستطيع تأكيد مصدره.',
    reflectionEn: 'What facts should be reported, and why should you avoid investigating beyond your training?',
    reflectionAr: 'ما الحقائق التي ينبغي الإبلاغ عنها، ولماذا يجب تجنب التحقيق خارج نطاق تدريبك؟',
    takeawayEn: 'Report observations promptly through approved channels; do not guess or enter danger.',
    takeawayAr: 'أبلغ عن الملاحظات سريعًا عبر القنوات المعتمدة، ولا تخمّن أو تدخل منطقة خطر.'
  },
  2: {
    scenarioEn: 'A learner scores poorly on the initial diagnostic but is motivated to improve.',
    scenarioAr: 'حصل متدرب على درجة منخفضة في التقييم المبدئي لكنه يرغب في التحسن.',
    reflectionEn: 'How can the learner use the result without treating it as a pass/fail decision?',
    reflectionAr: 'كيف يستفيد المتدرب من النتيجة دون اعتبارها قرار نجاح أو رسوب؟',
    takeawayEn: 'Use diagnostic results to focus study; progress is built through lesson review and practice.',
    takeawayAr: 'استخدم نتيجة التقييم لتحديد ما يحتاج إلى مراجعة؛ فالتقدم يتحقق بدراسة الدروس والممارسة.'
  },
  3: {
    scenarioEn: 'A disruption in one airport area may affect terminal access and service roads.',
    scenarioAr: 'قد يؤثر تعطل في إحدى مناطق المطار على الوصول إلى الصالة وطرق الخدمات.',
    reflectionEn: 'Why should information be shared across the approved coordination structure?',
    reflectionAr: 'لماذا يجب مشاركة المعلومات عبر هيكل التنسيق المعتمد؟',
    takeawayEn: 'Airport response is interconnected; share verified information with the right teams.',
    takeawayAr: 'الاستجابة في المطار مترابطة؛ شارك المعلومات المؤكدة مع الفرق المعنية.'
  },
  4: {
    scenarioEn: 'You notice a spill and damaged equipment on a route used by staff.',
    scenarioAr: 'لاحظت انسكابًا ومعدة تالفة على مسار يستخدمه الموظفون.',
    reflectionEn: 'What observations can you safely report without entering or touching the hazard?',
    reflectionAr: 'ما الملاحظات التي يمكنك الإبلاغ عنها بأمان دون دخول منطقة الخطر أو لمس مصدره؟',
    takeawayEn: 'Observe from a safe position, report the location and facts, and follow site procedures.',
    takeawayAr: 'راقب من مكان آمن، وأبلغ عن الموقع والوقائع، واتبع إجراءات الموقع.'
  },
  5: {
    scenarioEn: 'Two hazards are identified, but the team has limited time to review them.',
    scenarioAr: 'تم تحديد مصدرَي خطر، لكن وقت الفريق المتاح لمراجعتهما محدود.',
    reflectionEn: 'How do likelihood, severity and existing controls help compare the risks?',
    reflectionAr: 'كيف يساعد احتمال الحدوث وشدة العواقب والضوابط الحالية في مقارنة المخاطر؟',
    takeawayEn: 'Use the approved risk matrix consistently and review whether controls work in practice.',
    takeawayAr: 'استخدم مصفوفة المخاطر المعتمدة بصورة متسقة، وراجع فعالية الضوابط عمليًا.'
  },
  6: {
    scenarioEn: 'Two teams receive different reports about the same event.',
    scenarioAr: 'تلقت فرقتان بلاغين مختلفين عن الحدث نفسه.',
    reflectionEn: 'How can a clear, factual message reduce confusion and support command decisions?',
    reflectionAr: 'كيف تقلل الرسالة الواضحة المبنية على الوقائع الالتباس وتدعم قرارات القيادة؟',
    takeawayEn: 'Use approved channels, identify what is known and unknown, and follow the command structure.',
    takeawayAr: 'استخدم القنوات المعتمدة، وميّز بين المعلوم وغير المؤكد، واتبع هيكل القيادة.'
  },
  7: {
    scenarioEn: 'A usual pedestrian route may be unsafe, and people are asking where to go.',
    scenarioAr: 'قد يصبح مسار المشاة المعتاد غير آمن، ويسأل الأشخاص عن الاتجاه الذي ينبغي اتباعه.',
    reflectionEn: 'Who is authorized to direct movement, and what must be checked before communicating a route?',
    reflectionAr: 'من المخول بتوجيه الحركة، وما الذي يجب التحقق منه قبل إعلان مسار؟',
    takeawayEn: 'Do not invent routes or issue conflicting orders; follow authorized direction and accessibility needs.',
    takeawayAr: 'لا تخترع مسارات أو تصدر تعليمات متعارضة؛ اتبع التوجيه المخول وراعِ احتياجات الوصول.'
  },
  8: {
    scenarioEn: 'Smoke is reported near an aircraft and ground equipment is operating nearby.',
    scenarioAr: 'ورد بلاغ عن دخان قرب طائرة مع وجود معدات أرضية تعمل بالقرب منها.',
    reflectionEn: 'What is the safe boundary of a general awareness role while specialist responders are contacted?',
    reflectionAr: 'ما حدود الدور التوعوي العام الآمن أثناء إبلاغ فرق الاستجابة المتخصصة؟',
    takeawayEn: 'Raise the alarm, keep clear of danger, and leave specialist actions to trained responders.',
    takeawayAr: 'أطلق البلاغ عبر القناة المعتمدة، وابتعد عن الخطر، واترك الإجراءات المتخصصة للمستجيبين المدربين.'
  },
  9: {
    scenarioEn: 'Severe weather disrupts access to a facility and affects a critical service.',
    scenarioAr: 'أدى طقس شديد إلى تعطيل الوصول إلى منشأة والتأثير على خدمة حيوية.',
    reflectionEn: 'Which approved alerts, escalation routes and continuity arrangements should guide decisions?',
    reflectionAr: 'ما التنبيهات ومسارات التصعيد وترتيبات الاستمرارية المعتمدة التي ينبغي أن توجه القرارات؟',
    takeawayEn: 'Use official information and continuity plans; restart services only under approved conditions.',
    takeawayAr: 'استخدم المعلومات الرسمية وخطط الاستمرارية، ولا تستأنف الخدمات إلا وفق الشروط المعتمدة.'
  },
  10: {
    scenarioEn: 'An unattended item is found in a public area and its owner is unknown.',
    scenarioAr: 'عُثر على غرض متروك في منطقة عامة ولا يُعرف صاحبه.',
    reflectionEn: 'How should the observation be reported while avoiding actions that could increase risk?',
    reflectionAr: 'كيف ينبغي الإبلاغ عن الملاحظة مع تجنب أي تصرف قد يزيد الخطر؟',
    takeawayEn: 'Do not touch or investigate the item; report it and follow the approved security procedure.',
    takeawayAr: 'لا تلمس الغرض ولا تتحقق منه بنفسك؛ أبلغ عنه واتبع الإجراء الأمني المعتمد.'
  },
  11: {
    scenarioEn: 'A responder feels pressure to enter an area without suitable equipment or authorization.',
    scenarioAr: 'يشعر أحد المستجيبين بضغط لدخول منطقة دون معدات مناسبة أو تفويض.',
    reflectionEn: 'What should the responder consider about competence, protective equipment and stop-work authority?',
    reflectionAr: 'ما الذي ينبغي مراعاته بشأن الكفاءة ومعدات الوقاية وصلاحية إيقاف العمل غير الآمن؟',
    takeawayEn: 'Do not exceed training or authorization; report unsafe conditions and use required protection.',
    takeawayAr: 'لا تتجاوز التدريب أو التفويض؛ أبلغ عن الظروف غير الآمنة واستخدم وسائل الوقاية المطلوبة.'
  },
  12: {
    scenarioEn: 'In a tabletop exercise, a report arrives while a key contact is unavailable.',
    scenarioAr: 'في تمرين مكتبي، يصل بلاغ بينما جهة اتصال رئيسية غير متاحة.',
    reflectionEn: 'How can the team record assumptions, use approved alternatives and identify a decision owner?',
    reflectionAr: 'كيف يوثق الفريق الافتراضات ويستخدم البدائل المعتمدة ويحدد صاحب القرار؟',
    takeawayEn: 'Practise coordination and decision logging; do not treat an exercise as authorization for real actions.',
    takeawayAr: 'تدرّب على التنسيق وتوثيق القرارات؛ فالتمرين لا يمنح صلاحية لتنفيذ إجراءات فعلية.'
  },
  13: {
    scenarioEn: 'After an exercise, the team disagrees about whether communication worked well.',
    scenarioAr: 'بعد تمرين، اختلف الفريق حول مدى نجاح الاتصال.',
    reflectionEn: 'What evidence can help identify strengths, gaps and actions for improvement?',
    reflectionAr: 'ما الأدلة التي تساعد على تحديد نقاط القوة والفجوات وإجراءات التحسين؟',
    takeawayEn: 'Review facts without blame, assign each action an owner and due date, then verify completion.',
    takeawayAr: 'راجع الوقائع دون لوم، وحدد مسؤولًا وموعدًا لكل إجراء، ثم تحقق من الإنجاز.'
  },
  14: {
    scenarioEn: 'A learner submits a check but the progress counter does not appear to change.',
    scenarioAr: 'أرسل متدرب إجابات الاختبار لكن عداد التقدم لا يبدو أنه تغير.',
    reflectionEn: 'What should the learner check before retrying, and why must saved results remain authoritative?',
    reflectionAr: 'ما الذي ينبغي التحقق منه قبل إعادة المحاولة، ولماذا يجب اعتماد النتائج المحفوظة؟',
    takeawayEn: 'Check the result message and saved progress; do not repeatedly submit if the system reports an error.',
    takeawayAr: 'تحقق من رسالة النتيجة والتقدم المحفوظ، ولا تكرر الإرسال بلا داعٍ إذا أبلغ النظام عن خطأ.'
  },
  15: {
    scenarioEn: 'The workshop is complete and the learner wants to apply the learning at work.',
    scenarioAr: 'أكمل المتدرب الورشة ويرغب في تطبيق ما تعلمه في العمل.',
    reflectionEn: 'How can the learner transfer the key lessons while respecting local procedures and role limits?',
    reflectionAr: 'كيف ينقل المتدرب الدروس الأساسية إلى العمل مع احترام الإجراءات المحلية وحدود دوره؟',
    takeawayEn: 'Keep learning, share feedback and follow the current approved airport plan in real operations.',
    takeawayAr: 'واصل التعلم وشارك ملاحظاتك واتبع خطة المطار المعتمدة الحالية في العمليات الفعلية.'
  }
});

function getLesson(order) {
  if (!Number.isInteger(order) || order < 1 || order > LESSONS.length) return null;
  const lesson = LESSONS[order - 1];
  return {
    order: lesson.order,
    titleEn: lesson.titleEn,
    titleAr: lesson.titleAr,
    objectivesEn: lesson.objectivesEn,
    objectivesAr: lesson.objectivesAr,
    contentEn: lesson.contentEn,
    contentAr: lesson.contentAr,
    ...LEARNING_ACTIVITIES[lesson.order],
    reviewStatus: 'draft-needs-subject-matter-review'
  };
}
module.exports = { LESSONS, getLesson };
