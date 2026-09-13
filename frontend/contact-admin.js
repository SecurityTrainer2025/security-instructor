(function(){
  function init(){
    var tabs=document.querySelector('.tabs');
    var dashboard=document.querySelector('#dashboard');
    if(!tabs||!dashboard||document.querySelector('[data-tab=contact-messages]'))return;
    var tab=document.createElement('button');tab.className='tab';tab.dataset.tab='contact-messages';tab.textContent='رسائل التواصل / Contact Messages';tabs.appendChild(tab);
    var pane=document.createElement('div');pane.id='contact-messages';pane.className='tabpane hidden';
    pane.innerHTML='<div class="toolbar"><button class="btn alt" id="contactMessageRefresh">تحديث</button></div><div class="table-wrap"><table><thead><tr><th>الاسم</th><th>البريد</th><th>الرسالة</th><th>الحالة</th><th>التاريخ</th><th>الإجراء</th></tr></thead><tbody id="contactMessageRows"></tbody></table></div>';
    tabs.parentElement.appendChild(pane);
    var api='https://security-instructor.onrender.com';
    var tokenKey='securityInstructorAdminToken';
    function escapeHtml(s){return String(s??'').replace(/[&<>\"]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]})}
    function openReply(x){
      var old=document.getElementById('contactReplyModal');if(old)old.remove();
      var overlay=document.createElement('div');overlay.id='contactReplyModal';overlay.style.cssText='position:fixed;inset:0;background:rgba(4,15,25,.76);display:flex;align-items:center;justify-content:center;padding:20px;z-index:9999;';
      overlay.innerHTML='<div style="width:min(720px,96vw);max-height:90vh;overflow:auto;background:#102A43;border:1px solid #c8a96b;padding:24px;color:#fff"><div style="display:flex;justify-content:space-between;gap:16px;align-items:center"><div><div style="color:#c8a96b;font-size:12px;font-weight:800;letter-spacing:.08em">SECURITY INSTRUCTOR</div><h2 style="margin:6px 0 0">Reply / الرد على الرسالة</h2></div><button id="replyClose" class="btn alt">إغلاق</button></div><p style="color:#b7c4ce;line-height:1.7">إلى: '+escapeHtml(x.email)+'</p><div style="background:#0B1F33;border:1px solid #294158;padding:14px;white-space:pre-wrap;line-height:1.7"><strong>رسالة الزائر:</strong><br>'+escapeHtml(x.message)+'</div><label style="display:block;margin-top:16px;font-weight:800">Your Reply / ردك</label><textarea id="replyText" style="width:100%;min-height:190px;box-sizing:border-box;margin-top:8px;padding:13px;background:#0B1F33;border:1px solid #526577;color:#fff;resize:vertical" placeholder="اكتب ردك هنا..."></textarea><div style="margin-top:14px;display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap"><button id="replySend" class="btn">Send Reply / إرسال الرد</button></div><div id="replyStatus" style="display:none;margin-top:12px;padding:12px;border:1px solid #294158;line-height:1.7"></div></div>';
      document.body.appendChild(overlay);
      document.getElementById('replyClose').onclick=function(){overlay.remove()};
      document.getElementById('replySend').onclick=async function(){
        var btn=this,reply=document.getElementById('replyText').value.trim(),status=document.getElementById('replyStatus');
        if(!reply){status.textContent='Please enter your reply. / يرجى كتابة الرد.';status.style.display='block';return;}
        btn.disabled=true;status.textContent='Sending… / جارٍ إرسال الرد…';status.style.display='block';
        try{var token=localStorage.getItem(tokenKey)||'';var r=await fetch(api+'/api/admin/contact-messages/'+encodeURIComponent(x.id)+'/reply',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({reply:reply})});var out=await r.json();if(!r.ok)throw new Error(out.message||'Unable to send reply');status.textContent='Reply sent successfully. / تم إرسال الرد بنجاح.';setTimeout(function(){overlay.remove();load();},900);}catch(e){status.textContent=e.message;btn.disabled=false;}
      };
    }
    async function load(){
      var token=localStorage.getItem(tokenKey)||'';
      var tbody=document.getElementById('contactMessageRows');
      try{
        var r=await fetch(api+'/api/admin/contact-messages',{headers:{Authorization:'Bearer '+token}});var rows=await r.json();if(!r.ok)throw new Error(rows.message||'Unable to load messages');
        tbody.innerHTML=rows.length?rows.map(function(x){return '<tr><td>'+escapeHtml(x.name)+'</td><td class="ltr">'+escapeHtml(x.email)+'</td><td style="white-space:pre-wrap;min-width:320px">'+escapeHtml(x.message)+'</td><td><select data-contact-status="'+escapeHtml(x.id)+'"><option '+(x.status==='new'?'selected':'')+'>new</option><option '+(x.status==='replied'?'selected':'')+'>replied</option><option '+(x.status==='closed'?'selected':'')+'>closed</option></select></td><td class="ltr">'+new Date(x.createdAt).toLocaleString()+'</td><td><button class="btn alt" data-contact-reply="'+escapeHtml(x.id)+'">Reply / رد</button></td></tr>';}).join(''):'<tr><td colspan="6">لا توجد رسائل</td></tr>';
        window.__contactMessages=rows;
        document.querySelectorAll('[data-contact-status]').forEach(function(s){s.onchange=async function(){try{await fetch(api+'/api/admin/contact-messages/'+encodeURIComponent(s.dataset.contactStatus)+'/status',{method:'PATCH',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({status:s.value})});load();}catch(e){alert(e.message)}}});
        document.querySelectorAll('[data-contact-reply]').forEach(function(b){b.onclick=function(){var row=window.__contactMessages.find(function(x){return x.id===b.dataset.contactReply});if(row)openReply(row);}});
      }catch(e){tbody.innerHTML='<tr><td colspan="6">'+escapeHtml(e.message)+'</td></tr>'}
    }
    document.getElementById('contactMessageRefresh').onclick=load;
    tab.onclick=function(){document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active')});document.querySelectorAll('.tabpane').forEach(function(p){p.classList.add('hidden')});tab.classList.add('active');pane.classList.remove('hidden');load();};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  setTimeout(init,800);
})();
