
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal, .stagger');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} }); }, {threshold:.08});
    revealEls.forEach(function(el){ io.observe(el); });
  } else { revealEls.forEach(function(el){ el.classList.add('in'); }); }

  var menuBtn=document.querySelector('.nav__menu'), navEl=document.querySelector('.nav');
  if(menuBtn&&navEl){
    menuBtn.addEventListener('click',function(e){ e.stopPropagation(); var o=navEl.classList.toggle('open'); menuBtn.setAttribute('aria-expanded',o); });
    navEl.querySelectorAll('.nav__links a').forEach(function(a){ a.addEventListener('click',function(){ navEl.classList.remove('open'); }); });
    document.addEventListener('click',function(e){ if(!navEl.contains(e.target)) navEl.classList.remove('open'); });
  }

  var bar=document.getElementById('progress');
  function onBar(){ var h=document.documentElement,max=h.scrollHeight-h.clientHeight; bar.style.width=(max>0?(h.scrollTop/max)*100:0)+'%'; }
  var tick=false;
  addEventListener('scroll',function(){ if(!tick){ requestAnimationFrame(function(){ onBar(); tick=false; }); tick=true; } },{passive:true});
  onBar();
})();
