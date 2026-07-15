
(function(){
  try{
    var mq=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!mq||reduced) return;
    if(!document.body.animate) return;
    var COLORS=['#78b238','#5c9e33','#8fbb52','#6aa63a','#4f882c','#a9c793'];
    var box=document.getElementById('leafTrail');
    if(!box){ box=document.createElement('div'); box.id='leafTrail'; box.setAttribute('aria-hidden','true'); document.body.appendChild(box); }
    else { box.innerHTML=''; }
    var lastX=0,lastY=0,started=false,count=0;
    function leafSVG(size,color){
      var NS='http://www.w3.org/2000/svg';
      var s=document.createElementNS(NS,'svg');
      s.setAttribute('viewBox','0 0 44 16'); s.setAttribute('width',size); s.setAttribute('height',(size*16/44).toFixed(1));
      var p=document.createElementNS(NS,'path');
      p.setAttribute('d','M0 8 C12 -3 32 -3 44 8 C32 13 12 13 0 8 Z'); p.setAttribute('fill',color);
      var v=document.createElementNS(NS,'path');
      v.setAttribute('d','M4 8 H40'); v.setAttribute('stroke','rgba(255,255,255,.4)'); v.setAttribute('stroke-width','1'); v.setAttribute('fill','none');
      s.appendChild(p); s.appendChild(v); return s;
    }
    function spawn(x,y){
      if(count>24) return;
      var size=13+Math.random()*13;
      var el=document.createElement('div'); el.className='trail-leaf';
      el.appendChild(leafSVG(size, COLORS[(Math.random()*COLORS.length)|0]));
      box.appendChild(el); count++;
      var r0=Math.random()*360, dx=(Math.random()*46-23), dy=40+Math.random()*56, dr=(Math.random()*240-120), dur=950+Math.random()*450;
      var a=el.animate([
        {transform:'translate('+x+'px,'+y+'px) rotate('+r0+'deg) scale(.5)',opacity:0},
        {transform:'translate('+(x+dx*0.3)+'px,'+(y+dy*0.16)+'px) rotate('+(r0+dr*0.25)+'deg) scale(1)',opacity:.95,offset:.16},
        {transform:'translate('+(x+dx)+'px,'+(y+dy)+'px) rotate('+(r0+dr)+'deg) scale(.66)',opacity:0}
      ],{duration:dur,easing:'cubic-bezier(.35,.55,.4,1)'});
      function done(){ if(el.parentNode) el.remove(); count--; }
      a.onfinish=done; a.oncancel=done;
    }
    window.addEventListener('pointermove',function(e){
      if(e.pointerType==='touch') return;
      if(document.body.classList.contains('edit-on')) return;
      if(!started){ lastX=e.clientX; lastY=e.clientY; started=true; return; }
      var mx=e.clientX-lastX, my=e.clientY-lastY;
      if(mx*mx+my*my < 900) return;
      lastX=e.clientX; lastY=e.clientY;
      spawn(e.clientX, e.clientY);
    },{passive:true});
  }catch(err){}
})();
