# إنتاج فيديوهات إدارة حركة المرور والتحكم في المركبات في الموقع

يُنشئ [سكريبت الإنتاج](../scripts/produce_traffic_review.py) ملفات مراجعة لعشر شاشات ضمن الدورة الحالية `CRS-TRAFFIC-001`. يستخدم [النصوص العربية والترجمة الإنجليزية](TRAFFIC_VIDEO_BILINGUAL_REVIEW_SCRIPTS.md) و[متطلبات تصوير كل شاشة](TRAFFIC_TEN_VIDEO_REPLACEMENT_SHOTLIST.json)، ويأخذ شعار SI من أصل الشعار المضمّن في سكريبت المقدمة السابق.

| الوحدة | الشرح | التطبيق العملي |
| --- | --- | --- |
| Traffic Control Fundamentals / أساسيات تنظيم حركة المرور | `tm1s1` دور منظم حركة المرور | `tm1s2` مراجعة خطة الموقع وتقييم المخاطر |
| Gate Operations & Access Control / عمليات البوابات والتحكم في الدخول | `tm2s1` تنظيم الدخول وحارات التفتيش | `tm2s2` إحاطة السائق المتوقف والتصعيد |
| Parking & Pedestrian Safety / المواقف وسلامة المشاة | `tm3s1` فصل المشاة وتهدئة الحركة | `tm3s2` إدارة المواقف وتمرين الرجوع تحت الإشراف |
| Hazards & Incident Response / المخاطر والاستجابة للحوادث | `tm4s1` معدات الوقاية والطقس ومسار الطوارئ | `tm4s2` إعداد بلاغ وتقرير حادث ببيانات وهمية |
| Hand Signals & Practical Application / الإشارات اليدوية والتطبيق العملي | `tm5s1` شرح الإشارات الست المعتمدة للموقع | `tm5s2` تمرين اللاسلكي وتسليم المناوبة |

## تجهيز المواد

- احفظ بجوار ملف اللقطات تسجيلًا عربيًا مستقلًا لكل فقرة، وملف MP4 أو MOV للحركة الفعلية الموافقة لها. يمكن أن تضم الفقرة أكثر من زاوية بعد المونتاج إذا بقي تسلسل الحركة واضحًا. استخدم ملفات تتضمن توقيت مسار الفيديو، واجعل اللقطة أطول من التسجيل والمدة الإضافية المحددة. يُستخدم التسجيل العربي السابق إذا توفّر المصدر المطابق للنص وتمت مراجعته.
- في `source` سجّل مصدر اللقطة أو مرجع التصوير، وفي `permission` سجّل مرجع الترخيص أو موافقات الأشخاص والموقع. اترك المستندات التي تحتوي بيانات شخصية في مكانها المعتمد واجعل السجل يشير إليها. اضبط `start` و`tail` بالثواني. اجعل مدة كل درس بين 30 ثانية و10 دقائق.
- وزّع التصوير بين بوابة صناعية ومدخل مجمع تجاري وموقف وموقع عمل. يظهر منظم حركة مرور تابع لأمن خاص بالزي الكحلي والسترة العاكسة ومعدات الوقاية المناسبة. ادمج مخطط الموقع ومسارات المشاة والمركبات والطوارئ على لقطات الوحدات المعنية. في درس الإشارات، أدرج مخطط تموضع معتمد وإشارات مصوّرة منفصلة بزوايا توضّح اليدين واستجابة المركبة. راجع التوقف العادي أولًا مع مدرب مؤهل وفق [بوابات الاعتماد](TRAFFIC_VISUAL_ACCEPTANCE_GATES.md).
- سجّل تعليقًا طبيعيًا مجانًا بصوت متحدث عربي لديه إذن التسجيل. يدعم السكريبت أيضًا اختيار Edge TTS للقطات التي ترك فيها حقل `narration` فارغًا. في البيئة السحابية فشل الوصول المباشر إلى `speech.platform.bing.com` في حل اسم النطاق، وردّ وكيل الشبكة بـ HTTP 403. التسجيلات المحلية تعمل دون اتصال بخدمة صوت.

## تشغيل Windows

من PowerShell في جذر المستودع، استخدم Python 3.10 أو أحدث ونسخة FFmpeg تتضمن `libx264` و`libass`، مع توفر `ffmpeg` و`ffprobe` على `PATH`.

```powershell
ffmpeg -version
ffprobe -version
New-Item -ItemType Directory -Force "$env:USERPROFILE\SI-Traffic" | Out-Null
py -3 scripts/produce_traffic_review.py --template "$env:USERPROFILE\SI-Traffic\shots.json"
```

املأ حقول اللقطات في `shots.json`، واجعل المسارات نسبية إلى الملف أو مطلقة. مثال للمعاينة الأولى ثم الحزمة كاملة بعد مراجعة اللقطات:

