const express=require('express');
const mongoose=require('mongoose');
const crypto=require('crypto');
const nodemailer=require('nodemailer');
require('dotenv').config();

const FRONTEND_URL=(process.env.SELF_STUDY_FRONTEND_URL||'https://securitytrainer2025.github.io/security-instructor/frontend/fire-safety-self-study.html').trim();
const ACCESS_HOURS=Number(process.env.SELF_STUDY_ACCESS_HOURS||72);
const MAGIC_MINUTES=15;
const SESSION_HOURS=Number(process.env.SELF_STUDY_SESSION_HOURS||72);
const FIRE_SLUG='fire-safety-emergency-response';

const FIRE_SCREENS={
m1:[
{id:'m1s1',slide:4,titleEn:'Module 1 | Fire Science & Building Hazards',titleAr:'الوحدة الأولى | أساسيات علوم الحريق ومخاطر المنشآت',bodyEn:'This module explains the basic science of fire, heat release, heat transfer and common building hazards. The focus is awareness, prevention and safe first response within training and site procedures.',bodyAr:'تشرح هذه الوحدة أساسيات علوم الحريق وانتقال الحرارة ومعدل إطلاق الحرارة ومخاطر المنشآت الشائعة. ويركز المحتوى على الوعي والوقاية والاستجابة الأولية الآمنة ضمن التدريب وإجراءات الموقع.',assessmentRequired:false,videoUrl:''},
{id:'m1s2',slide:5,titleEn:'Module 1 | Learning Objectives',titleAr:'الوحدة الأولى | أهداف التعلم',bodyEn:'By the end of this module, learners should explain the fire triangle and tetrahedron, understand heat release rate, describe convection, conduction and radiation, and identify common fire hazards during security patrols.',bodyAr:'بنهاية هذه الوحدة، ينبغي أن يستطيع المتدرب شرح مثلث الحريق ورباعي الأوجه، وفهم معدل إطلاق الحرارة، ووصف الحمل والتوصيل والإشعاع، وتحديد مخاطر الحريق الشائعة أثناء الدوريات الأمنية.',assessmentRequired:false,videoUrl:''},
{id:'m1s3',slide:6,titleEn:'Fire Safety in Facilities',titleAr:'السلامة من الحرائق في المنشآت',bodyEn:'Fire can threaten people, property and normal operations. Early detection, clear reporting, good housekeeping and safe storage reduce risk. Life safety is the first priority. Security personnel support prevention and the initial response according to the site emergency plan.',bodyAr:'قد يهدد الحريق الأشخاص والممتلكات واستمرارية العمل. ويساعد الكشف المبكر والإبلاغ الواضح والنظافة الجيدة والتخزين الآمن على تقليل الخطر. سلامة الأرواح هي الأولوية الأولى. ويدعم أفراد الأمن الوقاية والاستجابة الأولية وفق خطة الطوارئ بالموقع.',videoUrl:'',questions:[
{q:'What is the first priority during a fire emergency? / ما الأولوية الأولى أثناء طوارئ الحريق؟',a:['Life safety / سلامة الأرواح','Property records / سجلات الممتلكات','Routine work / العمل الروتيني','Vehicle movement / حركة المركبات'],correct:0},
{q:'Which action supports fire prevention? / أي إجراء يدعم الوقاية من الحريق؟',a:['Good housekeeping and safe storage / النظافة الجيدة والتخزين الآمن','Blocking exits / إعاقة المخارج','Ignoring damaged equipment / تجاهل المعدات التالفة','Storing waste beside heat sources / تخزين المخلفات قرب مصادر الحرارة'],correct:0},
{q:'Why is early detection important? / لماذا يعد الكشف المبكر مهماً؟',a:['It supports faster safe response / يدعم الاستجابة الآمنة بشكل أسرع','It removes the need for alarms / يلغي الحاجة إلى الإنذارات','It guarantees no injuries / يضمن عدم حدوث إصابات','It replaces evacuation planning / يحل محل خطة الإخلاء'],correct:0},
{q:'What is a security officer expected to support? / ماذا يُتوقع من مسؤول الأمن أن يدعم؟',a:['Prevention and initial response within training / الوقاية والاستجابة الأولية ضمن التدريب','Fire-service command / قيادة فرق الإطفاء','Building design / تصميم المبنى','Electrical repair / إصلاح الكهرباء'],correct:0},
{q:'What should guide the initial response? / ما الذي يجب أن يوجه الاستجابة الأولية؟',a:['The site emergency plan and training / خطة طوارئ الموقع والتدريب','Personal guesses / التخمين الشخصي','Social media / وسائل التواصل الاجتماعي','Visitor preference / رغبة الزوار'],correct:0}]},
{id:'m1s4',slide:7,titleEn:'The Fire Triangle',titleAr:'مثلث الحريق',bodyEn:'The basic fire triangle consists of heat, fuel and oxygen. Combustion needs these elements in suitable conditions. Removing or controlling one element can interrupt combustion.',bodyAr:'يتكون مثلث الحريق الأساسي من الحرارة والوقود والأكسجين. ويحتاج الاحتراق إلى هذه العناصر في ظروف مناسبة. ويمكن أن يؤدي إزالة أحد العناصر أو التحكم فيه إلى إيقاف الاحتراق.',videoUrl:'',questions:[
{q:'Which three elements form the basic fire triangle? / ما العناصر الثلاثة لمثلث الحريق؟',a:['Heat, fuel and oxygen / الحرارة والوقود والأكسجين','Smoke, water and alarm / الدخان والماء والإنذار','Fuel, alarm and light / الوقود والإنذار والضوء','Heat, hose and radio / الحرارة والخرطوم واللاسلكي'],correct:0},
{q:'What can happen when one triangle element is controlled? / ماذا يمكن أن يحدث عند التحكم في أحد عناصر المثلث؟',a:['Combustion can be interrupted / يمكن إيقاف الاحتراق','The fire must grow / يجب أن يكبر الحريق','The alarm becomes unnecessary / تصبح الإنذارات غير ضرورية','The building becomes safe automatically / يصبح المبنى آمناً تلقائياً'],correct:0},
{q:'Which is an example of fuel? / أي مما يلي مثال على الوقود؟',a:['Wood / الخشب','Oxygen / الأكسجين','Heat / الحرارة','Alarm sound / صوت الإنذار'],correct:0},
{q:'Which is an example of heat? / أي مما يلي مثال على الحرارة؟',a:['A hot surface / سطح ساخن','Paper / ورق','Oxygen / أكسجين','An assembly point / نقطة تجمع'],correct:0},
{q:'Where does oxygen commonly come from during a normal fire? / من أين يأتي الأكسجين عادةً أثناء الحريق؟',a:['Surrounding air / الهواء المحيط','The alarm panel / لوحة الإنذار','The extinguisher label / ملصق الطفاية','The access register / سجل الدخول'],correct:0}]},
{id:'m1s5',slide:8,titleEn:'The Fire Tetrahedron',titleAr:'رباعي أوجه الحريق',bodyEn:'The fire tetrahedron adds a fourth element: the chemical chain reaction. Heat, fuel, oxygen and the chain reaction work together to sustain combustion. Interrupting the chain reaction can help stop the fire.',bodyAr:'يضيف رباعي أوجه الحريق عنصراً رابعاً هو التفاعل الكيميائي المتسلسل. وتعمل الحرارة والوقود والأكسجين والتفاعل المتسلسل معاً لاستمرار الاحتراق. ويمكن أن يساعد إيقاف التفاعل المتسلسل في إخماد الحريق.',videoUrl:'',questions:[
{q:'What is the fourth element of the fire tetrahedron? / ما العنصر الرابع في رباعي أوجه الحريق؟',a:['Chemical chain reaction / التفاعل الكيميائي المتسلسل','Water / الماء','Smoke / الدخان','Alarm signal / إشارة الإنذار'],correct:0},
{q:'How many elements are represented in the tetrahedron? / كم عنصراً يمثلها رباعي الأوجه؟',a:['Four / أربعة','Two / اثنان','Three / ثلاثة','Six / ستة'],correct:0},
{q:'What does the chain reaction help sustain? / ماذا يساعد التفاعل المتسلسل على استمراره؟',a:['Combustion / الاحتراق','Evacuation / الإخلاء','Alarm testing / اختبار الإنذار','Headcount / إحصاء الأفراد'],correct:0},
{q:'What may help stop a fire? / ما الذي قد يساعد على إيقاف الحريق؟',a:['Interrupting one or more required elements / إيقاف أحد العناصر المطلوبة أو أكثر','Adding more fuel / إضافة مزيد من الوقود','Blocking exits / إغلاق المخارج','Ignoring the alarm / تجاهل الإنذار'],correct:0},
{q:'Which element is NOT part of the fire tetrahedron? / أي عنصر ليس جزءاً من رباعي أوجه الحريق؟',a:['Assembly point / نقطة التجمع','Heat / الحرارة','Fuel / الوقود','Oxygen / الأكسجين'],correct:0}]},
{id:'m1s6',slide:9,titleEn:'Heat Release Rate (HRR) and Fire Growth',titleAr:'معدل إطلاق الحرارة وتطور الحريق',bodyEn:'Heat Release Rate (HRR) describes the rate at which a fire releases energy. It is not simply a measure of temperature increase. Fire growth varies with fuel, ventilation, geometry and other conditions. Higher HRR can reduce available response time and make escape more difficult.',bodyAr:'يصف معدل إطلاق الحرارة (HRR) معدل إطلاق الحريق للطاقة. وهو ليس مجرد قياس لارتفاع درجة الحرارة. ويختلف تطور الحريق بحسب الوقود والتهوية وشكل المكان وعوامل أخرى. وقد يؤدي ارتفاع HRR إلى تقليل الوقت المتاح للاستجابة وزيادة صعوبة الهروب.',videoUrl:'',questions:[
{q:'What does HRR describe? / ماذا يصف HRR؟',a:['The rate of energy release / معدل إطلاق الطاقة','The number of alarms / عدد الإنذارات','The building height / ارتفاع المبنى','The number of exits / عدد المخارج'],correct:0},
{q:'Is HRR simply a measure of temperature increase? / هل HRR مجرد قياس لارتفاع درجة الحرارة؟',a:['No / لا','Yes / نعم','Only at night / فقط ليلاً','Only during drills / فقط أثناء التمارين'],correct:0},
{q:'Which factor can affect fire growth? / أي عامل يمكن أن يؤثر في تطور الحريق؟',a:['Fuel and ventilation / الوقود والتهوية','Visitor names / أسماء الزوار','Certificate format / شكل الشهادة','Parking fees / رسوم المواقف'],correct:0},
{q:'What can higher HRR do to response time? / ماذا يمكن أن يفعل ارتفاع HRR بوقت الاستجابة؟',a:['Reduce the available response window / يقلل الوقت المتاح للاستجابة','Always increase it / يزيده دائماً','Have no possible effect / لا يمكن أن يؤثر','Stop alarms / يوقف الإنذارات'],correct:0},
{q:'Why should the course avoid a universal fire-doubling time? / لماذا يجب تجنب تحديد زمن موحد لتضاعف الحريق؟',a:['Fire growth depends on conditions / لأن تطور الحريق يعتمد على الظروف','All fires grow identically / لأن جميع الحرائق تتطور بالطريقة نفسها','Temperature is irrelevant / لأن الحرارة غير مهمة','Ventilation has no effect / لأن التهوية لا تؤثر'],correct:0}]},
{id:'m1s7',slide:10,titleEn:'Heat Transfer: Convection',titleAr:'انتقال الحرارة: الحمل الحراري',bodyEn:'Convection transfers heat through moving fluids, especially hot gases. Hot gases can rise and collect near ceilings and may contribute to fire and smoke movement into other areas. Smoke can contain toxic gases and can make escape difficult.',bodyAr:'ينقل الحمل الحراري الحرارة عبر الموائع المتحركة، وخاصة الغازات الساخنة. وقد ترتفع الغازات الساخنة وتتجمع قرب الأسقف وتساهم في انتقال الحريق والدخان إلى مناطق أخرى. وقد يحتوي الدخان على غازات سامة ويجعل الهروب صعباً.',videoUrl:'',questions:[
{q:'What mainly transfers heat in convection? / ما الذي ينقل الحرارة أساساً في الحمل الحراري؟',a:['Moving hot gases / الغازات الساخنة المتحركة','Solid metal only / المعادن الصلبة فقط','Paper labels / ملصقات الورق','Alarm sounds / أصوات الإنذار'],correct:0},
{q:'Where can hot gases collect? / أين يمكن أن تتجمع الغازات الساخنة؟',a:['Near ceilings / قرب الأسقف','Only under floors / أسفل الأرضيات فقط','Inside registers / داخل السجلات','Only outdoors / في الخارج فقط'],correct:0},
{q:'What can convection contribute to? / إلى ماذا يمكن أن يساهم الحمل الحراري؟',a:['Smoke and heat movement / انتقال الدخان والحرارة','Certificate printing / طباعة الشهادات','Access control programming / برمجة التحكم بالدخول','Visitor registration / تسجيل الزوار'],correct:0},
{q:'Why is smoke dangerous? / لماذا يعتبر الدخان خطراً؟',a:['It may contain toxic gases and reduce visibility / قد يحتوي على غازات سامة ويقلل الرؤية','It is always harmless / هو غير ضار دائماً','It improves visibility / يحسن الرؤية','It stops all heat transfer / يوقف انتقال الحرارة'],correct:0},
{q:'What should occupants do when smoke makes a route unsafe? / ماذا يجب أن يفعل الأشخاص إذا أصبح المسار غير آمن بسبب الدخان؟',a:['Follow the emergency plan and use a safe route / اتباع خطة الطوارئ واستخدام مسار آمن','Continue into heavy smoke / الاستمرار داخل الدخان الكثيف','Hide in the fire area / الاختباء في منطقة الحريق','Disable the alarm / تعطيل الإنذار'],correct:0}]},
{id:'m1s8',slide:11,titleEn:'Heat Transfer: Conduction and Radiation',titleAr:'انتقال الحرارة: التوصيل والإشعاع',bodyEn:'Conduction transfers heat through solid materials such as metal. Radiation transfers heat through electromagnetic energy and does not require direct contact. Both mechanisms can contribute to ignition away from the original flame.',bodyAr:'ينقل التوصيل الحرارة عبر المواد الصلبة مثل المعادن. وينقل الإشعاع الحرارة عبر الطاقة الكهرومغناطيسية ولا يتطلب تلامساً مباشراً. ويمكن لكل منهما أن يساهم في اشتعال مواد بعيداً عن اللهب الأصلي.',videoUrl:'',questions:[
{q:'What is conduction? / ما هو التوصيل؟',a:['Heat transfer through solid materials / انتقال الحرارة عبر المواد الصلبة','Heat transfer only through alarms / انتقال الحرارة عبر الإنذارات فقط','Movement of people / حركة الأشخاص','A type of evacuation / نوع من الإخلاء'],correct:0},
{q:'Which material can conduct heat? / أي مادة يمكنها توصيل الحرارة؟',a:['Metal / المعدن','An access card / بطاقة دخول','A radio message / رسالة لاسلكية','An assembly list / قائمة التجمع'],correct:0},
{q:'What is radiation? / ما هو الإشعاع؟',a:['Heat transfer through electromagnetic energy / انتقال الحرارة عبر الطاقة الكهرومغناطيسية','Water movement through pipes / حركة الماء في الأنابيب','Smoke detection / كشف الدخان','Alarm testing / اختبار الإنذار'],correct:0},
{q:'Does radiation require direct contact with the receiving material? / هل يتطلب الإشعاع تلامساً مباشراً مع المادة المستقبلة؟',a:['No / لا','Yes, always / نعم دائماً','Only in water / فقط في الماء','Only during drills / فقط أثناء التمارين'],correct:0},
{q:'Why are conduction and radiation important in fire safety? / لماذا يعد التوصيل والإشعاع مهمين في السلامة من الحرائق؟',a:['They can contribute to ignition away from the original flame / يمكن أن يسهما في الاشتعال بعيداً عن اللهب الأصلي','They prevent all fire spread / يمنعان كل انتشار للحريق','They replace alarms / يحلان محل الإنذارات','They remove oxygen automatically / يزيلان الأكسجين تلقائياً'],correct:0}]},
{id:'m1s9',slide:12,titleEn:'Direct Burning and Ignition Sources',titleAr:'الاحتراق المباشر ومصادر الاشتعال',bodyEn:'Direct burning occurs when flame, embers or another hot ignition source contacts combustible material. Smoking materials are a known ignition hazard. Do not use an unsupported universal percentage for commercial fires; the frequency varies by place and data source.',bodyAr:'يحدث الاحتراق المباشر عندما يلامس اللهب أو الجمر أو مصدر إشعال ساخن آخر مادة قابلة للاحتراق. وتعد مواد التدخين من مصادر الاشتعال المعروفة. ولا ينبغي استخدام نسبة موحدة غير موثقة لحرائق المنشآت التجارية، لأن المعدلات تختلف حسب المكان ومصدر البيانات.',videoUrl:'',questions:[
{q:'What is direct burning? / ما هو الاحتراق المباشر؟',a:['Contact between an ignition source and combustible material / تلامس مصدر الاشتعال مع مادة قابلة للاحتراق','Heat transfer only through metal / انتقال الحرارة عبر المعدن فقط','A type of alarm / نوع من الإنذار','A method of headcount / طريقة لإحصاء الأفراد'],correct:0},
{q:'Which can be an ignition hazard? / أي مما يلي يمكن أن يكون مصدراً للاشتعال؟',a:['A lit smoking material / مادة تدخين مشتعلة','An assembly sign / لوحة نقطة التجمع','A clean exit / مخرج خالٍ من العوائق','A training record / سجل تدريب'],correct:0},
{q:'What should happen to smoking materials? / ماذا يجب أن يحدث لمواد التدخين؟',a:['They should be controlled and disposed of safely / يجب التحكم بها والتخلص منها بأمان','They should be placed in paper waste / توضع في مخلفات الورق','They should be left near heat / تترك قرب الحرارة','They should be stored with fuel / تخزن مع الوقود'],correct:0},
{q:'Why should unsupported percentages be avoided? / لماذا يجب تجنب النسب غير الموثقة؟',a:['Fire statistics vary by place and data source / تختلف إحصاءات الحرائق حسب المكان ومصدر البيانات','All fire statistics are identical / كل الإحصاءات متطابقة','Statistics are never useful / الإحصاءات غير مفيدة أبداً','Numbers replace procedures / الأرقام تحل محل الإجراءات'],correct:0},
{q:'What is a practical prevention action? / ما الإجراء الوقائي العملي؟',a:['Keep ignition sources away from combustibles / إبقاء مصادر الاشتعال بعيداً عن المواد القابلة للاحتراق','Store waste beside heaters / تخزين المخلفات بجانب السخانات','Block waste containers / إعاقة حاويات المخلفات','Ignore damaged bins / تجاهل الحاويات التالفة'],correct:0}]},
{id:'m1s10',slide:13,titleEn:'Industrial and Utility Hazard Areas',titleAr:'مناطق المخاطر الصناعية والخدمية',bodyEn:'Security patrols should identify hazards such as high-heat equipment, electrical rooms, flammable-liquid storage and hot-work areas. Security personnel should observe, report and follow site procedures rather than perform specialist maintenance.',bodyAr:'ينبغي أن تحدد الدوريات الأمنية مخاطر مثل معدات الحرارة العالية وغرف الكهرباء وتخزين السوائل القابلة للاشتعال ومناطق الأعمال الساخنة. ويجب على أفراد الأمن الملاحظة والإبلاغ واتباع إجراءات الموقع بدلاً من تنفيذ أعمال الصيانة التخصصية.',videoUrl:'',questions:[
{q:'What should security patrols identify? / ماذا يجب أن تحدد الدوريات الأمنية؟',a:['Fire hazards and unsafe conditions / مخاطر الحريق والظروف غير الآمنة','Only visitor names / أسماء الزوار فقط','Only parking spaces / أماكن الوقوف فقط','Only office furniture / أثاث المكاتب فقط'],correct:0},
{q:'Why can electrical rooms be a fire concern? / لماذا قد تمثل غرف الكهرباء مصدر قلق من الحريق؟',a:['Electrical faults or overloads can create heat or sparks / قد تولد الأعطال أو الأحمال الزائدة حرارة أو شرراً','They always contain water / لأنها تحتوي دائماً على الماء','They cannot overheat / لا يمكن أن ترتفع حرارتها','They replace fire alarms / لأنها تحل محل إنذارات الحريق'],correct:0},
{q:'How should flammable-liquid storage be managed? / كيف يجب إدارة تخزين السوائل القابلة للاشتعال؟',a:['According to approved storage and site procedures / وفق متطلبات التخزين المعتمدة وإجراءات الموقع','Beside open flames / بجانب اللهب المكشوف','In unmarked areas / في مناطق غير محددة','With ignition sources / مع مصادر الاشتعال'],correct:0},
{q:'What should security do with a specialist maintenance defect? / ماذا يفعل الأمن عند ملاحظة عطل يحتاج إلى صيانة تخصصية؟',a:['Report it through the approved process / الإبلاغ عنه عبر الإجراء المعتمد','Repair it without training / إصلاحه دون تدريب','Ignore it / تجاهله','Disable the system / تعطيل النظام'],correct:0},
{q:'What is important in hot-work areas? / ما المهم في مناطق الأعمال الساخنة؟',a:['Approved hot-work controls and monitoring / ضوابط الأعمال الساخنة المعتمدة والمراقبة','Uncontrolled flames / اللهب غير المنضبط','Blocked exits / المخارج المعاقة','Unreported ignition sources / مصادر الاشتعال غير المبلغ عنها'],correct:0}]},
{id:'m1s11',slide:14,titleEn:'Kitchen and Laundry Fire Hazards',titleAr:'مخاطر الحريق في المطابخ ومناطق الغسيل',bodyEn:'Laundry areas can contain combustible lint near heat sources. Cooking areas may contain hot surfaces, open flames and cooking oils. Good cleaning, safe storage and clear access to fire equipment are important preventive controls.',bodyAr:'قد تحتوي مناطق الغسيل على نسالة قابلة للاحتراق قرب مصادر الحرارة. وقد تحتوي مناطق الطهي على أسطح ساخنة ولهب مكشوف وزيوت طهي. وتعد النظافة الجيدة والتخزين الآمن وخلو الوصول إلى معدات الحريق من العوائق من وسائل الوقاية المهمة.',videoUrl:'',questions:[
{q:'What combustible material can build up in laundry areas? / ما المادة القابلة للاحتراق التي قد تتراكم في مناطق الغسيل؟',a:['Lint / النسالة','Water / الماء','Metal / المعدن','Glass / الزجاج'],correct:0},
{q:'Why should lint filters be maintained? / لماذا يجب صيانة فلاتر النسالة؟',a:['To reduce combustible build-up and fire risk / لتقليل تراكم المواد القابلة للاحتراق وخطر الحريق','To increase lint / لزيادة النسالة','To block ventilation / لإعاقة التهوية','To disable dryers / لتعطيل المجففات'],correct:0},
{q:'Which hazards may be present in kitchens? / ما المخاطر التي قد توجد في المطابخ؟',a:['Hot surfaces, flames and cooking oils / الأسطح الساخنة واللهب وزيوت الطهي','Only cold water / الماء البارد فقط','Only office paper / ورق المكاتب فقط','Only alarm panels / لوحات الإنذار فقط'],correct:0},
{q:'What does good housekeeping support? / ماذا تدعم النظافة والترتيب الجيدان؟',a:['Fire prevention / الوقاية من الحريق','Blocked access / إعاقة الوصول','More fuel accumulation / زيادة تراكم الوقود','Delayed reporting / تأخير الإبلاغ'],correct:0},
{q:'What should remain clear in a kitchen or laundry area? / ماذا يجب أن يبقى خالياً من العوائق؟',a:['Access to emergency equipment and exits / الوصول إلى معدات الطوارئ والمخارج','Waste around heaters / المخلفات حول السخانات','Fire doors / أبواب الحريق','Electrical panels / اللوحات الكهربائية'],correct:0}]},
{id:'m1s12',slide:15,titleEn:'Housekeeping and Clutter Hazards',titleAr:'مخاطر الفوضى وسوء الترتيب',bodyEn:'Blocked exits, obstructed fire equipment, combustible waste and oily materials can increase fire risk. Security patrols should identify and report unsafe conditions promptly. Emergency lighting and doorways should remain available according to site requirements.',bodyAr:'قد تزيد المخارج المعاقة ومعدات الحريق المحجوبة والمخلفات القابلة للاحتراق والمواد الزيتية من خطر الحريق. وينبغي للدوريات الأمنية تحديد الظروف غير الآمنة والإبلاغ عنها بسرعة. ويجب أن تبقى إنارة الطوارئ والمداخل متاحة وفق متطلبات الموقع.',videoUrl:'',questions:[
{q:'What should security check during housekeeping patrols? / ماذا يجب أن يفحص الأمن أثناء دوريات النظافة والترتيب؟',a:['Clear exits and accessible fire equipment / خلو المخارج وسهولة الوصول إلى معدات الحريق','Blocked corridors / الممرات المعاقة','Waste beside heat sources / المخلفات قرب مصادر الحرارة','Locked emergency equipment / معدات الطوارئ المغلقة'],correct:0},
{q:'Why are oily materials a concern? / لماذا تمثل المواد الزيتية مصدر قلق؟',a:['They can contribute to fire risk and ignition / يمكن أن تساهم في خطر الحريق والاشتعال','They always prevent fire / تمنع الحريق دائماً','They cool equipment / تبرد المعدات','They replace fire blankets / تحل محل بطانيات الحريق'],correct:0},
{q:'What should happen when an unsafe condition is found? / ماذا يجب أن يحدث عند اكتشاف حالة غير آمنة؟',a:['Report it promptly through site procedures / الإبلاغ عنها بسرعة وفق إجراءات الموقع','Ignore it / تجاهلها','Hide it / إخفاؤها','Wait until after an emergency / الانتظار حتى وقوع الطوارئ'],correct:0},
{q:'Why must exits remain clear? / لماذا يجب أن تبقى المخارج خالية؟',a:['To support safe evacuation / لدعم الإخلاء الآمن','To store equipment / لتخزين المعدات','To reduce lighting / لتقليل الإضاءة','To block smoke / لإعاقة الدخان'],correct:0},
{q:'What should security do with failed emergency lighting? / ماذا يفعل الأمن عند تعطل إنارة الطوارئ؟',a:['Report the defect and follow the site process / الإبلاغ عن العطل واتباع إجراء الموقع','Remove all exit signs / إزالة لوحات المخارج','Ignore it / تجاهله','Block the exit / إغلاق المخرج'],correct:0}]},
{id:'m1s13',slide:16,titleEn:'Module 1 Review',titleAr:'مراجعة الوحدة الأولى',bodyEn:'Review the key ideas: life safety, the fire triangle and tetrahedron, HRR, heat transfer, ignition sources and facility hazards. Use the knowledge check to confirm mastery before continuing.',bodyAr:'راجع الأفكار الأساسية: سلامة الأرواح، مثلث الحريق ورباعي الأوجه، معدل إطلاق الحرارة، انتقال الحرارة، مصادر الاشتعال ومخاطر المنشآت. استخدم اختبار المعرفة للتأكد من الإتقان قبل المتابعة.',videoUrl:'',questions:[
{q:'Which is the first priority in a fire emergency? / ما الأولوية الأولى في طوارئ الحريق؟',a:['Life safety / سلامة الأرواح','Property paperwork / أوراق الممتلكات','Routine patrol reporting / تقارير الدوريات الروتينية','Parking control / تنظيم المواقف'],correct:0},
{q:'Which element is added to the fire triangle to form the tetrahedron? / ما العنصر المضاف إلى مثلث الحريق لتكوين رباعي الأوجه؟',a:['Chemical chain reaction / التفاعل الكيميائي المتسلسل','Assembly point / نقطة التجمع','Alarm panel / لوحة الإنذار','Fire door / باب الحريق'],correct:0},
{q:'What does HRR describe? / ماذا يصف HRR؟',a:['Rate of energy release / معدل إطلاق الطاقة','Number of exits / عدد المخارج','Alarm volume / مستوى صوت الإنذار','Building occupancy / إشغال المبنى'],correct:0},
{q:'Which is a heat-transfer method? / أي مما يلي طريقة لانتقال الحرارة؟',a:['Conduction / التوصيل','Registration / التسجيل','Headcount / الإحصاء','Access control / التحكم بالدخول'],correct:0},
{q:'What is a good patrol practice? / ما الممارسة الجيدة أثناء الدورية؟',a:['Identify, report and follow site procedures for hazards / تحديد المخاطر والإبلاغ عنها واتباع إجراءات الموقع','Repair specialist systems without training / إصلاح الأنظمة التخصصية دون تدريب','Ignore blocked exits / تجاهل المخارج المعاقة','Store waste near heat / تخزين المخلفات قرب الحرارة'],correct:0}]}
],m2:[
{id:'m2s1',titleEn:'Fire Classification',titleAr:'تصنيف الحرائق',bodyEn:'Classifying a fire by the fuel involved helps personnel select suitable equipment and communicate the hazard. Always follow current local procedures and extinguisher labels.',bodyAr:'يساعد تصنيف الحريق حسب نوع الوقود على اختيار وسيلة الإطفاء المناسبة والتواصل بشأن الخطر. يجب دائمًا اتباع الإجراءات المحلية الحالية وملصقات طفايات الحريق.',videoUrl:'',questions:[
{q:'Why is fire classification useful?',a:['It helps identify suitable extinguishing equipment','It removes the need for evacuation','It replaces the emergency plan','It guarantees a fire is small'],correct:0},
{q:'What should be checked before using an extinguisher?',a:['Its label and site procedures','Only its color','Only its weight','The parking plan'],correct:0},
{q:'Who should use fire equipment?',a:['People trained and authorized to do so','Anyone who sees a fire','Only visitors','Only reception staff'],correct:0}]},
{id:'m2s2',titleEn:'Portable Extinguishing Agents',titleAr:'وسائط الإطفاء المحمولة',bodyEn:'Different fires require suitable extinguishing agents. Equipment must match the fire type and be used only when conditions are safe and the person is trained.',bodyAr:'تتطلب أنواع الحرائق المختلفة وسائط إطفاء مناسبة. يجب أن تتوافق المعدة مع نوع الحريق وأن تستخدم فقط عندما تكون الظروف آمنة والشخص مدربًا.',videoUrl:'',questions:[
{q:'Why must the extinguisher match the fire?',a:['An unsuitable agent can be ineffective or unsafe','All extinguishers work on every fire','It changes the alarm code','It removes the need for training'],correct:0},
{q:'When should a portable extinguisher be used?',a:['Only when trained and conditions are safe','Whenever smoke is visible','Before raising the alarm','When an escape route is blocked'],correct:0},
{q:'Where should the escape route be?',a:['Clear and available behind the user','Blocked by equipment','Outside the building only','Inside the fire room'],correct:0}]},
{id:'m2s3',titleEn:'PASS and Fire Blankets',titleAr:'طريقة PASS وبطانيات الحريق',bodyEn:'PASS means Pull, Aim, Squeeze and Sweep. A fire blanket may be used on a small contained fire when appropriate and safe.',bodyAr:'تعني PASS: اسحب، وجّه، اضغط، وحرّك. ويمكن استخدام بطانية الحريق على حريق صغير ومحدود عندما يكون ذلك مناسبًا وآمنًا.',videoUrl:'',questions:[
{q:'What does PASS begin with?',a:['Pull','Aim','Squeeze','Sweep'],correct:0},
{q:'What is a fire blanket mainly intended to do?',a:['Smother a small contained fire','Increase oxygen','Cool an entire building','Replace evacuation'],correct:0},
{q:'After using a fire blanket on a small fire, what should be done?',a:['Leave it in place and follow emergency procedures','Remove it immediately','Return to normal work','Ignore the alarm'],correct:0}]}
],
m3:[
{id:'m3s1',titleEn:'Fire Detection and Alarm Systems',titleAr:'أنظمة كشف وإنذار الحريق',bodyEn:'Buildings may use detectors, alarms and a control panel. Security personnel should know the installed system and authorized response procedures.',bodyAr:'قد تستخدم المنشآت كواشف وإنذارات ولوحة تحكم. ويجب أن يعرف أفراد الأمن النظام المركب وإجراءات الاستجابة المعتمدة.',videoUrl:'',questions:[
{q:'What should security personnel know about an alarm system?',a:['The installed system and authorized procedures','How to redesign it','How to disable it','Only its color'],correct:0},
{q:'A control panel can help identify:',a:['The indicated alarm location','The final certificate score','The visitor list','The weather'],correct:0},
{q:'Should alarms be ignored until smoke is visible?',a:['No','Yes','Only at night','Only during drills'],correct:0}]},
{id:'m3s2',titleEn:'Responding to an Alarm',titleAr:'الاستجابة للإنذار',bodyEn:'Use the approved response sequence. Locate the indicated area, verify safely through authorized methods and escalate according to site procedures.',bodyAr:'استخدم تسلسل الاستجابة المعتمد. حدد المنطقة المشار إليها وتحقق بطريقة آمنة من خلال الوسائل المصرح بها وصعّد البلاغ وفق إجراءات الموقع.',videoUrl:'',questions:[
{q:'How should an alarm be checked?',a:['Using authorized and safe procedures','By entering any fire area immediately','By switching off the alarm','By waiting for others to notice'],correct:0},
{q:'If a fire is confirmed, what should happen?',a:['Raise the alarm and start emergency procedures','Hide the information','Continue routine duties','Block emergency access'],correct:0},
{q:'What should guide the response?',a:['Site emergency procedures','Personal guesses','Social media posts','Visitor requests'],correct:0}]},
{id:'m3s3',titleEn:'RACE: Discovering a Fire',titleAr:'RACE: عند اكتشاف حريق',bodyEn:'RACE: Rescue people from immediate danger when safe; Alert others; Confine by closing doors if safe; Extinguish only if trained, safe and the fire is small.',bodyAr:'RACE: إنقاذ الأشخاص من الخطر المباشر عندما يكون ذلك آمنًا؛ تنبيه الآخرين؛ حصر الحريق بإغلاق الأبواب إذا كان آمنًا؛ وإطفاؤه فقط عند التدريب وتوافر الأمان وصغر الحريق.',videoUrl:'',questions:[
{q:'What does the A in RACE mean?',a:['Alert','Aim','Assess','Access'],correct:0},
{q:'When should you extinguish a fire?',a:['Only if trained, safe and the fire is small','Whenever the alarm sounds','Before warning people','If smoke is heavy'],correct:0},
{q:'What does Confine mean in RACE?',a:['Close doors if safe to limit fire spread','Move everyone into the fire room','Disable alarms','Open all doors'],correct:0}]}
],
m4:[
{id:'m4s1',titleEn:'Before Fighting a Fire',titleAr:'قبل محاولة إطفاء الحريق',bodyEn:'Keep an escape route clear, warn people, begin evacuation when required and use equipment only within training and site procedures.',bodyAr:'حافظ على طريق هروب واضح، وحذّر الأشخاص، وابدأ الإخلاء عند الحاجة، واستخدم المعدات فقط ضمن التدريب وإجراءات الموقع.',videoUrl:'',questions:[
{q:'What must remain available before using an extinguisher?',a:['A clear escape route','A locked exit','A blocked corridor','A closed alarm panel'],correct:0},
{q:'When should you retreat?',a:['If the fire grows, smoke increases or escape is threatened','Only after the fire is extinguished','Never','Only when a supervisor leaves'],correct:0},
{q:'What takes priority over property protection?',a:['Life safety','Vehicle movement','Paperwork','Cleaning'],correct:0}]},
{id:'m4s2',titleEn:'Facility Fire Plans and Site Procedures',titleAr:'خطط الحريق وإجراءات المنشأة',bodyEn:'Know exits, alarm signals, emergency contacts, assembly points and the responsibilities assigned to security and fire wardens.',bodyAr:'اعرف المخارج وإشارات الإنذار وجهات الاتصال في الطوارئ ونقاط التجمع والمسؤوليات الموكلة إلى الأمن ومراقبي الحريق.',videoUrl:'',questions:[
{q:'Why should security personnel know the fire plan?',a:['To support a coordinated and safe response','To replace emergency responders','To change building design','To avoid reporting incidents'],correct:0},
{q:'Which location should be known in advance?',a:['Assembly point','Private office only','Parking payment desk','Cafeteria menu'],correct:0},
{q:'Emergency contacts should be:',a:['Known and available through site procedures','Kept secret from security','Used only after evacuation ends','Stored only on paper in a locked room'],correct:0}]},
{id:'m4s3',titleEn:'Security Vigilance and Deliberate Fire',titleAr:'اليقظة الأمنية والحريق المتعمد',bodyEn:'Observe and report facts such as suspicious activity, tampering with alarms or unusual ignition materials. Avoid unsupported accusations.',bodyAr:'راقب وأبلغ عن الحقائق مثل النشاط المشبوه أو العبث بأجهزة الإنذار أو وجود مواد إشعال غير معتادة. وتجنب الاتهامات غير المدعومة بالأدلة.',videoUrl:'',questions:[
{q:'What should security staff report?',a:['Objective observations through site procedures','Rumors','Unsupported accusations','Personal social media posts'],correct:0},
{q:'What may require attention?',a:['Tampering with alarms or detectors','A normal meeting','A clean exit','A posted emergency map'],correct:0},
{q:'What should be avoided?',a:['Unsupported accusations','Factual reporting','Following procedures','Preserving evidence'],correct:0}]}
],
m5:[
{id:'m5s1',titleEn:'Emergency Evacuation',titleAr:'الإخلاء في حالات الطوارئ',bodyEn:'Know exits, escape routes and assembly points. Keep emergency access, exits, hydrants and hose reels clear.',bodyAr:'اعرف المخارج ومسارات الهروب ونقاط التجمع. وحافظ على خلو مسارات الطوارئ والمخارج ومآخذ المياه وبكرات الخراطيم.',videoUrl:'',questions:[
{q:'What should people know before an emergency?',a:['Exits, routes and assembly points','Only the nearest lift','Only the parking area','Only the reception desk'],correct:0},
{q:'Emergency access should be:',a:['Kept clear','Used for parking','Blocked by equipment','Closed permanently'],correct:0},
{q:'What is an assembly point for?',a:['Safe gathering and accountability after evacuation','Storing extinguishers','Parking vehicles','Replacing the alarm system'],correct:0}]},
{id:'m5s2',titleEn:'Directing an Evacuation',titleAr:'توجيه عملية الإخلاء',bodyEn:'Stay calm, give clear directions, assist people who need support and support accountability at the assembly point.',bodyAr:'حافظ على الهدوء، وقدّم توجيهات واضحة، وساعد الأشخاص الذين يحتاجون إلى دعم، وساهم في حصر الأفراد عند نقطة التجمع.',videoUrl:'',questions:[
{q:'How should evacuation directions be given?',a:['Calmly and clearly','By shouting conflicting instructions','Without following the plan','Only after everyone leaves'],correct:0},
{q:'Who may need additional assistance?',a:['People requiring support','Only supervisors','Only visitors','No one'],correct:0},
{q:'What is accountability used for?',a:['Checking who reached the assembly point','Counting vehicles','Checking room temperatures','Issuing certificates'],correct:0}]},
{id:'m5s3',titleEn:'Incident Command and Final Review',titleAr:'إدارة الحوادث والمراجعة النهائية',bodyEn:'Incident command supports organized emergency response. Learners should connect fire recognition, alarm, evacuation, communication and safe decision-making.',bodyAr:'تساعد إدارة الحوادث على تنظيم الاستجابة للطوارئ. ويجب على المتدرب ربط التعرف على الحريق والإنذار والإخلاء والتواصل واتخاذ القرار الآمن.',videoUrl:'',questions:[
{q:'What is a main purpose of incident command?',a:['Organize the emergency response','Replace all site procedures','Prevent communication','Delay evacuation'],correct:0},
{q:'Which elements should be connected during the course?',a:['Recognition, alarm, evacuation and communication','Parking, catering and finance','Sales, marketing and travel','Only equipment cleaning'],correct:0},
{q:'What is the course mastery threshold for a learning screen?',a:['80%','50%','60%','100%'],correct:0}]}
]};
const FIRE_SCREEN_LIST=Object.values(FIRE_SCREENS).flat();
const screenById=new Map(FIRE_SCREEN_LIST.map(x=>[x.id,x]));

