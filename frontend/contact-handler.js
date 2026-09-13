(function(){
  function init(){
    var section=document.querySelector('#contact');
    if(!section || section.dataset.contactHandler==='1') return;
    var form=section.querySelector('form');
    if(!form) return;
    var fields=form.querySelectorAll('input,textarea');
    var nameField=form.querySelector('input[name*=name i]') || fields[0];
    var emailField=form.querySelector('input[type=email]') || fields[1];
    var messageField=form.querySelector('textarea') || fields[2];
    section.dataset.contactHandler='1';
    form.addEventListener('submit',async function(e){
      e.preventDefault();
      var submit=form.querySelector('button[type=submit],button,input[type=submit]');
      var messageBox=document.getElementById('contactMessageStatus');
      if(!messageBox){messageBox=document.createElement('div');messageBox.id='contactMessageStatus';messageBox.style.cssText='margin-top:14px;padding:12px;border:1px solid #294158;background:#102A43;color:#cbd5df;line-height:1.7;';form.appendChild(messageBox);}
      var name=(nameField&&nameField.value||'').trim(),email=(emailField&&emailField.value||'').trim(),message=(messageField&&messageField.value||'').trim();
      if(!name||!email||!message){messageBox.textContent='Please complete all fields. / يرجى تعبئة جميع الحقول.';return;}
      if(submit)submit.disabled=true;
      messageBox.textContent='Sending… / جارٍ الإرسال…';
      try{
        var api=(window.APP_CONFIG&&window.APP_CONFIG.API_BASE)||'https://security-instructor.onrender.com';
        var r=await fetch(api+'/api/contact-messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name,email:email,message:message})});
        var out=await r.json();
        if(!r.ok)throw new Error(out.message||'Unable to send');
        messageBox.textContent='Thank you. Your message has been sent successfully. / شكرًا لك، تم إرسال رسالتك بنجاح.';
        form.reset();
      }catch(err){messageBox.textContent=err.message+' / تعذر إرسال الرسالة حاليًا.';}
      finally{if(submit)submit.disabled=false;}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  setTimeout(init,1200);
})();