```powershell
$work = "$env:USERPROFILE\SI-Traffic"
py -3 scripts/produce_traffic_review.py --manifest "$work\shots.json" --output "$work\review-tm5s1" --screen tm5s1
py -3 scripts/produce_traffic_review.py --manifest "$work\shots.json" --output "$work\review-all"
py -3 scripts/verify_traffic_final_media.py --media-dir "$work\review-all"
```

لاستخدام Edge TTS في شبكة تتيح الخدمة، ثبّت الحزمة في بيئة Python التي ستشغّل السكريبت وأضف `--edge-voice ar-EG-ShakirNeural` إلى أمر الإنتاج. استمع إلى النطق قبل قبول التسجيل.

يخرج السكريبت MP4 بدقة 1080p و25 إطارًا في الثانية بترميز H.264 وصوت AAC، وترجمة إنجليزية ظاهرة أسفل الإطار وملف VTT مستقل، وسجل مصادر وحالة مراجعة لكل شاشة. يبدأ توقيت كل ترجمة مع ملف التعليق المقابل، ويُحسب انتهاؤها من مدة الصوت الفعلية. راجع فواصل الصمت والمزامنة بصريًا وسمعيًا. السكريبت يفحص طول اللقطة، ومستوى الصوت، وفك الترميز، وتطابق مدة الخرج مع الجدول الزمني، كما يرفض الكتابة داخل مجلد الواجهة.

لاستكمال الاعتماد، افحص كل حركة وترجمتها على الهاتف وسطح المكتب، وسجّل اعتماد اللقطات ومدرب التطبيق لكل شاشة. تبقى قيم `approved` في إعداد الدورة مغلقة إلى أن تجتاز الملفات هذه المراجعة.

## اختبار الدورة على قاعدة معزولة

استخدم MongoDB محليًا وقاعدة باسم اختبار مستقل مثل `si_traffic_staging_validation`. شغّل `npm start` من `backend` بعد ضبط المتغيرات التالية في الطرفية. لا تُحمّل إعدادات البريد أو أي اتصال بقاعدة حية في هذه الجلسة.

```powershell
$env:MONGODB_URI = 'mongodb://127.0.0.1:27027/si_traffic_staging_validation'
$env:SI_TRAFFIC_STAGING_DB_NAME = 'si_traffic_staging_validation'
$env:SI_DEPLOYMENT_ENV = 'staging'
$env:TRAFFIC_PILOT_ENABLED = 'true'
$env:TRAFFIC_CERTIFICATES_ENABLED = 'false'
$env:TRAFFIC_STAGING_FRONTEND_URL = 'https://si-staging-ui.onrender.com/traffic-self-study.html'
$env:FRONTEND_URL = 'http://127.0.0.1:8000'
$env:PORT = '5000'
npm start
```

عنوان `TRAFFIC_STAGING_FRONTEND_URL` أعلاه جزء من شرط تفعيل API الحالي. لخدمة الواجهة المحلية شغّل `py -3 -m http.server 8000 --bind 127.0.0.1 --directory frontend` من جذر المستودع وافتح صفحة تفاصيل الدورة محليًا. يتطلب اختبار الدخول دون بريد بيانات اختبار معزولة ورابط دخول اختباريًا. افحص المحتوى والأصول بتمرير `node scripts/verify_traffic_pilot.js`.

## المواد السابقة

تتضمن شجرة الفرع ملفات [تغطية الشرائح الأصلية](traffic-original-slide-coverage.json) و[خطة الإنتاج السابقة](TRAFFIC_VIDEO_PRODUCTION_MASTER.md). يمكن فتح ملفات المراجعة المحذوفة سابقًا من الفرع باستخدام `git show b7b38dd:<path>`. المسارات هي `docs/traffic_module_05_practical_hand_signals_storyboard.md` و`review/traffic-ai-video-production-brief.md` و`review/traffic-real-video-release-gate.md` و`review/traffic-real-video-review.html` و`review/traffic-user-review-notes-2026-11-10.txt`. تشير سير عمل المراجعة إلى حزم GitHub Actions السابقة. منع وكيل البيئة الوصول إلى GitHub Artifacts API أثناء التحقق. فيديوهات المعاينة المتتبعة في المستودع لها ملفات VTT ومسارات AAC، وتظل مواد معاينة وفق ملاحظات المالك.

## مسار المواد التمثيلية

أضيفت [حزمة Windows المستقلة](../production/traffic/README.md) لإنتاج مراجعة باستخدام صور تمثيلية ومخططات أصلية عند غياب لقطات الحركة. المسار الموضح سابقًا في هذه الوثيقة يبقى متاحًا عند توفر تصوير معتمد. تتضمن الحزمة الجديدة قائمة المشاهد والنص والتوقيت التخطيطي، ويُكتب التوقيت النهائي بعد قياس التسجيلات.