const COURSE_META={
  [FIRE_SLUG]:{
    code:'CRS-FIRE-001',
    en:'FIRE SAFETY & EMERGENCY RESPONSE',
    ar:'السلامة من الحرائق وتدابير الاستجابة للطوارئ',
    mode:'self-study',
    freeOpening:true,
    accessHours:ACCESS_HOURS,
    masteryScore:80,
    finalQuestions:30,
    finalPassScore:70,
    finalRetakes:2,
    modules:[
      {id:'m1',en:'Fundamentals of Fire Science & Building Hazards',ar:'أساسيات علوم الحريق ومخاطر المنشآت'},
      {id:'m2',en:'Fire Classifications & Portable Extinguishing Agents',ar:'تصنيف الحرائق ووسائط الإطفاء المحمولة'},
      {id:'m3',en:'Fire Detection, Alarms & Suppression Systems',ar:'أنظمة كشف وإنذار وإطفاء الحريق'},
      {id:'m4',en:'Tactical Response & Facility Fire Plans',ar:'الاستجابة التكتيكية وخطط الطوارئ بالمنشآت'},
      {id:'m5',en:'Emergency Evacuation & Incident Command',ar:'الإخلاء الطارئ وإدارة الحوادث'}
    ]
  }
};

const sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
const clean=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
const validEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const randomToken=bytes=>crypto.randomBytes(bytes).toString('hex');
const questionOrder=q=>{
  const seed=parseInt(sha(q.q).slice(0,8),16);
  return [0,1,2,3].sort((a,b)=>((seed>>(a*3))&7)-((seed>>(b*3))&7)||a-b);
};

