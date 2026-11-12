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
