
(function(){
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && !reduced){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.1});
    revealEls.forEach(function(el){io.observe(el);});
  } else revealEls.forEach(function(el){el.classList.add('in');});

  var bar=document.getElementById('progress'), fill=document.getElementById('actsFill'),
      acts=document.getElementById('acts'), actEls=acts?acts.querySelectorAll('.act'):[];
  function onScroll(){
    var h=document.documentElement, max=h.scrollHeight-h.clientHeight, pct=(max>0?(h.scrollTop/max)*100:0);
    if(bar) bar.style.width=pct+'%';
    if(acts&&fill){
      var r=acts.getBoundingClientRect(), anchor=innerHeight*0.6, total=r.height-12;
      fill.style.height=Math.min(Math.max(anchor-r.top-6,0),total)+'px';
      actEls.forEach(function(a){ (a.getBoundingClientRect().top<anchor)?a.classList.add('lit'):a.classList.remove('lit'); });
    }
  }
  if(reduced&&fill){ fill.style.height='100%'; actEls.forEach(function(a){a.classList.add('lit');}); }
  var tick=false;
  addEventListener('scroll',function(){ if(!tick){ requestAnimationFrame(function(){ onScroll(); tick=false; }); tick=true; } },{passive:true});
  onScroll();

  var card=document.getElementById('incomeCard'), num=document.getElementById('incomeNum'),
      gB=document.getElementById('gaugeBase'), gO=document.getElementById('gaugeOte'), co=document.getElementById('gaugeCo'), fired=false;
  function ifill(){
    if(fired)return; fired=true;
    if(gB)gB.style.width='73%'; if(gO)gO.style.width='100%'; if(co)co.style.left='98%';
    if(reduced){ if(num)num.textContent='18'; return; }
    var v=0,iv=setInterval(function(){ v+=1; if(v>=18){ v=18; clearInterval(iv);} if(num)num.textContent=v; },55);
  }
  if(card){ if('IntersectionObserver' in window){ var io2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){ifill();io2.unobserve(card);}});},{threshold:.4}); io2.observe(card);} else ifill(); }

  var btns=document.querySelectorAll('.jobfilter__btn'), jobs=document.querySelectorAll('.job');
  btns.forEach(function(b){ b.addEventListener('click',function(){
    btns.forEach(function(x){x.classList.remove('is-active');}); b.classList.add('is-active');
    var f=b.getAttribute('data-filter');
    jobs.forEach(function(j){ j.style.display=(f==='all'||j.getAttribute('data-type')===f)?'':'none'; });
  }); });

  function hashOpen(){ var h=location.hash.replace('#',''); if(!h)return; var d=document.getElementById(h); if(d&&d.tagName==='DETAILS'){d.open=true;} }
  addEventListener('hashchange',hashOpen); hashOpen();

  var mbtn=document.getElementById('menuBtn'), navEl=document.getElementById('navBar');
  if(mbtn&&navEl){
    mbtn.addEventListener('click',function(e){ e.stopPropagation(); navEl.classList.toggle('open'); });
    navEl.querySelectorAll('.nav__links a').forEach(function(a){ a.addEventListener('click',function(){ navEl.classList.remove('open'); }); });
    document.addEventListener('click',function(e){ if(!navEl.contains(e.target)) navEl.classList.remove('open'); });
  }

  /* ===== 3D & tuong tac ===== */
  var canHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  // Hero parallax theo chuot: cac lop dich chuyen khac toc do -> chieu sau 3D
  var hero=document.querySelector('.hero'),
      grove=document.querySelector('.hero__grove'),
      hleaf=document.querySelector('.hero .leafdrift'),
      hinner=document.querySelector('.hero__inner');
  if(hero && grove && canHover && !reduced){
    var tx=0,ty=0,px=0,py=0,praf=null;
    function ploop(){
      px+=(tx-px)*0.08; py+=(ty-py)*0.08;
      grove.style.transform='translate3d('+(px*28).toFixed(2)+'px,'+(py*10).toFixed(2)+'px,0) rotateY('+(px*2.4).toFixed(2)+'deg)';
      if(hleaf) hleaf.style.transform='translate3d('+(px*50).toFixed(2)+'px,'+(py*24).toFixed(2)+'px,0)';
      if(hinner) hinner.style.transform='translate3d('+(px*-11).toFixed(2)+'px,'+(py*-6).toFixed(2)+'px,0)';
      if(Math.abs(tx-px)>0.0008||Math.abs(ty-py)>0.0008){ praf=requestAnimationFrame(ploop);} else { praf=null; }
    }
    function pkick(){ if(!praf) praf=requestAnimationFrame(ploop); }
    hero.addEventListener('pointermove',function(e){ if(document.body.classList.contains('edit-on'))return; var r=hero.getBoundingClientRect(); tx=(e.clientX-r.left)/r.width-0.5; ty=(e.clientY-r.top)/r.height-0.5; pkick(); });
    hero.addEventListener('pointerleave',function(){ tx=0; ty=0; pkick(); });
  }

  // The nghieng 3D theo con tro + vet sang chay theo chuot
  if(canHover && !reduced){
    document.querySelectorAll('.truth,.pcard,.office,.trio-card,.belief').forEach(function(c){
      c.classList.add('tilt');
      if(!c.querySelector(':scope > .tilt__sheen')){ var sheen=document.createElement('span'); sheen.className='tilt__sheen'; c.appendChild(sheen); }
      var rc=null;
      c.addEventListener('pointerenter',function(){ rc=c.getBoundingClientRect(); });
      c.addEventListener('pointermove',function(e){ if(document.body.classList.contains('edit-on'))return; 
        if(!rc) rc=c.getBoundingClientRect();
        var mx=(e.clientX-rc.left)/rc.width, my=(e.clientY-rc.top)/rc.height;
        var rx=(0.5-my)*8.5, ry=(mx-0.5)*11;
        c.style.transform='perspective(720px) rotateX('+rx.toFixed(2)+'deg) rotateY('+ry.toFixed(2)+'deg) translateZ(8px)';
        c.style.setProperty('--mx',(mx*100).toFixed(1)+'%');
        c.style.setProperty('--my',(my*100).toFixed(1)+'%');
      });
      c.addEventListener('pointerleave',function(){ c.style.transform=''; rc=null; });
    });
  }

  // Nut nam cham: hut nhe theo chuot
  if(canHover && !reduced){
    document.querySelectorAll('.btn--gold,.btn--primary').forEach(function(b){
      b.classList.add('magnet');
      b.addEventListener('pointermove',function(e){ if(document.body.classList.contains('edit-on'))return; var r=b.getBoundingClientRect(); var mx=(e.clientX-r.left-r.width/2)/r.width, my=(e.clientY-r.top-r.height/2)/r.height; b.style.transform='translate('+(mx*9).toFixed(2)+'px,'+(my*9-2).toFixed(2)+'px)'; });
      b.addEventListener('pointerleave',function(){ b.style.transform=''; });
    });
  }

  // Bac lo trinh: bam vao thi bup mang/cay tre nay len
  document.querySelectorAll('.rung').forEach(function(r){
    r.addEventListener('click',function(){ if(reduced) return; r.classList.remove('pop'); void r.offsetWidth; r.classList.add('pop'); });
  });
})();