async function sendAccessEmail({to,name,course,token,expiresAt}){
  const apiKey=(process.env.BREVO_API_KEY||'').trim();
  const from=(process.env.MAIL_FROM||'').trim();
  if(!apiKey||!from)return {sent:false,error:'Brevo email settings are not configured'};
  const link=FRONTEND_URL+'#token='+encodeURIComponent(token);
  const expiry=new Date(expiresAt).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'});
  const subject='SECURITY INSTRUCTOR — Fire Safety Self-Study Access';
  const text='Dear '+name+',\\n\\nYour access to '+course.en+' / '+course.ar+' is ready.\\n\\nAccess window: '+course.accessHours+' hours.\\nStart: '+link+'\\nAccess expires: '+expiry+'\\n\\nComplete the learning screens, achieve at least 80% on required knowledge checks, then complete the 30-question final assessment. The final assessment pass mark is 70%.\\n\\nSECURITY INSTRUCTOR';
  const html='<!doctype html><html><body style="font-family:Arial,sans-serif;color:#0B1F33"><h2 style="color:#0B1F33">SECURITY INSTRUCTOR</h2><p>Dear '+name+',</p><p>Your access to <strong>'+course.en+'</strong> / <strong>'+course.ar+'</strong> is ready.</p><p>This is a self-study course. Your access window is <strong>'+course.accessHours+' hours</strong>.</p><p><a href="'+link+'" style="display:inline-block;padding:12px 18px;background:#C8A96B;color:#0B1F33;text-decoration:none;font-weight:bold">START SELF-STUDY / ابدأ الدراسة الذاتية</a></p><p>Access expires: '+expiry+'</p><p>Complete the learning screens, achieve at least 80% on required knowledge checks, then complete the 30-question final assessment. The final assessment pass mark is 70%.</p><p>SECURITY INSTRUCTOR<br>Knowledge • Skills • Safer Tomorrow</p></body></html>';
  const response=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{accept:'application/json','api-key':apiKey,'content-type':'application/json'},body:JSON.stringify({sender:{name:'SECURITY INSTRUCTOR',email:from},replyTo:{email:from},to:[{email:to}],subject,textContent:text,htmlContent:html})});
  if(!response.ok){const detail=await response.text().catch(()=> '');throw new Error('Brevo email failed ('+response.status+'): '+detail.slice(0,300));}
  return {sent:true,error:null};
}
async function findSession(req){
  const h=String(req.headers.authorization||'');
  if(!h.startsWith('Bearer '))return null;
  const token=h.slice(7).trim();
  if(!token)return null;
  const row=await mongoose.connection.collection('selfstudyaccess').findOne({sessionTokenHash:sha(token),status:'active'});
  if(!row||!row.sessionExpiresAt||new Date(row.sessionExpiresAt)<=new Date())return null;
  if(!row.accessExpiresAt||new Date(row.accessExpiresAt)<=new Date()){
    await mongoose.connection.collection('selfstudyaccess').updateOne({_id:row._id},{$set:{status:'expired',updatedAt:new Date()}});
    return null;
  }
  return row;
}

