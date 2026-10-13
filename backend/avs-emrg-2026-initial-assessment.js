'use strict';

/**
 * AVS-EMRG-2026 initial diagnostic assessment.
 * Draft bank: 10 medium-difficulty bilingual MCQs.
 * Correct answers are for server-side use only; never serialize them to learners.
 * This bank is not connected to live routes and does not gate workshop access.
 */
const INITIAL_ASSESSMENT = Object.freeze({
  code: 'AVS-EMRG-2026',
  kind: 'initial-diagnostic',
  questionCount: 10,
  difficulty: 'medium',
  languages: Object.freeze(['en', 'ar']),
  requiredToPass: false,
  gatesWorkshopAccess: false,
  affectsCertificateEligibility: false,
  shuffleQuestions: true,
  shuffleOptions: true,
  questions: Object.freeze([
  {
    "id": "avs-pre-01",
    "topic": "reporting",
    "prompt": {
      "en": "You notice smoke near an airport service area, but you cannot confirm its source. What is the best first response?",
      "ar": "لاحظت دخانًا بالقرب من منطقة خدمات بالمطار، لكنك لا تستطيع تأكيد مصدره. ما أفضل تصرف أولي؟"
    },
    "options": [
      {
        "id": "a",
        "text": {
          "en": "Report the exact location and observed facts through the approved channel",
          "ar": "الإبلاغ عن الموقع الدقيق والوقائع التي شاهدتها عبر القناة المعتمدة"
        }
      },
      {
        "id": "b",
        "text": {
          "en": "Wait until another person confirms the smoke",
          "ar": "الانتظار حتى يؤكد شخص آخر وجود الدخان"
        }
      },
      {
        "id": "c",
        "text": {
          "en": "Post a warning on social media",
          "ar": "نشر تحذير على وسائل التواصل الاجتماعي"
        }
      },
      {
        "id": "d",
        "text": {
          "en": "Enter the area to investigate alone",
          "ar": "دخول المنطقة للتحقق بمفردك"
        }
      }
    ],
    "correctOptionId": "a"
  },
  {
    "id": "avs-pre-02",
    "topic": "risk-assessment",
    "prompt": {
      "en": "In a basic risk matrix, which two factors are commonly considered?",
      "ar": "في مصفوفة المخاطر الأساسية، ما العاملان اللذان يُؤخذان عادةً في الاعتبار؟"
    },
    "options": [
      {
        "id": "a",
        "text": {
          "en": "Cost and staff seniority",
          "ar": "التكلفة والأقدمية الوظيفية"
        }
      },
      {
        "id": "b",
        "text": {
          "en": "Likelihood and severity",
          "ar": "احتمالية الحدوث وشدة العواقب"
        }
      },
      {
        "id": "c",
        "text": {
          "en": "Location and shift length only",
          "ar": "الموقع ومدة الوردية فقط"
        }
      },
      {
        "id": "d",
        "text": {
          "en": "Number of reports and vehicle type",
          "ar": "عدد البلاغات ونوع المركبة"
        }
      }
    ],
    "correctOptionId": "b"
  },
  {
    "id": "avs-pre-03",
    "topic": "command-and-communication",
    "prompt": {
      "en": "During an emergency, two people give you conflicting instructions. What should you do?",
      "ar": "أثناء حالة طارئة، أعطاك شخصان تعليمات متعارضة. ماذا ينبغي أن تفعل؟"
    },
    "options": [
      {
        "id": "a",
        "text": {
          "en": "Choose the instruction that sounds faster",
          "ar": "اختيار التعليمات التي تبدو أسرع"
        }
      },
      {
        "id": "b",
        "text": {
          "en": "Ignore both instructions and act independently",
          "ar": "تجاهل التعليمات والتصرف بشكل مستقل"
        }
      },
      {
        "id": "c",
        "text": {
          "en": "Seek clarification through the established command structure",
          "ar": "طلب التوضيح من خلال هيكل القيادة المعتمد"
        }
      },
      {
        "id": "d",
        "text": {
          "en": "Ask passengers to decide",
          "ar": "طلب اتخاذ القرار من المسافرين"
        }
      }
    ],
    "correctOptionId": "c"
  },
  {
    "id": "avs-pre-04",
    "topic": "evacuation",
    "prompt": {
      "en": "During an evacuation, a usual exit route becomes unsafe. What is the safest general approach?",
      "ar": "أثناء الإخلاء، أصبح أحد مخارج الإخلاء المعتادة غير آمن. ما التصرف العام الأكثر أمانًا؟"
    },
    "options": [
      {
        "id": "a",
        "text": {
          "en": "Continue using it because it is the usual route",
          "ar": "الاستمرار في استخدامه لأنه المسار المعتاد"
        }
      },
      {
        "id": "b",
        "text": {
          "en": "Direct people to an approved safe alternative and follow site instructions",
          "ar": "توجيه الأشخاص إلى بديل آمن معتمد واتباع تعليمات الموقع"
        }
      },
      {
        "id": "c",
        "text": {
          "en": "Allow everyone to choose any route",
          "ar": "ترك كل شخص يختار أي مسار"
        }
      },
      {
        "id": "d",
        "text": {
          "en": "Stop all communication until the route reopens",
          "ar": "إيقاف جميع الاتصالات حتى يُفتح المسار مجددًا"
        }
      }
    ],
    "correctOptionId": "b"
  },
  {
    "id": "avs-pre-05",
    "topic": "suspicious-items",
    "prompt": {
      "en": "A suspicious unattended item is found near a passenger movement area. What should an untrained staff member do?",
      "ar": "عُثر على غرض متروك ومشتبه به بالقرب من منطقة حركة المسافرين. ماذا ينبغي أن يفعل الموظف غير المدرّب؟"
    },
    "options": [
      {
        "id": "a",
        "text": {
          "en": "Move it to a quieter location",
          "ar": "نقله إلى مكان أكثر هدوءًا"
        }
      },
      {
        "id": "b",
        "text": {
          "en": "Open it to identify the owner",
          "ar": "فتحه لمعرفة صاحبه"
        }
      },
      {
        "id": "c",
        "text": {
          "en": "Keep people clear and report it through approved security channels",
          "ar": "إبعاد الأشخاص عنه والإبلاغ عبر قنوات الأمن المعتمدة"
        }
      },
      {
        "id": "d",
        "text": {
          "en": "Take a closer photo before reporting",
          "ar": "التقاط صورة قريبة قبل الإبلاغ"
        }
      }
    ],
    "correctOptionId": "c"
  },
  {
    "id": "avs-pre-06",
    "topic": "aircraft-fire",
    "prompt": {
      "en": "You see a possible fire near an aircraft stand. Which action is most appropriate for a staff member who is not trained for firefighting?",
      "ar": "رأيت احتمال وجود حريق بالقرب من موقف طائرة. ما التصرف الأنسب لموظف غير مدرّب على مكافحة الحرائق؟"
    },
    "options": [
      {
        "id": "a",
        "text": {
          "en": "Attempt to fight the fire using any available equipment",
          "ar": "محاولة إطفاء الحريق بأي معدات متاحة"
        }
      },
      {
        "id": "b",
        "text": {
          "en": "Raise the alarm, report the location, keep clear, and follow instructions",
          "ar": "إطلاق الإنذار والإبلاغ عن الموقع والابتعاد واتباع التعليمات"
        }
      },
      {
        "id": "c",
        "text": {
          "en": "Move closer to determine the fire type",
          "ar": "الاقتراب لتحديد نوع الحريق"
        }
      },
      {
        "id": "d",
        "text": {
          "en": "Wait for a supervisor before making any report",
          "ar": "انتظار المشرف قبل الإبلاغ"
        }
      }
    ],
    "correctOptionId": "b"
  },
  {
    "id": "avs-pre-07",
    "topic": "responder-safety",
    "prompt": {
      "en": "Why should access routes for emergency responders be kept clear?",
      "ar": "لماذا يجب إبقاء طرق وصول فرق الاستجابة للطوارئ خالية من العوائق؟"
    },
    "options": [
      {
        "id": "a",
        "text": {
          "en": "To reduce the need for incident reports",
          "ar": "لتقليل الحاجة إلى تقارير الحوادث"
        }
      },
      {
        "id": "b",
        "text": {
          "en": "To let vehicles park closer to the terminal",
          "ar": "للسماح للمركبات بالوقوف قرب مبنى الركاب"
        }
      },
      {
        "id": "c",
        "text": {
          "en": "To prevent all staff movement",
          "ar": "لمنع حركة جميع الموظفين"
        }
      },
      {
        "id": "d",
        "text": {
          "en": "To help trained responders reach the incident without avoidable delay",
          "ar": "لمساعدة فرق الاستجابة المدرّبة على الوصول دون تأخير يمكن تجنبه"
        }
      }
    ],
    "correctOptionId": "d"
  },
  {
    "id": "avs-pre-08",
    "topic": "continuity",
    "prompt": {
      "en": "After a serious disruption, when should normal operations resume in an affected area?",
      "ar": "بعد اضطراب خطير، متى ينبغي استئناف العمليات المعتادة في المنطقة المتأثرة؟"
    },
    "options": [
      {
        "id": "a",
        "text": {
          "en": "When the area has been assessed and the authorized person confirms it is safe",
          "ar": "بعد تقييم المنطقة وتأكيد الشخص المخوّل أنها آمنة"
        }
      },
      {
        "id": "b",
        "text": {
          "en": "As soon as the first alarm stops",
          "ar": "بمجرد توقف الإنذار الأول"
        }
      },
      {
        "id": "c",
        "text": {
          "en": "When the crowd asks to return",
          "ar": "عندما يطلب الحشد العودة"
        }
      },
      {
        "id": "d",
        "text": {
          "en": "After a fixed ten-minute wait in every case",
          "ar": "بعد انتظار عشر دقائق في جميع الحالات"
        }
      }
    ],
    "correctOptionId": "a"
  },
  {
    "id": "avs-pre-09",
    "topic": "incident-reporting",
    "prompt": {
      "en": "Which incident report is the most useful for the response team?",
      "ar": "أي تقرير عن الحادث هو الأكثر فائدة لفريق الاستجابة؟"
    },
    "options": [
      {
        "id": "a",
        "text": {
          "en": "A report that includes assumptions to fill information gaps",
          "ar": "تقرير يتضمن افتراضات لسد نقص المعلومات"
        }
      },
      {
        "id": "b",
        "text": {
          "en": "A short factual report with time, exact location, observations, and actions taken",
          "ar": "تقرير موجز وواقعي يتضمن الوقت والموقع الدقيق والملاحظات والإجراءات المتخذة"
        }
      },
      {
        "id": "c",
        "text": {
          "en": "A message that only says 'there is a problem'",
          "ar": "رسالة تذكر فقط أن هناك مشكلة"
        }
      },
      {
        "id": "d",
        "text": {
          "en": "A long message sent to every contact available",
          "ar": "رسالة طويلة تُرسل إلى جميع جهات الاتصال المتاحة"
        }
      }
    ],
    "correctOptionId": "b"
  },
  {
    "id": "avs-pre-10",
    "topic": "tabletop-decision-making",
    "prompt": {
      "en": "During an exercise, information about an emergency is incomplete. What is the best decision-making approach?",
      "ar": "أثناء تمرين، كانت المعلومات المتعلقة بحالة الطوارئ غير مكتملة. ما أفضل أسلوب لاتخاذ القرار؟"
    },
    "options": [
      {
        "id": "a",
        "text": {
          "en": "Treat every unconfirmed detail as fact",
          "ar": "اعتبار كل معلومة غير مؤكدة حقيقة"
        }
      },
      {
        "id": "b",
        "text": {
          "en": "Delay all reporting until every detail is known",
          "ar": "تأجيل جميع البلاغات حتى تتوفر كل التفاصيل"
        }
      },
      {
        "id": "c",
        "text": {
          "en": "Report verified facts, identify what remains uncertain, and follow approved procedures",
          "ar": "الإبلاغ عن الحقائق المؤكدة وتحديد ما لا يزال غير واضح واتباع الإجراءات المعتمدة"
        }
      },
      {
        "id": "d",
        "text": {
          "en": "Make a public announcement before notifying the response team",
          "ar": "إصدار إعلان عام قبل إبلاغ فريق الاستجابة"
        }
      }
    ],
    "correctOptionId": "c"
  }
].map(question => Object.freeze({
    ...question,
    prompt: Object.freeze(question.prompt),
    options: Object.freeze(question.options.map(option => Object.freeze({
      ...option,
      text: Object.freeze(option.text)
    })))
  })))
});

