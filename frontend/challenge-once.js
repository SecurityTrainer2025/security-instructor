/* Arab Private Security — show the existing Challenge only once per browser. */
(function(){
  const KEY='arabPrivateSecurity.challengeShown.v1';
  function guard(){
    if(typeof window.challengeRender!=='function') return;
    const original=window.challengeRender;
    if(original.__onceGuarded) return;
    function guarded(){
      try{
        if(localStorage.getItem(KEY)==='1'){
          const existing=document.querySelector('#challenge');
          if(existing) existing.remove();
          return;
        }
        localStorage.setItem(KEY,'1');
      }catch(e){}
      return original.apply(this,arguments);
    }
    guarded.__onceGuarded=true;
    window.challengeRender=guarded;
    try{
      if(localStorage.getItem(KEY)==='1'){
        const existing=document.querySelector('#challenge');
        if(existing) existing.remove();
      }
    }catch(e){}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',guard,{once:true});
  else guard();
})();