const sessionHandler=async(req,res,next)=>{
  try{req.selfStudy=await findSession(req);if(!req.selfStudy)return res.status(401).json({message:'Self-study access required'});next();}
  catch(e){console.error('Self-study session error',e);res.status(500).json({message:'Unable to validate self-study access'});}
};

const registerHandler=async(req,res)=>{
  try{
    const b=req.body||{};
    const slug=clean(b.courseSlug,80)||FIRE_SLUG;
    const course=COURSE_META[slug];
    if(!course)return res.status(400).json({message:'Self-study course not available'});
    const ar=clean(b.arabicName,180).replace(/\s+/g,' ').split(' ').filter(Boolean);
    const en=clean(b.englishName,180).replace(/\s+/g,' ').split(' ').filter(Boolean);
    const email=clean(b.email,180).toLowerCase();
    const idType=clean(b.idType,30),idNumber=clean(b.idNumber,40),mobile=clean(b.mobile,40);
    if(ar.length!==3||en.length!==3||!validEmail(email)||!idNumber||!mobile||!['national_id','iqama','passport'].includes(idType))return res.status(400).json({message:'Please complete all required registration fields / يرجى استكمال جميع بيانات التسجيل المطلوبة'});
    const db=mongoose.connection;
    const trainees=db.collection('trainees'), enrollments=db.collection('enrollments'), access=db.collection('selfstudyaccess');
    let trainee=await trainees.findOne({idNumber});
    if(trainee){
      await trainees.updateOne({_id:trainee._id},{$set:{arabicFirstName:ar[0],arabicMiddleName:ar[1],arabicLastName:ar[2],englishFirstName:en[0],englishMiddleName:en[1],englishLastName:en[2],idType,mobile,email,updatedAt:new Date()}});
      trainee=await trainees.findOne({_id:trainee._id});
    }else{
      const traineeId=await nextNumber(trainees,'TRN-','traineeId');
      trainee={traineeId,arabicFirstName:ar[0],arabicMiddleName:ar[1],arabicLastName:ar[2],englishFirstName:en[0],englishMiddleName:en[1],englishLastName:en[2],idType,idNumber,mobile,email,createdAt:new Date(),updatedAt:new Date()};
      await trainees.insertOne(trainee);
    }
    let enrollment=await enrollments.findOne({traineeId:trainee.traineeId,courseId:course.code});
    if(!enrollment){
      const enrollmentId=await nextNumber(enrollments,'ENR-','enrollmentId');
      enrollment={enrollmentId,traineeId:trainee.traineeId,courseId:course.code,courseNameEn:course.en,courseNameAr:course.ar,registrationType:'individual',companyName:'',companyContact:'',companyEmail:'',status:'active',score:null,selfStudy:true,registeredAt:new Date(),createdAt:new Date(),updatedAt:new Date()};
      await enrollments.insertOne(enrollment);
    }else if(enrollment.status==='cancelled'){
      await enrollments.updateOne({_id:enrollment._id},{$set:{status:'active',selfStudy:true,updatedAt:new Date()}});
      enrollment=await enrollments.findOne({_id:enrollment._id});
    }
    const now=new Date();
    let row=await access.findOne({enrollmentId:enrollment.enrollmentId,courseSlug:slug});
    if(!row){
      row={accessId:'SSA-'+randomToken(8),enrollmentId:enrollment.enrollmentId,traineeId:trainee.traineeId,courseSlug:slug,status:'active',accessStartsAt:now,accessExpiresAt:new Date(now.getTime()+ACCESS_HOURS*3600000),progress:baseProgress(),createdAt:now,updatedAt:now};
      await access.insertOne(row);
    }else if(!row.accessExpiresAt||new Date(row.accessExpiresAt)<=now){
      const starts=now,expires=new Date(now.getTime()+ACCESS_HOURS*3600000);
      await access.updateOne({_id:row._id},{$set:{status:'active',accessStartsAt:starts,accessExpiresAt:expires,progress:baseProgress(),updatedAt:now}});
      row=await access.findOne({_id:row._id});
    }
    const magic=randomToken(32),magicExpires=new Date(Date.now()+MAGIC_MINUTES*60000);
    await access.updateOne({_id:row._id},{$set:{magicTokenHash:sha(magic),magicTokenExpiresAt:magicExpires,magicUsedAt:null,updatedAt:new Date()}});
    const fullName=[en[0],en[1],en[2]].join(' ');
    const mail=await sendAccessEmail({to:email,name:fullName,course,token:magic,expiresAt:row.accessExpiresAt});
    res.status(201).json({ok:true,message:'Registration received. If the email address is valid, access instructions will be sent to it. / تم استلام التسجيل، وسيتم إرسال تعليمات الدخول إلى البريد الإلكتروني.',traineeId:trainee.traineeId,enrollmentId:enrollment.enrollmentId,mailSent:mail.sent});
  }catch(e){console.error('Self-study registration error',e);res.status(500).json({message:'Unable to complete self-study registration'});}
};

