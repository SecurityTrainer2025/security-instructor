const {test, expect}=require('@playwright/test');
const SITE='http://127.0.0.1:8765/frontend/';
const STAGING='https://si-avs-staging-test.onrender.com';
const devices=[
  {name:'desktop',viewport:{width:1280,height:850}},
  {name:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true}
];
for(const device of devices){
 test.describe('Traffic isolated browser QA '+device.name,()=>{
  test.use({viewport:device.viewport,isMobile:!!device.isMobile,hasTouch:!!device.hasTouch});
  test('no staging config means no registration, email, data write, or prod API call',async({page})=>{
    const external=[];
    page.on('request',req=>{if(req.url().includes('onrender.com'))external.push(req.url())});
    await page.goto(SITE+'traffic-self-study-register.html');
    await page.locator('#ar').fill('محمد أحمد خالد');
    await page.locator('#en').fill('Mohamed Ahmed Khaled');
    await page.locator('#idType').selectOption({index:1});
    await page.locator('#idNumber').fill('TEST-123456');
    await page.locator('#mobile').fill('123456789');
    await page.locator('#email').fill('example@example.test');
    await page.locator('#consent').check();
    await page.locator('button[type=submit]').click();
    await expect(page.locator('#msg')).toContainText('غير مهيأ');
    expect(external).toEqual([]);
    await page.goto(SITE+'traffic-self-study.html');
    await expect(page.locator('#content')).toContainText('خادم التجربة غير مهيأ');
    expect(external).toEqual([]);
    expect(await page.evaluate(()=>localStorage.getItem('siSelfStudySession'))).toBeNull();
  });
  test('mock staging registration isolates course slug and returns enrollment ID',async({page})=>{
    const calls=[];
    await page.route('**/traffic-staging-config.js',async route=>route.fulfill({status:200,contentType:'application/javascript',body:"window.SI_TRAFFIC_STAGING_API='"+STAGING+"';"}));
    await page.route(STAGING+'/**',async route=>{
      const req=route.request();
      calls.push({url:req.url(),body:req.postDataJSON()});
      if(req.url().endsWith('/api/self-study/register'))return route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({ok:true,enrollmentId:'ENR-MOCK-NEW',mailSent:true,message:'Test email queued / تسجيل تجريبي'})});
      return route.fulfill({status:404,contentType:'application/json',body:'{"message":"Unexpected request"}'});
    });
    await page.goto(SITE+'traffic-self-study-register.html');
    await page.locator('#ar').fill('محمد أحمد خالد');
    await page.locator('#en').fill('Mohamed Ahmed Khaled');
    await page.locator('#idType').selectOption({index:1});
    await page.locator('#idNumber').fill('TEST-123456');
    await page.locator('#mobile').fill('123456789');
    await page.locator('#email').fill('example@example.test');
    await page.locator('#consent').check();
    await page.locator('button[type=submit]').click();
    await expect(page.locator('#msg')).toContainText('ENR-MOCK-NEW');
    expect(calls.length).toBe(1);
    expect(calls[0].body.courseSlug).toBe('traffic-management-vehicle-control');
    expect(calls[0].url).toBe(STAGING+'/api/self-study/register');
  });
  test('mock bilingual ten-question feedback requires all answers before final exam',async({page})=>{
    const calls=[];
    let submitted=false;
    await page.route('**/traffic-staging-config.js',route=>route.fulfill({status:200,contentType:'application/javascript',body:"window.SI_TRAFFIC_STAGING_API='"+STAGING+"';"}));
    await page.route(STAGING+'/**',async route=>{
      const req=route.request();
      const p=new URL(req.url()).pathname;
      calls.push({p,method:req.method(),body:req.postData()});
      let data={ok:true},status=200;
      if(p==='/api/self-study/me')data={ok:true,course:{code:'CRS-TRAFFIC-001'},accessExpiresAt:'2099-01-01T00:00:00Z',progress:{completedScreens:[],screenScores:{},modules:{}},activeStudySeconds:0,activeStudyLimitSeconds:86400,finalPassed:false,feedbackSubmitted:submitted,learningMastered:true};
      else if(p==='/api/self-study/courses/traffic-management-vehicle-control/screens')data={ok:true,screens:[{id:'tm1s1',moduleId:'tm1',order:1,titleEn:'Traffic introduction',titleAr:'مقدمة المرور'}]};
      else if(p==='/api/self-study/screens/tm1s1')data={id:'tm1s1',titleEn:'Traffic introduction',titleAr:'مقدمة المرور',bodyEn:'Demo',bodyAr:'تجريبي',questions:[]};
      else if(p==='/api/self-study/traffic-feedback' && req.method()==='GET')
        data={ok:true,submitted,questions:Array.from({length:10},(_,i)=>({id:i+1,en:'Feedback statement '+(i+1),ar:'سؤال التقييم '+(i+1)}))};
      else if(p==='/api/self-study/traffic-feedback' && req.method()==='POST'){
        const answers=req.postDataJSON().answers;
        if(answers.length!==10||answers.some(a=>a<1||a>5)){status=400;data={message:'Invalid feedback'}}
        else{data={ok:true,submitted:true};submitted=true}
      }else if(p==='/api/self-study/final-assessment')
        data={ok:true,total:30,attemptsRemaining:2,questions:[]};
      else if(p==='/api/self-study/heartbeat')data={ok:true,activeStudySeconds:0,activeStudyLimitSeconds:86400};
      else {status=404;data={message:'Unexpected mock endpoint '+p}}
      await route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
    });
    await page.goto(SITE+'traffic-self-study.html');
    await page.evaluate(()=>localStorage.setItem('siTrafficStagingSelfStudySession','traffic-feedback-mock'));
    await page.reload();
    await expect(page.locator('#content')).toContainText('Traffic introduction');
    await page.evaluate(()=>showTrafficFeedback());
    await expect(page.locator('#content')).toContainText('التغذية الراجعة');
    await expect(page.locator('.q')).toHaveCount(10);
    await page.locator('#submitTrafficFeedback').click();
    await expect(page.locator('#result')).toContainText('الأسئلة العشرة');
    expect(calls.filter(c=>c.p.endsWith('traffic-feedback')&&c.method==='POST')).toHaveLength(0);
    for(let i=1;i<=10;i++)await page.locator('input[name="feedback'+i+'"][value="5"]').check();
    await page.locator('#submitTrafficFeedback').click();
    await expect(page.locator('#content')).toContainText('Final Assessment');
    const posted=calls.filter(c=>c.p.endsWith('traffic-feedback')&&c.method==='POST');
    expect(posted).toHaveLength(1);
    expect(JSON.parse(posted[0].body).answers).toEqual(Array(10).fill(5));
    expect(calls.some(c=>c.p==='/api/self-study/final-assessment')).toBe(true);
    expect(calls.every(c=>c.p.startsWith('/api/self-study/'))).toBe(true);
  });
  test('Traffic-only staging certificate and QR render safely on desktop/mobile',async({page})=>{
    const id='SI-CERT-2026-ABCD123456';
    const valid={valid:true,certificateId:id,courseId:'CRS-TRAFFIC-001',recipientNameEn:'Mock Trainee',recipientNameAr:'متدرب تجريبي',courseNameEn:'Traffic Management & Vehicle Control',courseNameAr:'إدارة حركة المرور',issuedAt:'2026-11-12T00:00:00Z'};
    const calls=[];
    await page.route(STAGING+'/**',route=>{
      const p=new URL(route.request().url()).pathname;
      calls.push(p);
      if(p==='/api/verify/traffic-staging-certificate')
        return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(valid)});
      if(p.includes('/qr'))return route.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>'});
      return route.fulfill({status:404,contentType:'application/json',body:'{}'});
    });
    await page.goto(SITE+'traffic-certificate.html?id='+id);
    await expect(page.locator('#certificate')).toBeVisible();
    await expect(page.locator('#recipient')).toContainText('Mock Trainee');
    await expect(page.locator('#qr')).toBeVisible();
    await expect(page.locator('#verifyLink')).toHaveAttribute('href',/traffic-verify\.html/);
    expect(calls).toContain('/api/verify/traffic-staging-certificate');
    expect(calls.some(p=>p.endsWith('/qr'))).toBe(true);
    await page.goto(SITE+'traffic-verify.html?id='+id);
    await expect(page.locator('#status')).toContainText('VALID TRAFFIC STAGING CERTIFICATE');
    await expect(page.locator('#certId')).toHaveText(id);
  });
  test('rejects legacy certificate and invalid QR on both staging verification pages',async({page})=>{
    const id='SI-CERT-2026-ABCD123456';
    const calls=[];
    await page.route(STAGING+'/**',route=>{
      calls.push(route.request().url());
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({valid:true,certificateId:id,courseId:'CRS-FIRE-001',recipientNameEn:'Legacy Trainee'})});
    });
    await page.goto(SITE+'traffic-verify.html?id='+id);
    await expect(page.locator('#status')).toContainText('Unverified Traffic certificate');
    await expect(page.locator('#details')).toBeHidden();
    await page.goto(SITE+'traffic-certificate.html?id='+id);
    await expect(page.locator('#certificate')).toBeHidden();
    await expect(page.locator('#error')).toContainText('Certificate cannot be verified');
    await page.goto(SITE+'traffic-verify.html?id=INVALID');
    await expect(page.locator('#status')).toContainText('Invalid certificate identifier');
    expect(calls.length).toBe(2,'Invalid IDs should not contact any backend');
    expect(calls.every(u=>u.includes('si-avs-staging-test.onrender.com'))).toBe(true);
  });
  test('mock Traffic learning session stays separate from Fire Safety credentials',async({page})=>{
    const requests=[];
    await page.route('**/traffic-staging-config.js',async route=>route.fulfill({status:200,contentType:'application/javascript',body:"window.SI_TRAFFIC_STAGING_API='"+STAGING+"';"}));
    await page.route(STAGING+'/**',async route=>{
      const req=route.request(), url=new URL(req.url());
      requests.push(url.pathname);
      const p=url.pathname;
      let data={},status=200;
      if(p==='/api/self-study/session/exchange')data={sessionToken:'traffic-mock-session',courseSlug:'traffic-management-vehicle-control',accessExpiresAt:'2099-01-01T00:00:00Z'};
      else if(p==='/api/self-study/me')data={ok:true,course:{code:'CRS-TRAFFIC-001'},accessExpiresAt:'2099-01-01T00:00:00Z',activeStudySeconds:0,activeStudyLimitSeconds:86400,progress:{completedScreens:[],screenScores:{},modules:{}},cumulativeScore:0,finalPassed:false};
      else if(p==='/api/self-study/courses/traffic-management-vehicle-control/screens')data={ok:true,screens:[{id:'tm1s1',moduleId:'tm1',order:1,titleEn:'Introduction to Traffic',titleAr:'مقدمة في المرور'}]};
      else if(p==='/api/self-study/screens/tm1s1')data={id:'tm1s1',moduleId:'tm1',slide:1,titleEn:'Introduction to Traffic',titleAr:'مقدمة في المرور',bodyEn:'Controlled training only',bodyAr:'التدريب التجريبي فقط',questions:[1,2,3,4,5].map(i=>({q:'Question '+i,options:['A','B','C','D']}))};
      else if(p==='/api/self-study/heartbeat')data={ok:true,activeStudySeconds:0,activeStudyLimitSeconds:86400};
      else{status=404;data={message:'Unexpected mocked endpoint '+p}}
      await route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
    });
    await page.goto(SITE+'traffic-self-study.html#token=mock-training-token');
    await expect(page.locator('#startAccess')).toBeVisible();
    await page.locator('#startAccess').click();
    await expect(page.locator('.main-card h1')).toContainText('Introduction to Traffic');
    await expect(page.locator('#content')).toContainText('مقدمة في المرور');
    await expect(page.locator('#modules')).toContainText('Traffic Control Fundamentals');
    expect(await page.evaluate(()=>localStorage.getItem('siTrafficStagingSelfStudySession'))).toBe('traffic-mock-session');
    expect(await page.evaluate(()=>localStorage.getItem('siSelfStudySession'))).toBeNull();
    expect(requests).toContain('/api/self-study/courses/traffic-management-vehicle-control/screens');
    expect(requests).not.toContain('/api/self-study/courses/fire-safety-emergency-response/screens');
    expect(requests.some(p=>p.includes('certificate'))).toBe(false);
  });
 });
}
