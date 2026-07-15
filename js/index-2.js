
(function(){
  var lb=document.getElementById('lb'); if(!lb) return;
  var lbImg=document.getElementById('lbImg'), lbCount=document.getElementById('lbCount');
  var prev=lb.querySelector('.lb__prev'), next=lb.querySelector('.lb__next');
  var imgs=[], idx=0;
  function show(){ lbImg.src=imgs[idx]; lbCount.textContent=(idx+1)+' / '+imgs.length; var m=imgs.length>1; prev.hidden=next.hidden=lbCount.hidden=!m; }
  function openLb(list,st){ imgs=list; idx=st||0; show(); lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
  function closeLb(){ lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  document.querySelectorAll('.galc').forEach(function(c){
    function go(){
      var gi=c.getAttribute('data-gi');
      var list=[].slice.call(c.querySelectorAll('img')).map(function(i){return i.getAttribute('src');});
      [].forEach.call(document.querySelectorAll('#galStore img[data-gi="'+gi+'"]'),function(i){ list.push(i.getAttribute('src')); });
      openLb(list,0);
    }
    c.addEventListener('click',go);
    c.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){e.preventDefault();go();} });
  });
  prev.addEventListener('click',function(e){e.stopPropagation();idx=(idx-1+imgs.length)%imgs.length;show();});
  next.addEventListener('click',function(e){e.stopPropagation();idx=(idx+1)%imgs.length;show();});
  lb.querySelector('.lb__close').addEventListener('click',closeLb);
  lb.addEventListener('click',function(e){ if(e.target===lb) closeLb(); });
  document.addEventListener('keydown',function(e){ if(!lb.classList.contains('open'))return; if(e.key==='Escape')closeLb(); else if(e.key==='ArrowLeft')prev.click(); else if(e.key==='ArrowRight')next.click(); });
})();
