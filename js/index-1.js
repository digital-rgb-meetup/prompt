
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal, .stagger');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} }); }, {threshold:.08});
    revealEls.forEach(function(el){ io.observe(el); });
  } else { revealEls.forEach(function(el){ el.classList.add('in'); }); }

  var word=document.getElementById('heroWord'), caret=document.getElementById('heroCaret'), txt='kén người.';
  if (word){ if(reduced){ word.textContent=txt; if(caret)caret.style.display='none'; }
    else { var i=0;(function t(){ if(i<=txt.length){ word.textContent=txt.slice(0,i); i++; setTimeout(t,80);} else if(caret){ setTimeout(function(){caret.style.opacity='0';},2600);} })(); } }

  document.querySelectorAll('.vquote').forEach(function(card){
    var body=card.querySelector('.rev-body'), btn=card.querySelector('.rev-more');
    if(!body||!btn) return;
    if(body.scrollHeight <= body.clientHeight + 2){ btn.style.display='none'; return; }
    btn.addEventListener('click', function(){
      var ex = body.classList.toggle('expanded'); body.classList.toggle('clamp', !ex);
      btn.textContent = ex ? 'Thu gọn' : 'Xem thêm';
    });
  });

  var menuBtn=document.querySelector('.nav__menu'), navEl=document.querySelector('.nav');
  if(menuBtn&&navEl){
    menuBtn.addEventListener('click',function(e){ e.stopPropagation(); var o=navEl.classList.toggle('open'); menuBtn.setAttribute('aria-expanded',o); });
    navEl.querySelectorAll('.nav__links a').forEach(function(a){ a.addEventListener('click',function(){ navEl.classList.remove('open'); }); });
    document.addEventListener('click',function(e){ if(!navEl.contains(e.target)) navEl.classList.remove('open'); });
  }

  var bar=document.getElementById('progress');
  function onBar(){ var h=document.documentElement,max=h.scrollHeight-h.clientHeight; bar.style.width=(max>0?(h.scrollTop/max)*100:0)+'%'; }

  var acts=document.getElementById('acts'), fill=document.getElementById('actsFill'), actEls=acts?acts.querySelectorAll('.act'):[];
  function onTimeline(){ if(!acts||!fill)return; var r=acts.getBoundingClientRect(),anchor=innerHeight*0.6,total=r.height-12;
    fill.style.height=Math.min(Math.max(anchor-r.top-6,0),total)+'px';
    actEls.forEach(function(a){ (a.getBoundingClientRect().top<anchor)?a.classList.add('lit'):a.classList.remove('lit'); }); }
  if(reduced&&fill){ fill.style.height='100%'; actEls.forEach(function(a){a.classList.add('lit');}); }

  var tick=false;
  addEventListener('scroll',function(){ if(!tick){ requestAnimationFrame(function(){ onBar(); if(!reduced)onTimeline(); tick=false; }); tick=true; } },{passive:true});
  onBar(); if(!reduced)onTimeline();
})();
