'use strict';

/**
 * AVS-EMRG-2026 workshop manifest.
 *
 * This file is an isolated source-of-truth draft only. It is intentionally NOT
 * registered in live learner routes. Do not enable registration, assessments,
 * or certificates until the dedicated workflow and release checks are complete.
 * Content headings are derived from the approved 15-slide bilingual workshop
 * deck; this manifest does not claim the online quiz banks are complete.
 */

const WORKSHOP = Object.freeze({
  code: 'AVS-EMRG-2026',
  slug: 'avs-emrg-2026',
  title: {
    en: 'Safety, Emergency & Evacuation in Civil Airports',
    ar: 'إدارة السلامة والطوارئ والإخلاء في المطارات المدنية'
  },
  type: 'workshop',
  status: 'planned',
  enabled: false,
  languages: ['en', 'ar'],
  durations: Object.freeze({
    trainingHours: 8,
    accessLinkHours: 120,
    activeStudyHours: null
  }),
  rules: Object.freeze({
    contentScreenCount: 15,
    formativeCheckCount: 15,
    formativeQuestionsPerCheck: 5,
    formativePassCorrect: 4,
    formativePassOutOf: 5,
    formativePassPercent: 80,
    finalQuestionCount: 30,
    finalPassPercentExclusive: 70,
    finalMinimumCorrect: 22,
    totalFinalAttempts: 3,
    shuffleFinalQuestions: true,
    shuffleFinalOptions: true,
    serverSideGradingRequired: true,
    answerKeyClientVisible: false
  }),
  sourceMaterial: Object.freeze({
    file: 'AVS-EMRG-2026_Self-Study_Workshop_Bilingual.pptx',
    slideCount: 15,
    trainingReference: 'ICAO Doc 9137',
    operationalCaveat: 'Follow current approved airport plans and applicable local requirements.'
  }),
  screens: Object.freeze([
    { id: 'avs-01', order: 1, titleEn: 'Workshop introduction', titleAr: 'مقدمة الورشة', sourceSlide: 1 },
    { id: 'avs-02', order: 2, titleEn: 'Objectives & initial check', titleAr: 'الأهداف والتقييم المبدئي', sourceSlide: 2 },
    { id: 'avs-03', order: 3, titleEn: 'The airport as an emergency system', titleAr: 'المطار كمنظومة للطوارئ', sourceSlide: 3 },
    { id: 'avs-04', order: 4, titleEn: 'Recognize airport hazards', titleAr: 'التعرّف على مخاطر المطارات', sourceSlide: 4 },
    { id: 'avs-05', order: 5, titleEn: 'Risk matrix & Bowtie analysis', titleAr: 'مصفوفة المخاطر وتحليل Bowtie', sourceSlide: 5 },
    { id: 'avs-06', order: 6, titleEn: 'Alarm, communication & command', titleAr: 'الإنذار والاتصالات والقيادة', sourceSlide: 6 },
    { id: 'avs-07', order: 7, titleEn: 'Evacuation & crowd management', titleAr: 'الإخلاء وإدارة الحشود', sourceSlide: 7 },
    { id: 'avs-08', order: 8, titleEn: 'Aircraft fire & APU scenario', titleAr: 'سيناريو حريق الطائرة ووحدة الطاقة المساعدة', sourceSlide: 8 },
    { id: 'avs-09', order: 9, titleEn: 'Natural disasters & continuity', titleAr: 'الكوارث الطبيعية واستمرارية الأعمال', sourceSlide: 9 },
    { id: 'avs-10', order: 10, titleEn: 'Suspicious objects & security threats', titleAr: 'الأجسام المشتبه بها والتهديدات الأمنية', sourceSlide: 10 },
    { id: 'avs-11', order: 11, titleEn: 'Occupational safety for responders', titleAr: 'السلامة المهنية لفرق الاستجابة', sourceSlide: 11 },
    { id: 'avs-12', order: 12, titleEn: 'Practical tabletop: airport emergency', titleAr: 'تمرين مكتبي: طوارئ في المطار', sourceSlide: 12 },
    { id: 'avs-13', order: 13, titleEn: 'Review decisions & debrief', titleAr: 'مراجعة القرارات واستخلاص الدروس', sourceSlide: 13 },
    { id: 'avs-14', order: 14, titleEn: 'Online assessment guidance', titleAr: 'إرشادات التقييم الإلكتروني', sourceSlide: 14 },
    { id: 'avs-15', order: 15, titleEn: 'Close, assessment & feedback', titleAr: 'الختام والتقييم والملاحظات', sourceSlide: 15 }
  ].map(screen => Object.freeze({
    ...screen,
    formativeQuestionCount: 5,
    questionBankStatus: 'not-implemented',
    contentReviewStatus: 'needs-final-review'
  }))),
  assessmentStatus: Object.freeze({
    formativeBank: 'not-implemented',
    finalBank: 'not-implemented',
    learnerSpecificRandomization: 'not-implemented',
    serverSideGrading: 'not-implemented',
    progressPersistence: 'not-verified'
  }),
  feedback: Object.freeze({
    source: 'approved-shared-si-feedback-set',
    questionCount: 10,
    located: false,
    integrated: false,
    note: 'Use the already-approved shared set. Do not create substitute questions.'
  }),
  releaseChecks: Object.freeze({
    contentReviewed: false,
    all75FormativeQuestionsValidated: false,
    all30FinalQuestionsValidated: false,
    shuffleAndGradingTested: false,
    finalScoreBoundaryTest21Fails22Passes: false,
    answerKeyHidden: false,
    progressAndResumeTested: false,
    accessAndActiveStudyExpiryTestedSeparately: false,
    emailFlowTested: false,
    feedbackFlowTested: false,
    certificateEligibilityTested: false,
    mobileAndDesktopTested: false,
    endToEndTestsPassed: false
  })
});

module.exports = { WORKSHOP };
