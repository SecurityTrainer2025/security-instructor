'use strict';

/**
 * AVS-EMRG-2026 final assessment bank.
 * Bilingual draft; content requires final subject-matter review before release.
 * Correct answers are server-only. Do not serialize this module to the browser.
 */
const QUESTIONS = Object.freeze([
  {
    "id": "avs-final-01",
    "topic": "risk",
    "prompt": "What is the safest first action when smoke is seen in an airport service area? / ما أول إجراء آمن عند رؤية دخان في منطقة خدمات بالمطار؟",
    "options": [
      {
        "id": "a",
        "text": "Wait for another person to confirm / انتظار تأكيد شخص آخر"
      },
      {
        "id": "b",
        "text": "Report the exact location and observed facts through the approved channel / الإبلاغ عن الموقع والوقائع عبر القناة المعتمدة"
      },
      {
        "id": "c",
        "text": "Enter alone to find the source / الدخول منفردًا لمعرفة المصدر"
      },
      {
        "id": "d",
        "text": "Post a public warning online / نشر تحذير عام عبر الإنترنت"
      }
    ],
    "correctOptionId": "b"
  },
  {
    "id": "avs-final-02",
    "topic": "command",
    "prompt": "Which factors are commonly used in a basic risk matrix? / ما العاملان المستخدمان عادةً في مصفوفة المخاطر؟",
    "options": [
      {
        "id": "a",
        "text": "Likelihood and severity / الاحتمالية والشدة"
      },
      {
        "id": "b",
        "text": "Cost and staff seniority / التكلفة والأقدمية"
      },
      {
        "id": "c",
        "text": "Weather and shift length only / الطقس ومدة الوردية فقط"
      },
      {
        "id": "d",
        "text": "Number of reports and vehicle type / عدد البلاغات ونوع المركبة"
      }
    ],
    "correctOptionId": "a"
  },
  {
    "id": "avs-final-03",
    "topic": "evacuation",
    "prompt": "What is the purpose of an emergency command structure? / ما الهدف من هيكل قيادة الطوارئ؟",
    "options": [
      {
        "id": "a",
        "text": "Let every team issue conflicting orders / السماح لكل فريق بإصدار أوامر متعارضة"
      },
      {
        "id": "b",
        "text": "Replace approved emergency plans / استبدال خطط الطوارئ المعتمدة"
      },
      {
        "id": "c",
        "text": "Coordinate roles, information, resources and decisions / تنسيق الأدوار والمعلومات والموارد والقرارات"
      },
      {
        "id": "d",
        "text": "Allow untrained staff to direct specialist teams / السماح لغير المدربين بتوجيه الفرق المتخصصة"
      }
    ],
    "correctOptionId": "c"
  },
  {
    "id": "avs-final-04",
    "topic": "fire",
    "prompt": "Two instructions conflict during an incident. What should you do? / تعارضت تعليمات أثناء حادث، ماذا تفعل؟",
    "options": [
      {
        "id": "a",
        "text": "Choose the instruction from the nearest person / اختيار تعليمات أقرب شخص"
      },
      {
        "id": "b",
        "text": "Ignore both and act alone / تجاهل الاثنين والتصرف منفردًا"
      },
      {
        "id": "c",
        "text": "Ask passengers to decide / مطالبة المسافرين بالاختيار"
      },
      {
        "id": "d",
        "text": "Seek clarification through the established command structure / طلب التوضيح عبر هيكل القيادة المعتمد"
      }
    ],
    "correctOptionId": "d"
  },
  {
    "id": "avs-final-05",
    "topic": "reporting",
    "prompt": "An evacuation route becomes unsafe. What is the best response? / أصبح مسار الإخلاء غير آمن، ما التصرف الأفضل؟",
    "options": [
      {
        "id": "a",
        "text": "Keep using it because it is familiar / الاستمرار فيه لأنه مألوف"
      },
      {
        "id": "b",
        "text": "Use an approved safe alternative and follow site instructions / استخدام بديل آمن معتمد واتباع تعليمات الموقع"
      },
      {
        "id": "c",
        "text": "Let everyone choose any route / ترك كل شخص يختار أي طريق"
      },
      {
        "id": "d",
        "text": "Stop all communications / إيقاف الاتصالات كلها"
      }
    ],
    "correctOptionId": "b"
  },
  {
    "id": "avs-final-06",
    "topic": "coordination",
    "prompt": "Why must emergency access routes remain clear? / لماذا يجب إبقاء طرق وصول الطوارئ خالية؟",
    "options": [
      {
        "id": "a",
        "text": "To help trained responders reach the incident without avoidable delay / لمساعدة فرق الاستجابة على الوصول دون تأخير يمكن تجنبه"
      },
      {
        "id": "b",
        "text": "To create more parking / لتوفير مواقف إضافية"
      },
      {
        "id": "c",
        "text": "To stop all staff movement / لمنع حركة الموظفين"
      },
      {
        "id": "d",
        "text": "To reduce reporting requirements / لتقليل متطلبات الإبلاغ"
      }
    ],
    "correctOptionId": "a"
  },
  {
    "id": "avs-final-07",
    "topic": "risk",
    "prompt": "A suspicious unattended item is found. What should untrained staff do? / عُثر على غرض متروك ومشتبه به، ماذا يفعل الموظف غير المدرّب؟",
    "options": [
      {
        "id": "a",
        "text": "Open it to identify its owner / فتحه لمعرفة صاحبه"
      },
      {
        "id": "b",
        "text": "Move it to a quiet place / نقله إلى مكان هادئ"
      },
      {
        "id": "c",
        "text": "Keep people clear and report through approved security channels / إبعاد الأشخاص والإبلاغ عبر قنوات الأمن المعتمدة"
      },
      {
        "id": "d",
        "text": "Take a close-up photo first / التقاط صورة قريبة أولًا"
      }
    ],
    "correctOptionId": "c"
  },
  {
    "id": "avs-final-08",
    "topic": "command",
    "prompt": "You see a possible fire near an aircraft stand but are not trained to fight fires. What should you do? / رأيت حريقًا محتملًا قرب موقف طائرة وأنت غير مدرب على الإطفاء، ماذا تفعل؟",
    "options": [
      {
        "id": "a",
        "text": "Attempt to extinguish it with any equipment / محاولة إطفائه بأي معدات"
      },
      {
        "id": "b",
        "text": "Move closer to identify the fire type / الاقتراب لتحديد نوع الحريق"
      },
      {
        "id": "c",
        "text": "Wait for a supervisor before reporting / انتظار المشرف قبل الإبلاغ"
      },
      {
        "id": "d",
        "text": "Raise the alarm, report the location, keep clear and follow instructions / إطلاق الإنذار والإبلاغ والابتعاد واتباع التعليمات"
      }
    ],
    "correctOptionId": "d"
  },
  {
    "id": "avs-final-09",
    "topic": "evacuation",
    "prompt": "Which information is most useful in an initial incident report? / ما المعلومات الأكثر فائدة في البلاغ الأولي؟",
    "options": [
      {
        "id": "a",
        "text": "Assumptions about the cause / افتراضات حول السبب"
      },
      {
        "id": "b",
        "text": "Time, exact location, observed facts and actions taken / الوقت والموقع الدقيق والوقائع والإجراءات المتخذة"
      },
      {
        "id": "c",
        "text": "Personal opinions about responsibility / آراء شخصية حول المسؤولية"
      },
      {
        "id": "d",
        "text": "A long message sent to everyone / رسالة طويلة تُرسل للجميع"
      }
    ],
    "correctOptionId": "b"
  },
  {
    "id": "avs-final-10",
    "topic": "fire",
    "prompt": "When may an affected area return to normal operation after a serious incident? / متى يمكن استئناف العمل المعتاد في منطقة متأثرة بحادث خطير؟",
    "options": [
      {
        "id": "a",
        "text": "When the alarm sound stops / عند توقف صوت الإنذار"
      },
      {
        "id": "b",
        "text": "After a fixed ten-minute wait / بعد انتظار عشر دقائق دائمًا"
      },
      {
        "id": "c",
        "text": "After assessment and authorization that it is safe / بعد التقييم والتصريح بأنها آمنة"
      },
      {
        "id": "d",
        "text": "When the crowd requests entry / عندما يطلب الحشد الدخول"
      }
    ],
    "correctOptionId": "c"
  },
  {
    "id": "avs-final-11",
    "topic": "reporting",
    "prompt": "What does a risk assessment help a team decide? / بماذا يساعد تقييم المخاطر الفريق؟",
    "options": [
      {
        "id": "a",
        "text": "Which hazards matter and what controls are needed / تحديد المخاطر المهمة والضوابط اللازمة"
      },
      {
        "id": "b",
        "text": "Who should be blamed before investigation / من يجب لومه قبل التحقيق"
      },
      {
        "id": "c",
        "text": "How to avoid recording an incident / كيفية تجنب تسجيل الحادث"
      },
      {
        "id": "d",
        "text": "Whether procedures can be ignored / ما إذا كان يمكن تجاهل الإجراءات"
      }
    ],
    "correctOptionId": "a"
  },
  {
    "id": "avs-final-12",
    "topic": "coordination",
    "prompt": "What is the safest general response to a crowd moving toward an unsafe exit? / ما الاستجابة العامة الأكثر أمانًا لحشد يتجه إلى مخرج غير آمن؟",
    "options": [
      {
        "id": "a",
        "text": "Shout several conflicting directions / الصراخ بتوجيهات متعارضة"
      },
      {
        "id": "b",
        "text": "Block every route without explanation / إغلاق كل المسارات دون توضيح"
      },
      {
        "id": "c",
        "text": "Allow the crowd to decide independently / ترك الحشد يقرر بشكل مستقل"
      },
      {
        "id": "d",
        "text": "Give clear approved directions toward a safe route and coordinate with the team / إعطاء توجيهات واضحة معتمدة نحو مسار آمن والتنسيق مع الفريق"
      }
    ],
    "correctOptionId": "d"
  },
  {
    "id": "avs-final-13",
    "topic": "risk",
    "prompt": "Why should staff avoid spreading unverified emergency information? / لماذا يجب تجنب نشر معلومات طوارئ غير مؤكدة؟",
    "options": [
      {
        "id": "a",
        "text": "It always delays the response / لأنها تؤخر الاستجابة دائمًا"
      },
      {
        "id": "b",
        "text": "It can cause confusion and unsafe actions / لأنها قد تسبب الارتباك وتصرفات غير آمنة"
      },
      {
        "id": "c",
        "text": "It replaces formal reporting / لأنها تستبدل الإبلاغ الرسمي"
      },
      {
        "id": "d",
        "text": "It makes accountability unnecessary / لأنها تلغي الحاجة للمساءلة"
      }
    ],
    "correctOptionId": "b"
  },
  {
    "id": "avs-final-14",
    "topic": "command",
    "prompt": "What is the main purpose of a tabletop exercise? / ما الهدف الأساسي من التمرين المكتبي؟",
    "options": [
      {
        "id": "a",
        "text": "To test decisions, coordination and procedures through a scenario / اختبار القرارات والتنسيق والإجراءات من خلال سيناريو"
      },
      {
        "id": "b",
        "text": "To replace all practical training / استبدال التدريب العملي كله"
      },
      {
        "id": "c",
        "text": "To certify every participant as a responder / اعتماد كل مشارك كمستجيب"
      },
      {
        "id": "d",
        "text": "To avoid documenting lessons / تجنب توثيق الدروس"
      }
    ],
    "correctOptionId": "a"
  },
  {
    "id": "avs-final-15",
    "topic": "evacuation",
    "prompt": "During an exercise, some details remain uncertain. What is the best approach? / بقيت بعض التفاصيل غير مؤكدة أثناء تمرين، ما النهج الأفضل؟",
    "options": [
      {
        "id": "a",
        "text": "Treat every assumption as fact / اعتبار كل افتراض حقيقة"
      },
      {
        "id": "b",
        "text": "Delay all reports until all details are known / تأجيل البلاغات حتى معرفة كل التفاصيل"
      },
      {
        "id": "c",
        "text": "Report verified facts and state what remains unknown / الإبلاغ عن الحقائق المؤكدة وتوضيح ما لا يزال مجهولًا"
      },
      {
        "id": "d",
        "text": "Make a public announcement first / إصدار إعلان عام أولًا"
      }
    ],
    "correctOptionId": "c"
  },
  {
    "id": "avs-final-16",
    "topic": "fire",
    "prompt": "What should guide the use of airport emergency procedures? / ما الذي ينبغي أن يوجّه تطبيق إجراءات الطوارئ بالمطار؟",
    "options": [
      {
        "id": "a",
        "text": "Personal preference / التفضيل الشخصي"
      },
      {
        "id": "b",
        "text": "Generic advice from social media / نصائح عامة من وسائل التواصل"
      },
      {
        "id": "c",
        "text": "The route used during the last incident only / المسار المستخدم في الحادث السابق فقط"
      },
      {
        "id": "d",
        "text": "Current approved airport plans, local requirements and assigned roles / خطط المطار المعتمدة الحالية والمتطلبات المحلية والأدوار المحددة"
      }
    ],
    "correctOptionId": "d"
  },
  {
    "id": "avs-final-17",
    "topic": "reporting",
    "prompt": "What is a key benefit of clear emergency communications? / ما الفائدة الأساسية من وضوح اتصالات الطوارئ؟",
    "options": [
      {
        "id": "a",
        "text": "They remove the need for command / تلغي الحاجة للقيادة"
      },
      {
        "id": "b",
        "text": "They help teams share timely, accurate information / تساعد الفرق على تبادل معلومات دقيقة في الوقت المناسب"
      },
      {
        "id": "c",
        "text": "They guarantee there will be no incident / تضمن عدم وقوع حادث"
      },
      {
        "id": "d",
        "text": "They allow everyone to use any radio channel / تسمح للجميع باستخدام أي قناة لاسلكية"
      }
    ],
    "correctOptionId": "b"
  },
  {
    "id": "avs-final-18",
    "topic": "coordination",
    "prompt": "What should security staff do if an alarm panel appears damaged? / ماذا يفعل أفراد الأمن إذا بدت لوحة الإنذار متضررة؟",
    "options": [
      {
        "id": "a",
        "text": "Report it through site procedures and avoid unauthorized repairs / الإبلاغ وفق إجراءات الموقع وتجنب الإصلاح غير المصرح به"
      },
      {
        "id": "b",
        "text": "Open the panel and repair it / فتح اللوحة وإصلاحها"
      },
      {
        "id": "c",
        "text": "Ignore it if no alarm sounds / تجاهلها إن لم يصدر إنذار"
      },
      {
        "id": "d",
        "text": "Post a picture online / نشر صورة عبر الإنترنت"
      }
    ],
    "correctOptionId": "a"
  },
  {
    "id": "avs-final-19",
    "topic": "risk",
    "prompt": "Why is smoke exposure a serious life-safety concern? / لماذا يمثل التعرض للدخان خطرًا على الأرواح؟",
    "options": [
      {
        "id": "a",
        "text": "Smoke only damages equipment / الدخان يتلف المعدات فقط"
      },
      {
        "id": "b",
        "text": "Smoke means the fire is already out / الدخان يعني أن الحريق انتهى"
      },
      {
        "id": "c",
        "text": "Smoke can reduce visibility and harm breathing / قد يقلل الدخان الرؤية ويضر التنفس"
      },
      {
        "id": "d",
        "text": "Smoke is harmless outdoors / الدخان غير ضار في الخارج"
      }
    ],
    "correctOptionId": "c"
  },
  {
    "id": "avs-final-20",
    "topic": "command",
    "prompt": "What should be considered before selecting a fire extinguisher? / ما الذي يجب مراعاته قبل اختيار طفاية الحريق؟",
    "options": [
      {
        "id": "a",
        "text": "Its color only / لونها فقط"
      },
      {
        "id": "b",
        "text": "The nearest extinguisher regardless of label / أقرب طفاية بصرف النظر عن ملصقها"
      },
      {
        "id": "c",
        "text": "The size of the room only / مساحة الغرفة فقط"
      },
      {
        "id": "d",
        "text": "Fire type, extinguisher label, training and site procedures / نوع الحريق وملصق الطفاية والتدريب وإجراءات الموقع"
      }
    ],
    "correctOptionId": "d"
  },
  {
    "id": "avs-final-21",
    "topic": "evacuation",
    "prompt": "What should a staff member do if a fire grows or the area becomes unsafe while using an extinguisher? / ماذا يفعل الموظف إذا ازداد الحريق أو أصبحت المنطقة غير آمنة أثناء استخدام الطفاية؟",
    "options": [
      {
        "id": "a",
        "text": "Continue until the extinguisher is empty / الاستمرار حتى تفرغ الطفاية"
      },
      {
        "id": "b",
        "text": "Stop, withdraw to safety and follow the emergency plan / التوقف والانسحاب إلى مكان آمن واتباع خطة الطوارئ"
      },
      {
        "id": "c",
        "text": "Move closer to the fire / الاقتراب من الحريق"
      },
      {
        "id": "d",
        "text": "Wait for someone to take a photo / انتظار شخص لالتقاط صورة"
      }
    ],
    "correctOptionId": "b"
  },
  {
    "id": "avs-final-22",
    "topic": "fire",
    "prompt": "Why should assembly areas be used after evacuation? / لماذا تُستخدم نقاط التجمع بعد الإخلاء؟",
    "options": [
      {
        "id": "a",
        "text": "To organize people and support accountability / لتنظيم الأشخاص والمساعدة في حصرهم"
      },
      {
        "id": "b",
        "text": "To store emergency equipment only / لتخزين معدات الطوارئ فقط"
      },
      {
        "id": "c",
        "text": "To allow immediate return indoors / للسماح بالعودة الفورية للداخل"
      },
      {
        "id": "d",
        "text": "To replace incident command / لاستبدال قيادة الحادث"
      }
    ],
    "correctOptionId": "a"
  },
  {
    "id": "avs-final-23",
    "topic": "reporting",
    "prompt": "Who should normally carry out medical triage? / من الذي ينبغي أن يقوم عادةً بالفرز الطبي؟",
    "options": [
      {
        "id": "a",
        "text": "Any passenger who volunteers / أي مسافر يتطوع"
      },
      {
        "id": "b",
        "text": "Untrained security staff / أفراد الأمن غير المدربين"
      },
      {
        "id": "c",
        "text": "Trained medical responders following protocol / المستجيبون الطبيون المدربون وفق البروتوكول"
      },
      {
        "id": "d",
        "text": "The person nearest the incident / أقرب شخص إلى الحادث"
      }
    ],
    "correctOptionId": "c"
  },
  {
    "id": "avs-final-24",
    "topic": "coordination",
    "prompt": "What should security staff do to support emergency responders? / كيف يدعم أفراد الأمن فرق الاستجابة؟",
    "options": [
      {
        "id": "a",
        "text": "Direct specialist treatment without training / توجيه العلاج المتخصص دون تدريب"
      },
      {
        "id": "b",
        "text": "Change the incident commander / تغيير قائد الحادث"
      },
      {
        "id": "c",
        "text": "Move barriers into access routes / وضع الحواجز في طرق الوصول"
      },
      {
        "id": "d",
        "text": "Keep access clear and provide accurate site information / إبقاء طرق الوصول خالية وتقديم معلومات دقيقة عن الموقع"
      }
    ],
    "correctOptionId": "d"
  },
  {
    "id": "avs-final-25",
    "topic": "risk",
    "prompt": "What is an appropriate approach to suspected deliberate fire-setting? / ما النهج المناسب عند الاشتباه في إشعال حريق عمدًا؟",
    "options": [
      {
        "id": "a",
        "text": "Accuse a person immediately / اتهام شخص فورًا"
      },
      {
        "id": "b",
        "text": "Record objective observations and report through the approved process / تسجيل الملاحظات الموضوعية والإبلاغ عبر الإجراء المعتمد"
      },
      {
        "id": "c",
        "text": "Handle suspected materials personally / التعامل شخصيًا مع المواد المشتبه بها"
      },
      {
        "id": "d",
        "text": "Share names publicly / نشر الأسماء علنًا"
      }
    ],
    "correctOptionId": "b"
  },
  {
    "id": "avs-final-26",
    "topic": "command",
    "prompt": "What is the role of preventive controls in risk management? / ما دور الضوابط الوقائية في إدارة المخاطر؟",
    "options": [
      {
        "id": "a",
        "text": "Reduce the chance of an incident or limit its consequences / تقليل احتمال وقوع الحادث أو الحد من عواقبه"
      },
      {
        "id": "b",
        "text": "Guarantee that no incident can occur / ضمان عدم وقوع أي حادث"
      },
      {
        "id": "c",
        "text": "Replace reporting and response plans / استبدال خطط الإبلاغ والاستجابة"
      },
      {
        "id": "d",
        "text": "Remove the need for review / إلغاء الحاجة للمراجعة"
      }
    ],
    "correctOptionId": "a"
  },
  {
    "id": "avs-final-27",
    "topic": "evacuation",
    "prompt": "Why should emergency decisions and actions be recorded? / لماذا ينبغي تسجيل قرارات الطوارئ والإجراءات المتخذة؟",
    "options": [
      {
        "id": "a",
        "text": "To create more paperwork without purpose / لزيادة الأعمال الورقية دون هدف"
      },
      {
        "id": "b",
        "text": "To delay the response / لتأخير الاستجابة"
      },
      {
        "id": "c",
        "text": "To support handover, accountability and later review / لدعم تسليم المهام والمساءلة والمراجعة اللاحقة"
      },
      {
        "id": "d",
        "text": "To replace communication during the incident / لاستبدال التواصل أثناء الحادث"
      }
    ],
    "correctOptionId": "c"
  },
  {
    "id": "avs-final-28",
    "topic": "fire",
    "prompt": "What should a responder do when a hazard is outside their training or authority? / ماذا يفعل المستجيب عندما يكون الخطر خارج تدريبه أو صلاحياته؟",
    "options": [
      {
        "id": "a",
        "text": "Attempt the task to save time / محاولة المهمة لتوفير الوقت"
      },
      {
        "id": "b",
        "text": "Ask a bystander to take responsibility / مطالبة أحد المارة بتحمل المسؤولية"
      },
      {
        "id": "c",
        "text": "Ignore the hazard / تجاهل الخطر"
      },
      {
        "id": "d",
        "text": "Keep safe, notify the appropriate team and follow instructions / الحفاظ على السلامة وإبلاغ الفريق المختص واتباع التعليمات"
      }
    ],
    "correctOptionId": "d"
  },
  {
    "id": "avs-final-29",
    "topic": "reporting",
    "prompt": "What is the main purpose of a post-incident debrief? / ما الهدف الأساسي من مراجعة ما بعد الحادث؟",
    "options": [
      {
        "id": "a",
        "text": "Assign blame before reviewing evidence / إلقاء اللوم قبل مراجعة الأدلة"
      },
      {
        "id": "b",
        "text": "Identify what worked, what needs improvement and follow-up actions / تحديد ما نجح وما يحتاج إلى تحسين وإجراءات المتابعة"
      },
      {
        "id": "c",
        "text": "Replace official incident records / استبدال سجلات الحادث الرسمية"
      },
      {
        "id": "d",
        "text": "Confirm that no further action is needed in every case / تأكيد عدم الحاجة لأي إجراء إضافي دائمًا"
      }
    ],
    "correctOptionId": "b"
  },
  {
    "id": "avs-final-30",
    "topic": "risk",
    "prompt": "When should people re-enter an evacuated area? / متى يُسمح للأشخاص بالعودة إلى منطقة تم إخلاؤها؟",
    "options": [
      {
        "id": "a",
        "text": "As soon as they feel safe / بمجرد شعورهم بالأمان"
      },
      {
        "id": "b",
        "text": "When the crowd begins returning / عندما يبدأ الحشد بالعودة"
      },
      {
        "id": "c",
        "text": "Only after authorized confirmation that re-entry is safe / فقط بعد تأكيد الجهة المخولة أن العودة آمنة"
      },
      {
        "id": "d",
        "text": "After a fixed waiting period in every case / بعد فترة انتظار ثابتة في جميع الحالات"
      }
    ],
    "correctOptionId": "c"
  }
].map(question => Object.freeze({
  ...question,
  options: Object.freeze(question.options.map(option => Object.freeze(option)))
})));

const { assertQuestionBank, FINAL_QUESTION_COUNT } = require('./avs-emrg-2026-assessment');

function validateFinalAssessmentBank(questions = QUESTIONS) {
  assertQuestionBank(questions, FINAL_QUESTION_COUNT);
  return true;
}

module.exports = { QUESTIONS, validateFinalAssessmentBank };
