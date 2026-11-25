(function(){
  const API=window.SI_ADMIN_CONFIG.api,K=window.SI_ADMIN_CONFIG.tokenKey;
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  const auth=()=>({Authorization:'Bearer '+(localStorage.getItem(K)||''),'Content-Type':'application/json'});
  async function api(path,opt={}){const r=await fetch(API+path,{...opt,headers:{...auth(),...(opt.headers||{})}});let d={};try{d=await r.json()}catch{}if(!r.ok)throw new Error(d.message||'Request failed');return d}
  let courses=[],batches=[];
  const types=[['classroom','Classroom / حضوري'],['online','Online / أونلاين'],['self-study','Self-Study / تعلم ذاتي']];
  const fallbackCourses=[
    {code:'CRS-TRAFFIC-001',slug:'traffic-management-vehicle-control',nameEn:'TRAFFIC MANAGEMENT & VEHICLE CONTROL',nameAr:'إدارة حركة المرور والتحكم في المركبات في الموقع'},
    {code:'CRS-CROWD-001',slug:'crowd-management-event-security',nameEn:'CROWD MANAGEMENT & EVENT SECURITY',nameAr:'إدارة الحشود وتأمين الفعاليات والمناسبات الكبرى'},
    {code:'CRS-FIRE-001',slug:'fire-safety-emergency-response',nameEn:'FIRE SAFETY & EMERGENCY RESPONSE',nameAr:'السلامة من الحرائق وتدابير الاستجابة للطوارئ'},
    {code:'CRS-VEHICLE-001',slug:'vehicle-search-security-inspection',nameEn:'VEHICLE SEARCH & SECURITY INSPECTION',nameAr:'تفتيش المركبات والتفتيش الأمني'},
    {code:'CRS-PERSON-001',slug:'person-search-security-screening',nameEn:'PERSON SEARCH & SECURITY SCREENING',nameAr:'تفتيش الأشخاص وإجراءات التفتيش الأمني'}
  ];
  function add(){const tabs=document.querySelector('.tabs');if(!tabs||document.querySelector('[data-tab="batches"]'))return;if(!document.getElementById('enrollments'))return;
    const b=document.createElement('button');b.className='tab';b.dataset.tab='batches';b.textContent='Batches / الدفعات';tabs.appendChild(b);
    const host=tabs.parentElement,p=document.createElement('div');p.id='batches';p.className='tabpane hidden';p.innerHTML=`<div class="toolbar"><input id="batchSearch" placeholder="بحث برقم الدفعة أو كود الدفعة أو الدورة"><select id="batchType"><option value="">كل أنواع التدريب</option>${types.map(x=>`<option value="${x[0]}">${x[1]}</option>`).join('')}</select><button class="btn alt" id="batchRefresh">تحديث</button></div><div class="control-grid" style="margin-top:10px"><div class="control-card"><h3>إنشاء خطة دفعات / Batch Planner</h3><p>حدد الدورة ونوع التدريب والطاقة الاستيعابية للدفعة. النظام يحسب عدد الدفعات المطلوبة بناءً على عدد التسجيلات.</p><div class="field"><label>Course / الدورة</label><select id="batchCourse"></select></div><div class="field"><label>Training Type / نوع التدريب</label><select id="batchPlanType">${types.map(x=>`<option value="${x[0]}">${x[1]}</option>`).join('')}</select></div><div class="field"><label>Capacity / سعة الدفعة</label><input id="batchCapacity" type="number" min="1" value="25"></div><div style="margin-top:14px"><button class="btn" id="batchPlanBtn">Calculate Plan / احسب الخطة</button> <button class="btn alt" id="batchAssignBtn">Auto Assign / توزيع تلقائي</button></div><div id="batchPlanResult" class="challenge-state" style="margin-top:14px">اختر الدورة ثم احسب الخطة.</div></div><div class="control-card"><h3>إعداد الدفعة / Batch settings</h3>
      <form id="batchEditor">
        <label>السعة / Capacity <input name="capacity" type="number" min="1" step="1" required value="25"></label>
        <label>الحالة / Status <select name="status"><option value="open">مفتوحة / Open</option><option value="closed">مغلقة / Closed</option><option value="completed">مكتملة / Completed</option></select></label>
        <label>فتح التسجيل / Registration opens <input name="registrationOpensAt" type="datetime-local"></label>
        <label>إغلاق التسجيل / Registration closes <input name="registrationClosesAt" type="datetime-local"></label>
        <label>بداية التدريب / Training starts <input name="startDate" type="date"></label>
        <label>نهاية التدريب / Training ends <input name="endDate" type="date"></label>
        <button class="btn" type="submit">إنشاء دفعة / Create batch</button>
        <button class="btn alt" type="reset">دفعة جديدة / New batch</button>
        <p role="status" id="batchEditorResult"></p>
      </form></div></div><div class="table-wrap" style="margin-top:18px"><table><thead><tr><th>Batch ID</th><th>Batch Code</th><th>الدورة</th><th>نوع التدريب</th><th>Capacity</th><th>Enrolled</th><th>Remaining</th><th>Start</th><th>End</th><th>Status</th><th>الإجراءات / Actions</th></tr></thead><tbody id="batchRows"></tbody></table></div>`;host.appendChild(p);
    b.addEventListener('click',async()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tabpane').forEach(x=>x.classList.add('hidden'));b.classList.add('active');p.classList.remove('hidden');await load()});
    const editor=document.getElementById('batchEditor');
    editor.onsubmit=saveBatch;
    editor.onreset=()=>{delete editor.dataset.batchId;editor.querySelector('[type=submit]').textContent='إنشاء دفعة / Create batch';};
    document.getElementById('batchRows').onclick=event=>{
      const button=event.target.closest('[data-batch-edit]');
      if(button)editBatch(batches.find(batch=>batch.batchId===button.dataset.batchEdit));
    };
    document.getElementById('batchRefresh').onclick=load;document.getElementById('batchSearch').oninput=load;document.getElementById('batchType').onchange=load;document.getElementById('batchPlanBtn').onclick=calculate;document.getElementById('batchAssignBtn').onclick=autoAssign;loadCourses();
  }
  async function loadCourses(){const s=document.getElementById('batchCourse');if(!s)return;try{courses=await api('/api/admin/courses');if(!Array.isArray(courses)||!courses.length)throw new Error('No courses returned');}catch(e){courses=fallbackCourses;}s.innerHTML=courses.map(c=>`<option value="${esc(c.code||c.slug)}" data-en="${esc(c.nameEn||c.en||'')}" data-ar="${esc(c.nameAr||c.ar||'')}">${esc(c.nameEn||c.en||c.code||c.slug)} / ${esc(c.nameAr||c.ar||'')}</option>`).join('');}
  async function calculate(){const course=document.getElementById('batchCourse'),type=document.getElementById('batchPlanType').value,cap=Number(document.getElementById('batchCapacity').value),out=document.getElementById('batchPlanResult');if(!course?.value||!Number.isFinite(cap)||cap<1){out.textContent='Course and valid capacity are required.';return}out.textContent='Calculating…';try{const d=await api('/api/admin/batches/plan?courseId='+encodeURIComponent(course.value)+'&trainingType='+encodeURIComponent(type)+'&capacity='+encodeURIComponent(cap));out.innerHTML=`<b style="color:#c8a96b">${esc(d.requiredBatches)} batches required</b><br>Total registrations: ${esc(d.totalTrainees)}<br>Unassigned: ${esc(d.unassignedTrainees)}<br>Distribution: ${d.distribution.map((n,i)=>'Batch '+String(i+1).padStart(2,'0')+': '+n).join(' | ')}`;}catch(e){out.textContent=e.message}}
  async function autoAssign(){const course=document.getElementById('batchCourse'),type=document.getElementById('batchPlanType').value,cap=Number(document.getElementById('batchCapacity').value),out=document.getElementById('batchPlanResult');if(!course?.value||!Number.isFinite(cap)||cap<1){out.textContent='Course and valid capacity are required.';return}if(!confirm('توزيع التسجيلات غير المرتبطة تلقائيًا على الدفعات؟ / Auto-assign unassigned enrollments?'))return;out.textContent='Assigning…';try{const d=await api('/api/admin/batches/auto-assign',{method:'POST',body:JSON.stringify({courseId:course.value,trainingType:type,capacity:cap})});out.innerHTML=`<b style="color:#c8a96b">تم التوزيع بنجاح</b><br>Assigned: ${esc(d.assigned)}<br>Created batches: ${esc(d.createdBatches)}`;await load()}catch(e){out.textContent=e.message}}
  function editBatch(batch){
    const form=document.getElementById('batchEditor');
    form.dataset.batchId=batch.batchId;
    form.elements.capacity.value=batch.capacity;
    form.elements.status.value=batch.configuredStatus==='full'?'open':batch.configuredStatus;
    for(const key of ['startDate','endDate'])form.elements[key].value=batch[key]?.slice(0,10)||'';
    for(const key of ['registrationOpensAt','registrationClosesAt']){
      const date=batch[key]&&new Date(batch[key]);
      form.elements[key].value=date?new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16):'';
    }
    form.querySelector('[type=submit]').textContent='حفظ / Save '+batch.batchId;
    form.elements.capacity.focus();
  }
  async function saveBatch(event){
    event.preventDefault();
    const form=event.currentTarget,id=form.dataset.batchId,out=document.getElementById('batchEditorResult');
    const button=form.querySelector('[type=submit]');
    const fields=Object.fromEntries(new FormData(form));
    for(const key of ['registrationOpensAt','registrationClosesAt']){
      if(fields[key])fields[key]=new Date(fields[key]).toISOString();
    }
    if(!id){
      const course=document.getElementById('batchCourse').selectedOptions[0];
      if(!course){out.textContent='اختر الدورة / Select a course';return;}
      Object.assign(fields,{courseId:course.value,courseNameEn:course.dataset.en,courseNameAr:course.dataset.ar,
        trainingType:document.getElementById('batchPlanType').value});
    }
    button.disabled=true;
    try{
      const batch=await api('/api/admin/batches'+(id?'/'+encodeURIComponent(id):''),{
        method:id?'PATCH':'POST',body:JSON.stringify(fields)
      });
      editBatch(batch);
      out.textContent='تم الحفظ / Saved '+batch.batchId;
      await load();
    }catch(error){out.textContent=error.message;}
    finally{button.disabled=false;}
  }
  async function load(){const rows=document.getElementById('batchRows');if(!rows)return;rows.innerHTML='<tr><td colspan="11">Loading…</td></tr>';try{const q=document.getElementById('batchSearch').value||'',t=document.getElementById('batchType').value||'';let u='/api/admin/batches?';if(q)u+='q='+encodeURIComponent(q)+'&';if(t)u+='trainingType='+encodeURIComponent(t);batches=await api(u);rows.innerHTML=batches.length?batches.map(x=>`<tr><td class="ltr"><b>${esc(x.batchId)}</b></td><td class="ltr"><strong style="color:#c8a96b">${esc(x.batchCode||'—')}</strong></td><td><b>${esc(x.courseNameEn)}</b><br><span class="muted">${esc(x.courseNameAr)}</span></td><td>${esc(x.trainingTypeLabel)}</td><td>${esc(x.capacity)}</td><td>${esc(x.enrolled)}</td><td>${esc(x.remaining)}</td><td>${esc(x.startDate?new Date(x.startDate).toLocaleDateString('en-GB'):'—')}</td><td>${esc(x.endDate?new Date(x.endDate).toLocaleDateString('en-GB'):'—')}</td><td><span class="status ${x.status==='completed'?'completed':x.status==='closed'?'cancelled':x.status==='full'?'confirmed':''}">${esc(x.status)}</span></td><td><button type="button" class="btn alt" data-batch-edit="${esc(x.batchId)}">تعديل / Edit</button></td></tr>`).join(''):'<tr><td colspan="11">لا توجد دفعات بعد / No batches yet</td></tr>'}catch(e){rows.innerHTML='<tr><td colspan="11">'+esc(e.message)+'</td></tr>'}}
  function boot(){if(document.querySelector('#dashboard')&&document.querySelector('.tabs'))add()}
  if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',boot);else boot();
})();