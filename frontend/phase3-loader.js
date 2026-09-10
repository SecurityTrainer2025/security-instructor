/* Phase 3 responsive layer loader — kept separate so existing visual styles remain intact. */
(function(){
  if(document.querySelector('link[data-phase3-responsive]')) return;
  var l=document.createElement('link');
  l.rel='stylesheet';
  l.href='phase3-responsive.css';
  l.dataset.phase3Responsive='true';
  document.head.appendChild(l);
})();