const requestAccessHandler=async(req,res)=>{
  try{
    const email=clean(req.body?.email,180).toLowerCase();
    const enrollmentId=clean(req.body?.enrollmentId,100);
    const generic={ok:true,message:'If the details match an active self-study registration, an access email has been sent. / إذا تطابقت البيانات مع تسجيل نشط للدراسة الذاتية، فسيتم إرسال رسالة الدخول.'};
    if(!validEmail(email)||!enrollmentId)return res.json(generic);
    const enroll=await mongoose.connection.collection('enrollments').findOne({enrollmentId,selfStudy:true});
    if(!enroll)return res.json(generic);
    const trainee=await mongoose.connection.collection('trainees').findOne({traineeId:enroll.traineeId,email});
    if(!trainee)return res.json(generic);
    const course=COURSE_META[FIRE_SLUG];
    let row=await mongoose.connection.collection('selfstudyaccess').findOne({enrollmentId,courseSlug:FIRE_SLUG});
    if(!row)return res.json(generic);
    if(new Date(row.accessExpiresAt)<=new Date())return res.json(generic);
    const magic=randomToken(32),expires=new Date(Date.now()+MAGIC_MINUTES*60000);
    await mongoose.connection.collection('selfstudyaccess').updateOne({_id:row._id},{$set:{magicTokenHash:sha(magic),magicTokenExpiresAt:expires,magicUsedAt:null,updatedAt:new Date()}});
    await sendAccessEmail({to:email,name:[trainee.englishFirstName,trainee.englishMiddleName,trainee.englishLastName].join(' '),course,token:magic,expiresAt:row.accessExpiresAt});
    res.json(generic);
  }catch(e){console.error('Self-study access request error',e);res.json({ok:true,message:'If the details match an active self-study registration, an access email has been sent. / إذا تطابقت البيانات مع تسجيل نشط للدراسة الذاتية، فسيتم إرسال رسالة الدخول.'});}
};

