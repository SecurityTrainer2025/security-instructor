/* Existing assessment activation layer — preserves the existing question bank and bilingual content. */
(function(){
  function loadAssessmentPage(){
    if(!location.pathname.endsWith('/course-assessment-v2.html')) return;
    if(typeof Q === 'undefined') return;
    var params=new URLSearchParams(location.search);
    var slug=params.get('course')||'traffic-management-vehicle-control';
    var key=slug.indexOf('traffic')===0?'traffic':slug.indexOf('crowd')===0?'crowd':slug.indexOf('fire')===0?'fire':slug.indexOf('vehicle')===0?'vehicle':'person';
    if(!Q[key]) return;
    var questions=[].concat(Q[key]).sort(function(){return Math.random()-.5});
    var i=0,score=0,selected=null;
    var next=document.getElementById('next');
    function render(){
      selected=null;
      var q=questions[i];
      document.getElementById('count').textContent='Question '+(i+1)+' of '+questions.length+' / السؤال '+(i+1)+' من '+questions.length;
      document.getElementById('qnum').textContent='QUESTION '+(i+1);
      document.getElementById('qEn').textContent=q[0];
      document.getElementById('qAr').textContent=q[1];
      document.getElementById('bar').style.width=(i/questions.length*100)+'%';
      var options=document.getElementById('options');
      options.innerHTML='';
      for(var n=0;n<8;n+=2){
        var b=document.createElement('button');
        b.type='button';
        b.className='option';
        b.innerHTML='<span>'+q[2][n]+'</span><span class="ar">'+q[2][n+1]+'</span>';
        b.onclick=(function(index,button){return function(){
          selected=index;
          document.querySelectorAll('.option').forEach(function(x){x.classList.remove('selected')});
          button.classList.add('selected');
          next.disabled=false;
        }})(n/2,b);
        options.appendChild(b);
      }
      next.disabled=true;
      next.textContent=i===questions.length-1?'Finish Assessment / إنهاء التقييم':'Next Question / السؤال التالي';
      next.onclick=function(){
        if(selected===null) return;
        if(selected===q[3]) score++;
        i++;
        if(i<questions.length) render(); else finish();
      };
    }
    function finish(){
      document.getElementById('quiz').style.display='none';
      document.getElementById('result').style.display='block';
      document.getElementById('score').textContent=score+'/10';
      document.getElementById('resultText').innerHTML=score>=8?'Strong initial knowledge. / مستوى معرفي مبدئي قوي.':score>=5?'Good initial foundation. / أساس معرفي مبدئي جيد.':'Further learning is recommended before training begins. / يوصى بمزيد من التعلم قبل بدء التدريب.';
      document.getElementById('retry').onclick=function(){location.reload()};
    }
    render();
  }

  function addHomepageAssessmentButtons(){
    var grid=document.getElementById('courseGrid');
    if(!grid) return;
    grid.querySelectorAll('.course-card').forEach(function(card){
      var trigger=card.querySelector('[data-course]');
      if(!trigger || card.querySelector('[data-course-assessment]')) return;
      var slug=trigger.getAttribute('data-course');
      var a=document.createElement('a');
      a.setAttribute('data-course-assessment',slug);
      a.href='course-assessment-v2.html?course='+encodeURIComponent(slug);
      a.textContent='Initial Course Assessment / التقييم المبدئي للدورة';
      a.style.cssText='display:inline-block;margin:10px 8px 0 0;padding:11px 16px;border:1px solid #c8a96b;color:#c8a96b;background:transparent;text-decoration:none;font-weight:800;';
      trigger.insertAdjacentElement('beforebegin',a);
    });
  }

  function moveDetailsAssessmentToTop(){
    var link=document.querySelector('.footer-actions .action.primary[href*="course-assessment-v2.html"]');
    var hero=document.querySelector('.course-hero');
    if(!link || !hero || link.getAttribute('data-moved-top')==='true') return;
    link.setAttribute('data-moved-top','true');
    hero.insertAdjacentElement('afterend',link);
    link.style.cssText+=';display:inline-flex;margin:18px 12px 0 0;';
  }

  function start(){
    loadAssessmentPage();
    addHomepageAssessmentButtons();
    moveDetailsAssessmentToTop();
    var observer=new MutationObserver(function(){
      addHomepageAssessmentButtons();
      moveDetailsAssessmentToTop();
    });
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(function(){addHomepageAssessmentButtons();moveDetailsAssessmentToTop()},500);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
