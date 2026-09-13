/* Phase 3 responsive layer loader — kept separate so existing visual styles remain intact. */
(function(){
  if(!document.querySelector('link[data-phase3-responsive]')){
    var l=document.createElement('link');
    l.rel='stylesheet';
    l.href='phase3-responsive.css';
    l.dataset.phase3Responsive='true';
    document.head.appendChild(l);
  }
  function loadAssessmentEnhancer(){
    if(document.querySelector('script[data-assessment-enhancer]')) return;
    var s=document.createElement('script');
    s.src='assessment-enhancer.js';
    s.dataset.assessmentEnhancer='true';
    document.head.appendChild(s);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',loadAssessmentEnhancer);
  else loadAssessmentEnhancer();
})();
