'use strict';

/**
 * AVS-EMRG-2026 formative bank draft: 15 checks x 5 questions.
 * Bilingual draft for SME review; isolated and NOT connected to learner routes.
 * Correct answers remain server-side. Use the shared assessment engine to
 * create/persist a per-learner snapshot and grade against that exact snapshot.
 */
const { assertQuestionBank, FORMATIVE_QUESTION_COUNT, FORMATIVE_PASS_MIN_CORRECT,
  createAttemptSnapshot, buildPublicQuiz, gradeAttempt } = require('./avs-emrg-2026-assessment');

const raw = [
  // Screen 1 — introduction and responsibilities
  ['01-01','What should a staff member do first after noticing an emergency? / ماذا ينبغي للموظف أن يفعل أولًا عند ملاحظة حالة طوارئ؟','Follow the approved reporting procedure and raise the alarm / اتباع إجراء الإبلاغ المعتمد وإطلاق الإنذار',['Ignore it until confirmed by others / تجاهلها حتى يؤكدها الآخرون','Post details on social media / نشر التفاصيل على وسائل التواصل','Move people without informing anyone / نقل الأشخاص دون إبلاغ أحد']],
  ['01-02','Which source should guide operational actions at an airport? / ما المصدر الذي ينبغي أن يوجّه الإجراءات التشغيلية في المطار؟','The current approved airport emergency plan / خطة طوارئ المطار المعتمدة والسارية',['A personal preference / التفضيل الشخصي','An old unofficial message / رسالة قديمة غير رسمية','A plan from a different airport / خطة مطار آخر']],
  ['01-03','Why must emergency roles be clear before an incident? / لماذا يجب أن تكون أدوار الطوارئ واضحة قبل وقوع الحادث؟','To support coordinated and timely action / لدعم الاستجابة المنسقة وفي الوقت المناسب',['To remove the need for communication / لإلغاء الحاجة إلى التواصل','To let everyone issue separate orders / للسماح لكل شخص بإصدار أوامر منفصلة','To avoid recording actions / لتجنب تسجيل الإجراءات']],
  ['01-04','What is the safest way to share incident information? / ما الطريقة الأكثر أمانًا لمشاركة معلومات الحادث؟','Use approved channels and report verified facts / استخدام القنوات المعتمدة والإبلاغ عن الحقائق المؤكدة',['Share unverified names publicly / نشر أسماء غير مؤكدة علنًا','Send sensitive details to all contacts / إرسال التفاصيل الحساسة إلى جميع جهات الاتصال','Wait until the end of the shift / الانتظار حتى نهاية الوردية']],
  ['01-05','What should a learner do if an instruction is unclear? / ماذا يفعل المتدرب إذا لم يكن التوجيه واضحًا؟','Ask the responsible supervisor for clarification / طلب التوضيح من المشرف المسؤول',['Guess and continue / التخمين والاستمرار','Ask passengers to decide / مطالبة المسافرين باتخاذ القرار','Ignore the instruction / تجاهل التوجيه']],
  // Screen 2 — diagnostic and objectives
  ['02-01','What is the main purpose of a diagnostic assessment? / ما الغرض الأساسي من التقييم المبدئي؟','Identify current knowledge and learning needs / تحديد المعرفة الحالية واحتياجات التعلم',['Issue a completion certificate / إصدار شهادة إتمام','Replace practical training / استبدال التدريب العملي','Rank learners publicly / ترتيب المتدربين علنًا']],
  ['02-02','Which is a useful learning objective? / أي مما يلي يُعد هدفًا تعليميًا مفيدًا؟','Describe how to report an airport hazard / وصف كيفية الإبلاغ عن خطر في المطار',['Know everything about emergencies / معرفة كل شيء عن الطوارئ','Become perfect immediately / الوصول إلى الكمال فورًا','Never need guidance / عدم الحاجة إلى التوجيه مطلقًا']],
  ['02-03','Why should learners know the workshop objectives? / لماذا ينبغي أن يعرف المتدربون أهداف الورشة؟','They can focus on the expected skills / يمكنهم التركيز على المهارات المطلوبة',['It removes all assessments / يلغي جميع التقييمات','It guarantees there will be no incidents / يضمن عدم وقوع حوادث','It replaces airport procedures / يستبدل إجراءات المطار']],
  ['02-04','A low diagnostic score should usually lead to what? / إلى ماذا ينبغي أن تؤدي عادةً نتيجة التقييم المبدئي المنخفضة؟','More attention to learning needs during training / مزيد من الاهتمام باحتياجات التعلم أثناء التدريب',['Automatic removal from the workshop / الاستبعاد التلقائي من الورشة','A public warning / إنذار علني','An automatic certificate / شهادة تلقائية']],
  ['02-05','What is the purpose of a knowledge check after a section? / ما الغرض من اختبار المعرفة بعد القسم؟','Confirm understanding before moving forward / التأكد من الفهم قبل الانتقال إلى القسم التالي',['Replace the emergency plan / استبدال خطة الطوارئ','Collect personal opinions only / جمع الآراء الشخصية فقط','Measure typing speed / قياس سرعة الكتابة']],
  // Screen 3 — airport as a system
  ['03-01','Why can an incident in one airport area affect other areas? / لماذا قد يؤثر حادث في منطقة من المطار على مناطق أخرى؟','Airport operations and services are connected / لأن عمليات المطار وخدماته مترابطة',['Every area is fully independent / لأن كل منطقة مستقلة تمامًا','Only passengers are connected / لأن المسافرين وحدهم مترابطون','Communication is never needed / لأن التواصل غير مطلوب مطلقًا']],
  ['03-02','Which group may need coordination during a major incident? / أي مجموعة قد تحتاج إلى التنسيق أثناء حادث كبير؟','Relevant airport teams and emergency services / فرق المطار المعنية وخدمات الطوارئ',['Only the person who first noticed it / الشخص الذي لاحظه أولًا فقط','Only the media / وسائل الإعلام فقط','Unassigned visitors / الزوار غير المكلفين']],
  ['03-03','What helps maintain safe airport operations during disruption? / ما الذي يساعد على استمرار العمليات الآمنة في المطار أثناء التعطل؟','A coordinated response and clear priorities / استجابة منسقة وأولويات واضحة',['Independent actions without updates / إجراءات منفصلة دون تحديثات','Unverified public instructions / تعليمات عامة غير مؤكدة','Delaying every decision / تأخير كل قرار']],
  ['03-04','Why should teams understand their limits of authority? / لماذا ينبغي للفرق فهم حدود صلاحياتها؟','To act within their role and escalate when needed / للعمل ضمن أدوارها والتصعيد عند الحاجة',['To avoid reporting incidents / لتجنب الإبلاغ عن الحوادث','To take over every other role / لتولي جميع الأدوار الأخرى','To cancel coordination / لإلغاء التنسيق']],
  ['03-05','What should happen when two teams receive conflicting instructions? / ماذا ينبغي أن يحدث عند تلقي فريقين تعليمات متعارضة؟','Clarify through the designated command structure / التوضيح عبر هيكل القيادة المحدد',['Both teams act without discussion / يعمل الفريقان دون نقاش','Choose the newest social post / اختيار أحدث منشور اجتماعي','Stop all reporting / إيقاف جميع البلاغات']],
  // Screen 4 — hazards
  ['04-01','Which is an example of an airport hazard? / أي مما يلي مثال على خطر في المطار؟','A fuel spill in an operational area / انسكاب وقود في منطقة تشغيلية',['A completed training record / سجل تدريب مكتمل','A scheduled team briefing / إحاطة مجدولة للفريق','A clean, clear exit / مخرج نظيف وخالٍ من العوائق']],
  ['04-02','What should be done after spotting a hazard? / ماذا ينبغي فعله بعد ملاحظة خطر؟','Keep a safe distance and report it promptly / الحفاظ على مسافة آمنة والإبلاغ عنه سريعًا',['Touch it to identify it / لمسه للتعرف عليه','Wait for another shift / الانتظار حتى الوردية التالية','Move it without authority / نقله دون صلاحية']],
  ['04-03','Why is a near miss worth reporting? / لماذا يستحق الحادث الوشيك الإبلاغ عنه؟','It can reveal risks before serious harm occurs / قد يكشف مخاطر قبل وقوع ضرر جسيم',['It is never relevant to safety / لا علاقة له بالسلامة مطلقًا','It proves procedures are unnecessary / يثبت عدم الحاجة إلى الإجراءات','It should only be discussed informally / ينبغي مناقشته بشكل غير رسمي فقط']],
  ['04-04','Which detail is most useful in a hazard report? / أي تفصيل هو الأكثر فائدة في بلاغ الخطر؟','Location, time, observed condition and immediate risk / الموقع والوقت والحالة الملحوظة والخطر المباشر',['Rumours about who caused it / شائعات حول المتسبب','Personal opinions without facts / آراء شخصية دون حقائق','Unrelated passenger details / تفاصيل غير مرتبطة عن المسافرين']],
  ['04-05','When should a person approach an unknown hazardous substance? / متى ينبغي للشخص الاقتراب من مادة خطرة مجهولة؟','Only when trained, authorized and protected under procedure / فقط إذا كان مدربًا ومصرحًا له ومحميًا وفق الإجراء',['Whenever it looks harmless / كلما بدت غير ضارة','To smell it for identification / شمّها للتعرف عليها','Before alerting anyone / قبل تنبيه أي شخص']],
  // Screen 5 — risk matrix and bowtie
  ['05-01','What two factors are commonly considered in a risk matrix? / ما العاملان اللذان يؤخذان عادةً في مصفوفة المخاطر؟','Likelihood and severity / الاحتمالية وشدة العواقب',['Colour and cost / اللون والتكلفة','Staff age and shift length / عمر الموظف وطول الوردية','Distance and popularity / المسافة والشعبية']],
  ['05-02','What does a high-severity risk mean? / ماذا تعني شدة المخاطر المرتفعة؟','The possible consequences could be serious / قد تكون العواقب المحتملة خطيرة',['The event is impossible / أن الحدث مستحيل','The hazard needs no control / أن الخطر لا يحتاج إلى ضوابط','The report should be deleted / ينبغي حذف البلاغ']],
  ['05-03','In a Bowtie model, what is a preventive control intended to do? / في نموذج Bowtie، ما هدف إجراء التحكم الوقائي؟','Reduce the chance of the top event / تقليل احتمال وقوع الحدث المركزي',['Increase the impact after the event / زيادة الأثر بعد الحدث','Replace all response plans / استبدال جميع خطط الاستجابة','Hide the hazard from reports / إخفاء الخطر عن البلاغات']],
  ['05-04','When should a risk assessment be reviewed? / متى ينبغي مراجعة تقييم المخاطر؟','When conditions change or new information appears / عند تغير الظروف أو ظهور معلومات جديدة',['Only once and never again / مرة واحدة فقط دون مراجعة لاحقة','Only after the annual party / بعد الاحتفال السنوي فقط','Whenever a report is inconvenient / كلما كان البلاغ غير ملائم']],
  ['05-05','What is the purpose of a mitigation measure? / ما الغرض من إجراء تخفيف المخاطر؟','Reduce likelihood or consequences where possible / تقليل الاحتمالية أو العواقب متى أمكن',['Guarantee zero risk in every case / ضمان انعدام المخاطر في كل الحالات','Replace reporting / استبدال الإبلاغ','Transfer every task to visitors / نقل كل المهام إلى الزوار']],
  // Screen 6 — alarm, communication and command
  ['06-01','What should an emergency message be? / كيف ينبغي أن تكون رسالة الطوارئ؟','Clear, brief, accurate and sent through approved channels / واضحة وموجزة ودقيقة وعبر القنوات المعتمدة',['Long and full of guesses / طويلة ومليئة بالتخمينات','Anonymous and public / مجهولة وعلنية','Delayed until all details are known / مؤجلة حتى معرفة كل التفاصيل']],
  ['06-02','What information should be included in an initial alert? / ما المعلومات التي ينبغي تضمينها في الإنذار الأولي؟','What happened, where it happened and immediate danger / ما حدث ومكانه والخطر المباشر',['Personal blame and rumours / اللوم الشخصي والشائعات','Only the sender’s opinion / رأي المرسل فقط','A final cause before investigation / السبب النهائي قبل التحقيق']],
  ['06-03','Why is acknowledgement of a critical message useful? / لماذا يفيد تأكيد استلام رسالة مهمة؟','It helps confirm the message was received / يساعد على التأكد من استلام الرسالة',['It proves the event is over / يثبت انتهاء الحادث','It removes the need for records / يلغي الحاجة إلى السجلات','It allows unapproved changes / يسمح بتغييرات غير معتمدة']],
  ['06-04','Who should coordinate incident priorities? / من ينبغي أن ينسق أولويات الحادث؟','The designated incident command role / الدور المحدد لقيادة الحادث',['Every observer separately / كل شاهد بصورة منفصلة','The nearest passenger / أقرب مسافر','An unrelated online group / مجموعة إلكترونية غير معنية']],
  ['06-05','What should staff do if radio communication fails? / ماذا يفعل الموظفون إذا تعطل الاتصال اللاسلكي؟','Use the approved backup communication method / استخدام وسيلة الاتصال البديلة المعتمدة',['Invent a new channel without notice / ابتكار قناة جديدة دون إبلاغ','Stop responding entirely / إيقاف الاستجابة تمامًا','Share sensitive details publicly / مشاركة التفاصيل الحساسة علنًا']],
  // Screen 7 — evacuation and crowds
  ['07-01','What should guide the choice of an evacuation route? / ما الذي ينبغي أن يوجّه اختيار مسار الإخلاء؟','Current conditions and the approved evacuation plan / الظروف الحالية وخطة الإخلاء المعتمدة',['The shortest route in every case / أقصر طريق في جميع الحالات','A route blocked by smoke / طريق يسده الدخان','A personal shortcut / اختصار شخصي']],
  ['07-02','How should staff communicate with people during evacuation? / كيف ينبغي للموظفين التواصل مع الأشخاص أثناء الإخلاء؟','Use calm, clear and consistent instructions / استخدام تعليمات هادئة وواضحة ومتسقة',['Shout conflicting directions / الصراخ بتوجيهات متعارضة','Use technical terms only / استخدام مصطلحات تقنية فقط','Give no updates / عدم تقديم تحديثات']],
  ['07-03','What is a safe approach to crowd movement? / ما النهج الآمن لتحرك الحشود؟','Prevent bottlenecks and follow trained procedures / منع الاختناقات واتباع الإجراءات المدربة',['Push people to move faster / دفع الأشخاص للتحرك أسرع','Close all exits without assessment / إغلاق جميع المخارج دون تقييم','Allow opposing flows to mix / السماح بتداخل اتجاهات الحركة المتعاكسة']],
  ['07-04','What should be considered for people needing assistance? / ما الذي ينبغي مراعاته للأشخاص الذين يحتاجون إلى المساعدة؟','Use the approved assistance arrangements without delaying the alarm / استخدام ترتيبات المساعدة المعتمدة دون تأخير الإنذار',['Assume everyone can use stairs / افتراض قدرة الجميع على استخدام السلالم','Leave assistance until last without a plan / تأجيل المساعدة للنهاية دون خطة','Ask untrained bystanders to lead / تكليف المارة غير المدربين بالقيادة']],
  ['07-05','When may an evacuated area be re-entered? / متى يمكن العودة إلى منطقة تم إخلاؤها؟','After the authorized all-clear and required checks / بعد إعلان السماح بالعودة من الجهة المخولة وإتمام الفحوص المطلوبة',['As soon as the noise stops / بمجرد توقف الضوضاء','When one person says it is safe / عندما يقول شخص واحد إنها آمنة','Whenever the crowd requests it / متى طلبت الحشود ذلك']],
  // Screen 8 — aircraft/APU fire
  ['08-01','What is the priority when observing smoke near an aircraft? / ما الأولوية عند ملاحظة دخان قرب طائرة؟','Raise the alarm and follow the approved airport response plan / إطلاق الإنذار واتباع خطة استجابة المطار المعتمدة',['Approach the smoke to investigate alone / الاقتراب من الدخان للتحقيق منفردًا','Operate aircraft equipment without authority / تشغيل معدات الطائرة دون صلاحية','Delay reporting until flames appear / تأخير الإبلاغ حتى ظهور اللهب']],
  ['08-02','Why should untrained staff avoid firefighting actions beyond their role? / لماذا ينبغي للموظفين غير المدربين تجنب مكافحة الحريق خارج نطاق دورهم؟','They may be exposed to hazards and worsen the situation / قد يتعرضون للمخاطر ويزيدون الوضع سوءًا',['Fire always stops by itself / لأن الحريق يتوقف دائمًا من تلقاء نفسه','It is faster to ignore procedures / لأن تجاهل الإجراءات أسرع','Training is never needed / لأن التدريب غير مطلوب مطلقًا']],
  ['08-03','What should responders know before approaching an aircraft incident? / ماذا ينبغي أن يعرف المستجيبون قبل الاقتراب من حادث طائرة؟','The incident location, hazards and assigned safe approach under procedure / موقع الحادث والمخاطر ومسار الاقتراب الآمن المحدد وفق الإجراء',['Only the aircraft colour / لون الطائرة فقط','Unconfirmed passenger rumours / شائعات غير مؤكدة عن المسافرين','The easiest route for spectators / أسهل طريق للمتفرجين']],
  ['08-04','What should staff do around an APU-related fire or smoke report? / ماذا يفعل الموظفون عند بلاغ عن حريق أو دخان مرتبط بوحدة الطاقة المساعدة؟','Report immediately and defer technical response to authorized responders / الإبلاغ فورًا وترك الاستجابة الفنية للمستجيبين المخولين',['Attempt repairs without training / محاولة الإصلاح دون تدريب','Assume the APU is always harmless / افتراض أن وحدة الطاقة آمنة دائمًا','Move equipment without coordination / نقل المعدات دون تنسيق']],
  ['08-05','Why must the local airport plan take priority over generic advice? / لماذا يجب أن تكون خطة المطار المحلية هي المرجع الأول مقارنة بالنصائح العامة؟','It defines the approved roles, resources and procedures for that airport / لأنها تحدد الأدوار والموارد والإجراءات المعتمدة لذلك المطار',['Generic advice is always more current / لأن النصائح العامة أحدث دائمًا','Local plans are only suggestions / لأن الخطط المحلية مجرد اقتراحات','It removes the need for training / لأنها تلغي الحاجة إلى التدريب']],
  // Screen 9 — natural hazards and continuity
  ['09-01','What is a useful first step when a severe weather warning is received? / ما الخطوة الأولى المفيدة عند تلقي تحذير من طقس شديد؟','Check the official alert and activate applicable procedures / مراجعة التنبيه الرسمي وتفعيل الإجراءات ذات الصلة',['Forward an unverified message / إعادة إرسال رسالة غير مؤكدة','Continue without checking / الاستمرار دون مراجعة','Wait for social media comments / انتظار التعليقات على وسائل التواصل']],
  ['09-02','What does business continuity planning support? / ما الذي تدعمه خطة استمرارية الأعمال؟','Maintaining or restoring priority services during disruption / الحفاظ على الخدمات ذات الأولوية أو استعادتها أثناء التعطل',['Avoiding all incident reports / تجنب جميع بلاغات الحوادث','Guaranteeing no delays ever / ضمان عدم حدوث أي تأخير مطلقًا','Removing emergency responsibilities / إلغاء مسؤوليات الطوارئ']],
  ['09-03','Why should critical resources be identified in advance? / لماذا ينبغي تحديد الموارد الحيوية مسبقًا؟','Teams can find and allocate them more quickly / لتتمكن الفرق من العثور عليها وتخصيصها بسرعة أكبر',['To keep them unknown to responders / لإبقائها مجهولة للمستجيبين','To prevent any inventory checks / لمنع فحص المخزون','To avoid assigning responsibility / لتجنب تحديد المسؤولية']],
  ['09-04','What should be done if normal systems become unavailable? / ماذا ينبغي فعله إذا أصبحت الأنظمة المعتادة غير متاحة؟','Use tested contingency arrangements and report the disruption / استخدام ترتيبات الطوارئ المختبرة والإبلاغ عن التعطل',['Create unapproved workarounds silently / إنشاء حلول غير معتمدة دون إبلاغ','Delete the incident log / حذف سجل الحادث','Stop all communication / إيقاف كل الاتصالات']],
  ['09-05','What is the value of a post-incident review? / ما فائدة مراجعة ما بعد الحادث؟','Identify lessons and improve plans and training / تحديد الدروس وتحسين الخطط والتدريب',['Assign blame without evidence / إلقاء اللوم دون أدلة','Replace all records with memory / استبدال السجلات بالذاكرة','Guarantee future incidents are impossible / ضمان استحالة وقوع حوادث مستقبلًا']],
  // Screen 10 — suspicious objects and threats
  ['10-01','What should a staff member do on finding a suspicious item? / ماذا يفعل الموظف عند العثور على جسم مشتبه به؟','Do not touch it; move away and report it under procedure / عدم لمسه والابتعاد والإبلاغ وفق الإجراء',['Open it to identify the contents / فتحه لمعرفة محتوياته','Move it to a public desk / نقله إلى مكتب عام','Ask a crowd to inspect it / مطالبة الحشد بفحصه']],
  ['10-02','Why should access near a suspicious item be controlled by authorized staff? / لماذا ينبغي أن يسيطر الموظفون المخولون على الوصول قرب جسم مشتبه به؟','To protect people and preserve the response area / لحماية الأشخاص والحفاظ على منطقة الاستجابة',['To let more people view the item / للسماح لمزيد من الأشخاص بمشاهدة الجسم','To hide the report / لإخفاء البلاغ','To replace specialist assessment / لاستبدال تقييم المختصين']],
  ['10-03','What should be included in a threat report? / ما الذي ينبغي تضمينه في بلاغ التهديد؟','Observed facts, location, time and actions already taken / الحقائق الملحوظة والموقع والوقت والإجراءات المتخذة',['Speculation about the person responsible / تخمينات حول المسؤول','Private details unrelated to the threat / تفاصيل خاصة غير مرتبطة بالتهديد','A public accusation / اتهام علني']],
  ['10-04','Who should assess a suspicious item? / من ينبغي أن يقيّم الجسم المشتبه به؟','The designated specialist responders / المستجيبون المختصون المحددون',['The person who found it, by opening it / الشخص الذي عثر عليه عن طريق فتحه','Nearby passengers / المسافرون القريبون','Any available visitor / أي زائر متاح']],
  ['10-05','What is the correct approach to an unverified threat message? / ما النهج الصحيح تجاه رسالة تهديد غير مؤكدة؟','Report it through approved channels and avoid spreading it / الإبلاغ عنها عبر القنوات المعتمدة وتجنب نشرها',['Forward it widely as confirmed / إعادة إرسالها على نطاق واسع باعتبارها مؤكدة','Delete it without reporting / حذفها دون إبلاغ','Publish the sender’s details / نشر تفاصيل المرسل']],
  // Screen 11 — responder occupational safety
  ['11-01','What should responders check before starting a task? / ما الذي ينبغي للمستجيبين التحقق منه قبل بدء المهمة؟','Their role, hazards, protective equipment and instructions / دورهم والمخاطر ومعدات الوقاية والتعليمات',['Whether the task looks exciting / ما إذا كانت المهمة تبدو مثيرة','Whether anyone is recording / ما إذا كان أحد يصور','Whether reporting can be skipped / ما إذا كان يمكن تجاوز الإبلاغ']],
  ['11-02','What should someone do if required protective equipment is missing? / ماذا يفعل الشخص إذا كانت معدات الوقاية المطلوبة غير متوفرة؟','Stop and report the issue to the supervisor / التوقف والإبلاغ عن المشكلة للمشرف',['Continue regardless of risk / الاستمرار بغض النظر عن الخطر','Borrow unknown equipment without checking / استعارة معدات مجهولة دون فحص','Ask an untrained person to approve / طلب الموافقة من شخص غير مدرب']],
  ['11-03','Why is fatigue relevant during emergency response? / لماذا يُعد الإرهاق مهمًا أثناء الاستجابة للطوارئ؟','It can reduce attention and increase mistakes / قد يقلل الانتباه ويزيد الأخطاء',['It always improves speed / يحسن السرعة دائمًا','It removes the need for supervision / يلغي الحاجة إلى الإشراف','It has no effect on decisions / لا يؤثر في القرارات']],
  ['11-04','What should a responder do when conditions become unsafe? / ماذا يفعل المستجيب عندما تصبح الظروف غير آمنة؟','Move to safety when possible and notify command / الانتقال إلى مكان آمن متى أمكن وإبلاغ القيادة',['Remain in danger to finish faster / البقاء في الخطر لإنهاء المهمة أسرع','Ignore new hazards / تجاهل المخاطر الجديدة','Act alone without informing anyone / التصرف منفردًا دون إبلاغ أحد']],
  ['11-05','Why are accurate handovers important between shifts? / لماذا يُعد تسليم المعلومات بدقة مهمًا بين الورديات؟','They maintain continuity and awareness of unresolved risks / تحافظ على استمرارية العمل والوعي بالمخاطر غير المحلولة',['They remove the need for records / تلغي الحاجة إلى السجلات','They make verbal rumours sufficient / تجعل الشائعات الشفهية كافية','They allow unresolved hazards to be forgotten / تسمح بنسيان المخاطر غير المحلولة']],
  // Screen 12 — tabletop exercise
  ['12-01','What is the first useful action in a tabletop exercise? / ما الإجراء الأول المفيد في التمرين المكتبي؟','Confirm the scenario, roles and exercise objectives / تأكيد السيناريو والأدوار وأهداف التمرين',['Assume the scenario is a real alarm / افتراض أن السيناريو إنذار حقيقي','Skip role assignments / تجاوز توزيع الأدوار','Decide the outcome before discussion / تحديد النتيجة قبل المناقشة']],
  ['12-02','Why should exercise participants explain their decisions? / لماذا ينبغي للمشاركين شرح قراراتهم أثناء التمرين؟','To check reasoning, coordination and procedure use / لفحص المنطق والتنسيق واستخدام الإجراءات',['To compete for the longest answer / للتنافس على أطول إجابة','To avoid identifying gaps / لتجنب تحديد الثغرات','To replace the debrief / لاستبدال جلسة استخلاص الدروس']],
  ['12-03','What should a facilitator do if participants identify a procedural gap? / ماذا يفعل الميسّر إذا حدد المشاركون فجوة إجرائية؟','Record it for review by the responsible authority / تسجيلها لمراجعتها من الجهة المسؤولة',['Invent a permanent rule immediately / ابتكار قاعدة دائمة فورًا','Ignore it to save time / تجاهلها لتوفير الوقت','Publish it as official policy / نشرها كسياسة رسمية']],
  ['12-04','What makes a tabletop exercise useful? / ما الذي يجعل التمرين المكتبي مفيدًا؟','Realistic decisions, clear roles and a structured review / قرارات واقعية وأدوار واضحة ومراجعة منظمة',['A guaranteed perfect outcome / نتيجة مثالية مضمونة','No questions from participants / عدم طرح المشاركين لأي أسئلة','Avoiding discussion of problems / تجنب مناقشة المشكلات']],
  ['12-05','What should be documented after the exercise? / ما الذي ينبغي توثيقه بعد التمرين؟','Actions, decisions, gaps and assigned follow-up / الإجراءات والقرارات والثغرات ومهام المتابعة المحددة',['Only the attendance list / قائمة الحضور فقط','Personal opinions without actions / آراء شخصية دون إجراءات','Nothing if the exercise ended on time / لا شيء إذا انتهى التمرين في موعده']],
  // Screen 13 — review and debrief
  ['13-01','What is a good debrief question? / ما السؤال الجيد في جلسة استخلاص الدروس؟','What worked, what was difficult, and why? / ما الذي نجح، وما الذي كان صعبًا، ولماذا؟',['Who can we blame without evidence? / من يمكن أن نلومه دون دليل؟','How can we avoid recording lessons? / كيف نتجنب تسجيل الدروس؟','Can we say the plan is perfect? / هل يمكننا القول إن الخطة مثالية؟']],
  ['13-02','How should corrective actions be managed? / كيف ينبغي إدارة الإجراءات التصحيحية؟','Assign an owner, target date and follow-up / تحديد مسؤول وموعد مستهدف ومتابعة',['Leave every action unassigned / ترك كل إجراء دون مسؤول','Record actions but never review them / تسجيل الإجراءات دون مراجعتها','Close actions without evidence / إغلاق الإجراءات دون دليل']],
  ['13-03','Why should reports distinguish facts from assumptions? / لماذا ينبغي أن تميز التقارير بين الحقائق والافتراضات؟','It supports fair review and reliable decisions / يدعم المراجعة العادلة والقرارات الموثوقة',['Assumptions are always correct / لأن الافتراضات صحيحة دائمًا','It makes reports longer / لأنه يجعل التقارير أطول','It avoids the need for evidence / لأنه يلغي الحاجة إلى الأدلة']],
  ['13-04','What is the best response to a lesson that needs specialist review? / ما أفضل استجابة لدرس يحتاج إلى مراجعة مختص؟','Refer it to the responsible specialist or authority / إحالته إلى المختص أو الجهة المسؤولة',['Change official procedure alone / تغيير الإجراء الرسمي منفردًا','Ignore it permanently / تجاهله نهائيًا','Present it as confirmed policy / عرضه كسياسة مؤكدة']],
  ['13-05','When is an action ready to close? / متى يكون الإجراء جاهزًا للإغلاق؟','When completion is verified and recorded / عند التحقق من إتمامه وتوثيقه',['When the owner says they are busy / عندما يقول المسؤول إنه مشغول','When the next shift begins / عند بدء الوردية التالية','When it disappears from the meeting notes / عندما يختفي من ملاحظات الاجتماع']],
  // Screen 14 — online assessment guidance
  ['14-01','Why should the learner read every option before answering? / لماذا ينبغي للمتدرب قراءة كل الخيارات قبل الإجابة؟','To choose the best answer based on the question / لاختيار أفضل إجابة بناءً على السؤال',['To select the first option automatically / لاختيار الخيار الأول تلقائيًا','To finish without checking meaning / للانتهاء دون فهم المعنى','To make the result random / لجعل النتيجة عشوائية']],
  ['14-02','What should happen if a submitted answer is missing? / ماذا ينبغي أن يحدث إذا كانت إجابة مطلوبة مفقودة؟','The system should ask for a complete valid submission / ينبغي أن يطلب النظام إرسالًا كاملًا وصحيحًا',['The system should invent an answer / ينبغي أن يخترع النظام إجابة','The learner should receive full marks / ينبغي أن يحصل المتدرب على الدرجة الكاملة','The answer key should be displayed / ينبغي عرض مفتاح الإجابة']],
  ['14-03','Why should the server calculate the score? / لماذا ينبغي للخادم حساب الدرجة؟','To prevent a learner from changing the score in the browser / لمنع المتدرب من تغيير الدرجة في المتصفح',['To make answers slower / لجعل الإجابات أبطأ','To show the answer key / لعرض مفتاح الإجابة','To remove all audit records / لإزالة جميع سجلات التدقيق']],
  ['14-04','What is the benefit of randomizing question order? / ما فائدة تغيير ترتيب الأسئلة عشوائيًا؟','It reduces reliance on a fixed question sequence / يقلل الاعتماد على تسلسل ثابت للأسئلة',['It changes the correct answer itself / يغير الإجابة الصحيحة نفسها','It guarantees every learner gets the same order / يضمن حصول الجميع على الترتيب نفسه','It removes the need for content review / يلغي الحاجة إلى مراجعة المحتوى']],
  ['14-05','What should a learner do if a technical issue interrupts a test? / ماذا يفعل المتدرب إذا عطلت مشكلة تقنية الاختبار؟','Use the approved support or recovery process / استخدام آلية الدعم أو الاستعادة المعتمدة',['Create a second account to bypass rules / إنشاء حساب ثانٍ لتجاوز القواعد','Share login details with another person / مشاركة بيانات الدخول مع شخص آخر','Assume the attempt is erased / افتراض أن المحاولة قد حُذفت']],
  // Screen 15 — closing, feedback and next steps
  ['15-01','What is the purpose of the final assessment? / ما الغرض من التقييم النهائي؟','Check learning against the stated outcomes / التحقق من التعلم وفق النتائج المحددة',['Collect satisfaction opinions only / جمع آراء الرضا فقط','Replace all formative checks / استبدال جميع الاختبارات المرحلية','Guarantee operational authorization / ضمان التصريح التشغيلي']],
  ['15-02','How is a workshop feedback survey different from an exam? / كيف يختلف استبيان الورشة عن الاختبار؟','It collects opinions about the learning experience / يجمع الآراء حول تجربة التعلم',['It determines the correct answer to every question / يحدد الإجابة الصحيحة لكل سؤال','It replaces the certificate rules / يستبدل قواعد الشهادة','It proves operational competence alone / يثبت الكفاءة التشغيلية وحده']],
  ['15-03','What should a participant do if a key topic remains unclear? / ماذا ينبغي للمشارك أن يفعل إذا ظل موضوع أساسي غير واضح؟','Ask for clarification and consult approved guidance / طلب التوضيح والرجوع إلى الإرشادات المعتمدة',['Guess during a real incident / التخمين أثناء حادث حقيقي','Change the airport plan / تغيير خطة المطار','Share an unverified rule / مشاركة قاعدة غير مؤكدة']],
  ['15-04','What does a workshop completion certificate confirm? / ماذا تؤكد شهادة إتمام الورشة؟','Completion under the stated workshop requirements / الإتمام وفق متطلبات الورشة المحددة',['Every professional licence required for the job / كل ترخيص مهني مطلوب للعمل','Permission to perform any emergency role / الإذن بأداء أي دور طوارئ','That incidents cannot occur / أن الحوادث لن تقع']],
  ['15-05','What is a useful next step after training? / ما الخطوة التالية المفيدة بعد التدريب؟','Apply learning within assigned duties and approved procedures / تطبيق التعلم ضمن المهام والإجراءات المعتمدة',['Ignore local procedures / تجاهل الإجراءات المحلية','Perform tasks outside authorization / أداء مهام خارج الصلاحية','Stop reporting hazards / التوقف عن الإبلاغ عن المخاطر']]
];