const exchangeHandler=async(req,res)=>{
  try{
    const token=clean(req.body?.token,100);
    if(!token)return res.status(400).json({message:'Invalid access token'});
    const c=mongoose.connection.collection('selfstudyaccess');
    const row=await c.findOne({magicTokenHash:sha(token),status:'active'});
    if(!row||!row.magicTokenExpiresAt||new Date(row.magicTokenExpiresAt)<=new Date()||row.magicUsedAt)return res.status(401).json({message:'Access link is invalid or expired. Please request a new access email.'});
    const session=randomToken(32),now=new Date();
    await c.updateOne({_id:row._id},{$set:{magicUsedAt:now,sessionTokenHash:sha(session),sessionExpiresAt:new Date(now.getTime()+SESSION_HOURS*3600000),updatedAt:now},$unset:{magicTokenHash:'',magicTokenExpiresAt:''}});
    res.json({ok:true,sessionToken:session,courseSlug:row.courseSlug,accessExpiresAt:row.accessExpiresAt});
  }catch(e){console.error('Self-study token exchange error',e);res.status(500).json({message:'Unable to start self-study session'});}
};

const meHandler=async(req,res)=>{
  const row=req.selfStudy,course=COURSE_META[row.courseSlug];
  const p=row.progress||baseProgress();
  const q=Number(p.cumulativeQuestions||0),correct=Number(p.cumulativeCorrect||0);
  const cumulative=q?Math.round(correct/q*100):0;
  const assessed=FIRE_SCREEN_LIST.filter(s=>s.assessmentRequired!==false&&Array.isArray(s.questions)&&s.questions.length>0);
  const completedAssessed=assessed.filter(s=>Number((p.screenScores||{})[s.id]?.score||0)>=80);
  res.json({ok:true,traineeId:row.traineeId,enrollmentId:row.enrollmentId,course,accessStartsAt:row.accessStartsAt,accessExpiresAt:row.accessExpiresAt,progress:p,cumulativeScore:cumulative,assessedScreens:assessed.length,completedAssessedScreens:completedAssessed.length,learningMastered:assessed.length>0&&completedAssessed.length===assessed.length,finalBestScore:p.finalBestScore||null,finalPassed:!!p.finalPassed});
};

