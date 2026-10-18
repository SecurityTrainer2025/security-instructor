'use strict';

/**
 * Shared post-workshop feedback survey contract for SI courses and workshops. AVS is the first integration target.
 * Opinion-only, not scored, and never used for assessment or certificate eligibility.
 * Integration status: draft only; owner/content approval and release validation are still required.
 * Do not treat this survey as approved until the owner reviews and explicitly approves it.
 */
const FEEDBACK_SURVEY = Object.freeze({
  code: 'SI-COURSE-FEEDBACK',
  status: 'draft',
  scored: false,
  affectsCertificateEligibility: false,
  languageMode: 'bilingual-en-ar',
  questions: Object.freeze([
    { id: 'fb-01', type: 'rating-1-to-5', required: true, prompt: 'Overall, how satisfied are you with this workshop? / ما مدى رضاك بشكل عام عن هذه الورشة؟', scale: ['1 — Very dissatisfied / غير راضٍ جدًا','2 — Dissatisfied / غير راضٍ','3 — Neither / محايد','4 — Satisfied / راضٍ','5 — Very satisfied / راضٍ جدًا'] },
    { id: 'fb-02', type: 'rating-1-to-5', required: true, prompt: 'How clear were the learning objectives? / ما مدى وضوح أهداف التعلم؟', scale: ['1 — Not clear / غير واضحة','2 — Slightly clear / واضحة بدرجة بسيطة','3 — Moderately clear / واضحة إلى حد ما','4 — Clear / واضحة','5 — Very clear / واضحة جدًا'] },
    { id: 'fb-03', type: 'rating-1-to-5', required: true, prompt: 'How relevant was the content to your work? / ما مدى ارتباط المحتوى بعملك؟', scale: ['1 — Not relevant / غير مرتبط','2 — Slightly relevant / ارتباط محدود','3 — Moderately relevant / مرتبط إلى حد ما','4 — Relevant / مرتبط','5 — Very relevant / مرتبط جدًا'] },
    { id: 'fb-04', type: 'rating-1-to-5', required: true, prompt: 'How easy was the content to understand? / ما مدى سهولة فهم المحتوى؟', scale: ['1 — Very difficult / صعب جدًا','2 — Difficult / صعب','3 — Moderate / متوسط','4 — Easy / سهل','5 — Very easy / سهل جدًا'] },
    { id: 'fb-05', type: 'rating-1-to-5', required: true, prompt: 'Was the pace suitable for learning? / هل كانت سرعة تقديم المحتوى مناسبة للتعلم؟', scale: ['1 — Much too slow or fast / بطيئة أو سريعة جدًا','2 — Not suitable / غير مناسبة','3 — Acceptable / مقبولة','4 — Suitable / مناسبة','5 — Very suitable / مناسبة جدًا'] },
    { id: 'fb-06', type: 'rating-1-to-5', required: true, prompt: 'How useful were the examples and scenarios? / ما مدى فائدة الأمثلة والسيناريوهات؟', scale: ['1 — Not useful / غير مفيدة','2 — Slightly useful / مفيدة بدرجة بسيطة','3 — Moderately useful / مفيدة إلى حد ما','4 — Useful / مفيدة','5 — Very useful / مفيدة جدًا'] },
    { id: 'fb-07', type: 'rating-1-to-5', required: true, prompt: 'How confident do you feel applying the learning within your role? / ما مدى ثقتك في تطبيق ما تعلمته ضمن دورك؟', scale: ['1 — Not confident / غير واثق','2 — Slightly confident / ثقة محدودة','3 — Moderately confident / واثق إلى حد ما','4 — Confident / واثق','5 — Very confident / واثق جدًا'] },
    { id: 'fb-08', type: 'rating-1-to-5', required: true, prompt: 'How would you rate the learning materials and format? / كيف تقيّم المواد التدريبية وطريقة تقديمها؟', scale: ['1 — Very poor / ضعيفة جدًا','2 — Poor / ضعيفة','3 — Acceptable / مقبولة','4 — Good / جيدة','5 — Excellent / ممتازة'] },
    { id: 'fb-09', type: 'text', required: false, maxLength: 1000, prompt: 'What is one thing we should improve? / ما الشيء الواحد الذي تقترح تحسينه؟' },
    { id: 'fb-10', type: 'text', required: false, maxLength: 1000, prompt: 'What topic or support would help you next? / ما الموضوع أو الدعم الذي سيساعدك لاحقًا؟' }
  ])
});

function validateFeedbackSurvey(survey = FEEDBACK_SURVEY) {
  if (!survey || survey.scored !== false || survey.affectsCertificateEligibility !== false) {
    throw new TypeError('Feedback must remain unscored and separate from certificate eligibility.');
  }
  if (!Array.isArray(survey.questions) || survey.questions.length !== 10) {
    throw new TypeError('Feedback survey must contain exactly 10 questions.');
  }
  const ids = new Set();
  for (const q of survey.questions) {
    if (!q || typeof q.id !== 'string' || ids.has(q.id) ||
        typeof q.prompt !== 'string' || !q.prompt.includes('/') ||
        !['rating-1-to-5', 'text'].includes(q.type)) {
      throw new TypeError('Feedback question schema is invalid.');
    }
    ids.add(q.id);
    if (q.type === 'rating-1-to-5' && (!Array.isArray(q.scale) || q.scale.length !== 5)) {
      throw new TypeError('Rating questions must have five response choices.');
    }
  }
  return true;
}

function isFeedbackSurveyApproved(survey = FEEDBACK_SURVEY) {
  return Boolean(survey && survey.status === 'approved');
}

module.exports = { FEEDBACK_SURVEY, validateFeedbackSurvey, isFeedbackSurveyApproved };
