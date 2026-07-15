
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal, .stagger');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} }); }, {threshold:.06});
    revealEls.forEach(function(el){ io.observe(el); });
  } else { revealEls.forEach(function(el){ el.classList.add('in'); }); }

  /* Tạm dừng animation nền của các khối khi cuộn ra khỏi màn hình -> cuộn mượt hơn */
  var animBlocks=document.querySelectorAll('.hero,.band,.mission,.ctablock,header');
  if('IntersectionObserver' in window && animBlocks.length){
    var pauseIO=new IntersectionObserver(function(es){ es.forEach(function(e){ e.target.classList.toggle('anim-paused', !e.isIntersecting); }); }, {rootMargin:'120px'});
    animBlocks.forEach(function(el){ pauseIO.observe(el); });
  }

  var menuBtn=document.querySelector('.nav__menu'), navEl=document.querySelector('.nav');
  if(menuBtn&&navEl){
    menuBtn.addEventListener('click',function(e){ e.stopPropagation(); var o=navEl.classList.toggle('open'); menuBtn.setAttribute('aria-expanded',o); });
    navEl.querySelectorAll('.nav__links a').forEach(function(a){ a.addEventListener('click',function(){ navEl.classList.remove('open'); }); });
    document.addEventListener('click',function(e){ if(!navEl.contains(e.target)) navEl.classList.remove('open'); });
  }

  var bar=document.getElementById('progress');
  var docEl=document.documentElement, scrollMax=0;
  function recalcMax(){ scrollMax=docEl.scrollHeight-docEl.clientHeight; }
  function onBar(){ if(bar) bar.style.width=(scrollMax>0?(docEl.scrollTop/scrollMax)*100:0)+'%'; }
  var tick=false;
  addEventListener('scroll',function(){ if(!tick){ requestAnimationFrame(function(){ onBar(); tick=false; }); tick=true; } },{passive:true});
  addEventListener('resize',function(){ recalcMax(); onBar(); },{passive:true});
  addEventListener('load',function(){ recalcMax(); onBar(); });
  recalcMax(); onBar();

  var filterBtns=document.querySelectorAll('.jobfilter__btn');
  var jobs=document.querySelectorAll('.job');
  var empty=document.getElementById('jobEmpty');
  filterBtns.forEach(function(btn){
    btn.addEventListener('click',function(){
      filterBtns.forEach(function(b){ b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var f=btn.getAttribute('data-filter'); var shown=0;
      jobs.forEach(function(j){
        var match=(f==='all'||j.getAttribute('data-dept')===f);
        j.style.display=match?'':'none';
        if(!match) j.removeAttribute('open');
        if(match) shown++;
      });
      if(empty) empty.hidden = shown>0;
    });
  });

  if(location.hash){
    var t=document.querySelector(location.hash);
    if(t && t.classList.contains('job')) t.setAttribute('open','');
  }
})();