const screenHandler=async(req,res)=>{
  try{
    const s=screenById.get(clean(req.params.screenId,100));
    if(!s)return res.status(404).json({message:'Learning screen not found'});
    const p=req.selfStudy.progress||baseProgress();
    const pos=FIRE_SCREEN_LIST.findIndex(x=>x.id===s.id);
    if(pos>0){
      const previousAssessed=[...FIRE_SCREEN_LIST].slice(0,pos).reverse().find(x=>x.assessmentRequired!==false&&Array.isArray(x.questions)&&x.questions.length>0);
      if(previousAssessed){
        const previousScore=Number((p.screenScores||{})[previousAssessed.id]?.score||0);
        if(previousScore<80)return res.status(403).json({message:'Complete the previous assessed learning screen with at least 80% before continuing.'});
      }
    }
    res.json({id:s.id,moduleId:s.id.slice(0,2),slide:s.slide||null,titleEn:s.titleEn,titleAr:s.titleAr,bodyEn:s.bodyEn,bodyAr:s.bodyAr,videoUrl:s.videoUrl||'',assessmentRequired:s.assessmentRequired!==false,questions:(s.questions||[]).map(q=>{const order=questionOrder(q);return {q:q.q,options:order.map(i=>q.a[i])}})});
  }catch(e){res.status(500).json({message:'Unable to load learning screen'});}
};
const screenAssessmentHandler=async(req,res)=>{
  try{
    const s=screenById.get(clean(req.params.screenId,100));
    if(!s)return res.status(404).json({message:'Learning screen not found'});
    const p0=req.selfStudy.progress||baseProgress();
    const pos0=FIRE_SCREEN_LIST.findIndex(x=>x.id===s.id);
    if(pos0>0){
      const previousAssessed=[...FIRE_SCREEN_LIST].slice(0,pos0).reverse().find(x=>x.assessmentRequired!==false&&Array.isArray(x.questions)&&x.questions.length>0);
      if(previousAssessed){
        const previousScore=Number((p0.screenScores||{})[previousAssessed.id]?.score||0);
        if(previousScore<80)return res.status(403).json({message:'Complete the previous assessed learning screen with at least 80% before continuing.'});
      }
    }
    const answers=Array.isArray(req.body?.answers)?req.body.answers:[];
    if(answers.length!==s.questions.length)return res.status(400).json({message:'Please answer all questions'});
    const correct=s.questions.reduce((n,q,i)=>{const order=questionOrder(q);return n+(Number(answers[i])===order.indexOf(q.correct)?1:0)},0);
    const score=Math.round(correct/s.questions.length*100);
    const p=req.selfStudy.progress||baseProgress();
    const scores={...(p.screenScores||{})};
    const modules={...(p.modules||{})};
    const previous=scores[s.id];
    scores[s.id]={score,questions:s.questions.length,correct,attempts:Number(previous?.attempts||0)+1,updatedAt:new Date()};
    if(score>=80&&!p.completedScreens.includes(s.id))p.completedScreens=[...p.completedScreens,s.id];
    modules[s.id.slice(0,2)]=Math.max(Number(modules[s.id.slice(0,2)]||0),score);
    const all=Object.values(scores);
    p.cumulativeQuestions=all.reduce((n,x)=>n+Number(x.questions||0),0);
    p.cumulativeCorrect=all.reduce((n,x)=>n+Number(x.correct||0),0);
    p.screenScores=scores;p.modules=modules;
    await mongoose.connection.collection('selfstudyaccess').updateOne({_id:req.selfStudy._id},{$set:{progress:p,updatedAt:new Date()}});
    const cumulative=p.cumulativeQuestions?Math.round(p.cumulativeCorrect/p.cumulativeQuestions*100):0;
    res.json({ok:true,score,passed:score>=80,correct,total:s.questions.length,cumulativeScore:cumulative,attempts:scores[s.id].attempts});
  }catch(e){console.error('Self-study screen assessment error',e);res.status(500).json({message:'Unable to save screen assessment'});}
};