const FORMATIVE_BANK = Object.freeze(raw.map(([id, prompt, correct, distractors], index) => {
  const options = [
    { id: 'a', text: correct },
    ...distractors.map((text, i) => ({ id: String.fromCharCode(98 + i), text }))
  ];
  // Correct answer position is varied across the authored bank; runtime shuffles
  // question and option order independently for every persisted attempt.
  const shift = (index * 3 + Math.floor(index / 5)) % options.length;
  const rotated = options.slice(shift).concat(options.slice(0, shift));
  return Object.freeze({
    id,
    screenId: 'avs-' + id.slice(0, 2),
    prompt,
    options: Object.freeze(rotated.map(option => Object.freeze(option))),
    correctOptionId: 'a'
  });
}));

function getFormativeCheck(screenNumber) {
  if (!Number.isInteger(screenNumber) || screenNumber < 1 || screenNumber > 15) {
    throw new RangeError('screenNumber must be between 1 and 15.');
  }
  const questions = FORMATIVE_BANK.filter(q => Number(q.screenId.slice(-2)) === screenNumber);
  if (questions.length !== FORMATIVE_QUESTION_COUNT) {
    throw new Error('The formative check is incomplete.');
  }
  return questions;
}

function validateFormativeBank() {
  assertQuestionBank(FORMATIVE_BANK, 75);
  for (let screen = 1; screen <= 15; screen += 1) {
    const questions = getFormativeCheck(screen);
    assertQuestionBank(questions, FORMATIVE_QUESTION_COUNT);
  }
  return true;
}

function createFormativeSnapshot(screenNumber, attemptNumber, randomInt) {
  return createAttemptSnapshot(getFormativeCheck(screenNumber), {
    expectedCount: FORMATIVE_QUESTION_COUNT, attemptNumber, randomInt
  });
}

function buildPublicFormativeCheck(screenNumber, snapshot) {
  return buildPublicQuiz(getFormativeCheck(screenNumber), snapshot);
}

function gradeFormativeCheck(screenNumber, snapshot, answers) {
  return gradeAttempt(getFormativeCheck(screenNumber), snapshot, answers, {
    passCorrect: FORMATIVE_PASS_MIN_CORRECT
  });
}

module.exports = {
  FORMATIVE_BANK,
  FORMATIVE_PASS_MIN_CORRECT,
  getFormativeCheck,
  validateFormativeBank,
  createFormativeSnapshot,
  buildPublicFormativeCheck,
  gradeFormativeCheck
};
