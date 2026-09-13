(function(){
  function init(){
    var tabs=document.querySelector('.tabs');
    var dashboard=document.querySelector('#dashboard');
    if(!tabs||!dashboard||document.querySelector('[data-tab=contact-messages]'))return;
    var tab=document.createElement('button');tab.className='tab';tab.dataset.tab='contact-messages';tab.textContent='رسائل التواصل / Contact Messages';tabs.appendChild(tab);
    var pane=document.createElement('div');pane.id='contact-messages';pane.className='tabpane hidden';
    pane.innerHTML='<div class="toolbar"><button class="btn alt" id="contactMessageRefresh">تحديث</button></div><div class="table-wrap"><table><thead><tr><th>الاسم</th><th>البريد</th><th>الرسالة</th><th>الحالة</th><th>التاريخ</th><th>الرد</th></tr></thead><tbody id="contactMessageRows"></tbody></table></div>';
    tabs.parentElement.appendChild(pane);
    var api='https://security-instructor.onrender.com';
    var tokenKey='securityInstructorAdminToken';
    function escapeHtml(s){return String(s??'').replace(/[&<>\"]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]})}
    async function load(){
      var token=localStorage.getItem(tokenKey)||'';
      var tbody=document.getElementById('contactMessageRows');
      try{
        var r=await fetch(api+'/api/admin/contact-messages',{headers:{Authorization:'Bearer '+token}});
        var rows=await r.json();
        if(!r.ok)throw new Error(rows.message||'Unable to load messages');
        tbody.innerHTML=rows.length?rows.map(function(x){var subject=encodeURIComponent('Re: SECURITY INSTRUCTOR contact message');var body=encodeURIComponent('Dear '+x.name+',\n\nThank you for contacting SECURITY INSTRUCTOR.\n\nYour message:\n'+x.message+'\n\nBest regards,\nAbdallah Abdelaziz Shalaby\nSECURITY INSTRUCTOR');return '<tr><td>'+escapeHtml(x.name)+'</td><td class="ltr">'+escapeHtml(x.email)+'</td><td style="white-space:pre-wrap;min-width:320px">'+escapeHtml(x.message)+'</td><td><select data-contact-status="'+escapeHtml(x.id)+'"><option '+(x.status==='new'?'selected':'')+'>new</option><option '+(x.status==='replied'?'selected':'')+'>replied</option><option '+(x.status==='closed'?'selected':'')+'>closed</option></select></td><td class="ltr">'+new Date(x.createdAt).toLocaleString()+'</td><td><a class="btn alt" target="_blank" href="mailto:'+encodeURIComponent(x.email)+'?subject='+subject+'&body='+body+'">Reply / رد</a></td></tr>';}).join(''):'<tr><td colspan="6">لا توجد رسائل</td></tr>';
        document.querySelectorAll('[data-contact-status]').forEach(function(s){s.onchange=async function(){try{await fetch(api+'/api/admin/contact-messages/'+encodeURIComponent(s.dataset.contactStatus)+'/status',{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({status:s.value})});load()}catch(e){alert(e.message)}}});
      }catch(e){tbody.innerHTML='<tr><td colspan="6">'+escapeHtml(e.message)+'</td></tr>'}
    }
    document.getElementById('contactMessageRefresh').onclick=load;
    tab.onclick=function(){document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active')});document.querySelectorAll('.tabpane').forEach(function(p){p.classList.add('hidden')});tab.classList.add('active');pane.classList.remove('hidden');load();};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  setTimeout(init,800);
})();