const progressHandler=async(req,res)=>{
  return res.status(410).json({message:'Direct progress updates are disabled. Submit the server-validated learning-screen assessment instead.'});
};
const finalHandler=async(req,res)=>{
  // Intentionally disabled until the validated 30-question final bank is loaded server-side.
  // Never accept a client-supplied score: that would allow a learner to forge a passing result.
  return res.status(503).json({message:'The final assessment is not yet activated. Please complete the published learning screens first.'});
};

function register(app){
  app.get('/api/self-study/courses/:slug',(req,res)=>{const c=COURSE_META[clean(req.params.slug,80)];if(!c)return res.status(404).json({message:'Self-study course not found'});res.json({...c,screenCount:FIRE_SCREEN_LIST.length});});
  app.get('/api/self-study/courses/:slug/screens',(req,res)=>{const slug=clean(req.params.slug,80),c=COURSE_META[slug];if(!c)return res.status(404).json({message:'Self-study course not found'});res.json({ok:true,screens:FIRE_SCREEN_LIST.map((s,i)=>({id:s.id,moduleId:s.id.slice(0,2),slide:s.slide||null,order:i+1,titleEn:s.titleEn,titleAr:s.titleAr}))});});
  app.get('/api/self-study/screens/:screenId',sessionHandler,screenHandler);
  app.post('/api/self-study/screens/:screenId/assessment',sessionHandler,screenAssessmentHandler);
  app.post('/api/self-study/register',registerHandler);
  app.post('/api/self-study/access/request',requestAccessHandler);
  app.post('/api/self-study/session/exchange',exchangeHandler);
  app.get('/api/self-study/me',sessionHandler,meHandler);
  app.post('/api/self-study/progress',sessionHandler,progressHandler);
  app.post('/api/self-study/final-assessment',sessionHandler,finalHandler);
}
module.exports={register};
