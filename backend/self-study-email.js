const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

function buildSelfStudyEmail({ name, course, enrollmentId, registrationAlias, link, magicMinutes, traffic, lessonCount, hasDiagnostic }) {
  const registration = [enrollmentId, registrationAlias].filter(Boolean).join(' / ');
  const hours = course.accessHours;
  const activeHours = course.activeStudyHours;
  const questions = course.finalQuestions ?? course.assessmentCounts?.final;
  const english = [
    `Hello ${name}, your self-study access to ${course.en} is ready.`,
    `Registration number: ${registration}`,
    `This single-use link expires in ${magicMinutes} minutes. Request a new link using your registration number and email if needed.`,
    `You have ${hours} hours from activation and up to ${activeHours} hours of active study.`,
    traffic
      ? `${hasDiagnostic ? 'Start with the initial assessment, then complete' : 'Complete'} ${lessonCount} lessons across ${course.modules.length} units, the unit assessments, and course feedback.`
      : `Complete the lessons and score at least ${course.masteryScore}% on the required knowledge checks.`,
    `The final assessment has ${questions} questions and a pass mark of ${course.finalPassScore}%.`
  ];
  const arabic = [
    `مرحبًا ${name}، يمكنك الآن بدء الدراسة الذاتية لدورة ${course.ar}.`,
    `رقم التسجيل: ${registration}`,
    `الرابط صالح للاستخدام مرة واحدة خلال ${magicMinutes} دقيقة. عند الحاجة، اطلب رابطًا جديدًا برقم التسجيل والبريد المسجل.`,
    `لديك ${hours} ساعة من التفعيل، وبحد أقصى ${activeHours} ساعة دراسة فعلية.`,
    traffic
      ? `${hasDiagnostic ? 'ابدأ بالتقييم المبدئي، ثم أكمل' : 'أكمل'} ${lessonCount} درسًا في ${course.modules.length} وحدات وتقييمات الوحدات والتغذية الراجعة.`
      : `أكمل الدروس وحقق ${course.masteryScore}% على الأقل في اختبارات المعرفة المطلوبة.`,
    `يتكون الاختبار النهائي من ${questions} سؤالًا، ودرجة النجاح ${course.finalPassScore}%.`
  ];
  return buildBilingualEmail(course, english, arabic, link);
}

function buildRegistrationEmail({ name, course, enrollmentId, registrationAlias, batchCode }) {
  const registration = [enrollmentId, registrationAlias].filter(Boolean).join(' / ');
  const english = [
    `Hello ${name}, we received your registration for ${course.en}.`,
    `Registration number: ${registration}`,
    ...(batchCode ? [`Batch: ${batchCode}`] : []),
    'Your registration is pending confirmation. Keep your registration number for correspondence about the schedule and course access.'
  ];
  const arabic = [
    `مرحبًا ${name}، استلمنا تسجيلك في دورة ${course.ar}.`,
    `رقم التسجيل: ${registration}`,
    ...(batchCode ? [`الدفعة: ${batchCode}`] : []),
    'تسجيلك قيد التأكيد. احتفظ برقم التسجيل للمراسلات المتعلقة بالجدول وطريقة حضور الدورة.'
  ];
  return buildBilingualEmail(course, english, arabic);
}

function buildBilingualEmail(course, english, arabic, link) {
  const paragraphs = lines => lines.map(line => `<p>${escapeHtml(line)}</p>`).join('');
  return {
    subject: `SECURITY INSTRUCTOR — ${course.en} / ${course.ar}`,
    textContent: [...english, '', ...arabic, ...(link ? ['', link] : [])].join('\n'),
    htmlContent: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#0B1F33">
      <header style="background:#0B1F33;color:#fff;padding:16px">
        <img width="48" alt="SI" src="https://securitytrainer2025.github.io/security-instructor/frontend/assets/traffic-practice/si-logo.jpg">
        <strong>SECURITY INSTRUCTOR</strong>
      </header>
      <div lang="en">${paragraphs(english)}</div>
      <div lang="ar" dir="rtl">${paragraphs(arabic)}</div>
      ${link ? `<p><a href="${escapeHtml(link)}" style="display:inline-block;padding:12px 18px;background:#C8A96B;color:#0B1F33;text-decoration:none;font-weight:bold">Start self-study / ابدأ الدراسة الذاتية</a></p>` : ''}
    </body></html>`
  };
}

async function sendTrainingEmail(to, message) {
  const { canSendMailTo } = require('./staging-mail.js');
  if (!canSendMailTo(to)) return { sent: false, error: 'Recipient is not approved for staging mail' };
  const apiKey = process.env.BREVO_API_KEY?.trim(), from = process.env.MAIL_FROM?.trim();
  if (!apiKey || !from) return { sent: false, error: 'Training mail is not configured' };
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { accept: 'application/json', 'api-key': apiKey, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'SECURITY INSTRUCTOR', email: from }, replyTo: { email: from }, to: [{ email: to }], ...message
    })
  });
  if (!response.ok) throw new Error('Training email provider returned HTTP ' + response.status);
  return { sent: true };
}

module.exports = { buildSelfStudyEmail, buildRegistrationEmail, sendTrainingEmail };
