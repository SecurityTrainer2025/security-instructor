/* Phase 3 responsive layer loader — kept separate so existing visual styles remain intact. */
(function(){
  if(!document.querySelector('link[data-phase3-responsive]')){
    var l=document.createElement('link');
    l.rel='stylesheet';
    l.href='phase3-responsive.css';
    l.dataset.phase3Responsive='true';
    document.head.appendChild(l);
  }
  if(!document.querySelector('script[data-challenge-once]')){
    var s=document.createElement('script');
    s.src='challenge-once.js';
    s.dataset.challengeOnce='true';
    document.head.appendChild(s);
  }
})();