function validateInitialAssessment(assessment = INITIAL_ASSESSMENT) {
  if (!assessment || assessment.questionCount !== 10 || assessment.questions.length !== 10) {
    throw new TypeError('Initial assessment must contain exactly 10 questions.');
  }
  const questionIds = new Set();
  for (const question of assessment.questions) {
    if (!question.id || questionIds.has(question.id)) throw new TypeError('Question ids must be unique.');
    questionIds.add(question.id);
    for (const language of ['en', 'ar']) {
      if (!question.prompt[language] || !question.prompt[language].trim()) {
        throw new TypeError('Each question must include English and Arabic wording.');
      }
    }
    if (!Array.isArray(question.options) || question.options.length !== 4) {
      throw new TypeError('Each initial assessment question must have four options.');
    }
    const optionIds = new Set();
    for (const option of question.options) {
      if (!option.id || optionIds.has(option.id)) throw new TypeError('Option ids must be unique per question.');
      optionIds.add(option.id);
      for (const language of ['en', 'ar']) {
        if (!option.text[language] || !option.text[language].trim()) {
          throw new TypeError('Each option must include English and Arabic wording.');
        }
      }
    }
    if (!optionIds.has(question.correctOptionId)) throw new TypeError('Correct answer must match an option id.');
  }
  return true;
}

function getLearnerQuestionBank() {
  return INITIAL_ASSESSMENT.questions.map(({ id, topic, prompt, options }) => ({
    id, topic, prompt,
    options: options.map(({ id: optionId, text }) => ({ id: optionId, text }))
  }));
}

module.exports = { INITIAL_ASSESSMENT, validateInitialAssessment, getLearnerQuestionBank };
