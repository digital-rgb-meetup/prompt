
function initPage(){
var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// reveal
var els=document.querySelectorAll('.reveal');
if('IntersectionObserver' in window && !reduced){
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});
els.forEach(function(el){io.observe(el);});
} else els.forEach(function(el){el.classList.add('in');});
// progress
var bar=document.getElementById('progress');
addEventListener('scroll',function(){var h=document.documentElement,m=h.scrollHeight-h.clientHeight;if(bar)bar.style.width=(m>0?(h.scrollTop/m)*100:0)+'%';},{passive:true});
// gauge
var card=document.getElementById('incomeCard'),num=document.getElementById('incomeNum'),
gB=document.getElementById('gaugeBase'),gO=document.getElementById('gaugeOte'),co=document.getElementById('gaugeCo'),fired=false;
function fill(){
if(fired)return;fired=true;
if(gB)gB.style.width='16%'; if(gO)gO.style.width='95%'; if(co)co.style.left='93%';
if(reduced){if(num)num.textContent='60';return;}
var v=0,iv=setInterval(function(){v+=2;if(v>=60){v=60;clearInterval(iv);}if(num)num.textContent=v;},34);
}
if(card){ if('IntersectionObserver' in window){var io2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){fill();io2.unobserve(card);}});},{threshold:.4});io2.observe(card);} else fill(); }
// filter
var btns=document.querySelectorAll('.jobfilter__btn'),jobs=document.querySelectorAll('.job');
btns.forEach(function(b){b.addEventListener('click',function(){
btns.forEach(function(x){x.classList.remove('is-active');});b.classList.add('is-active');
var f=b.getAttribute('data-filter');
jobs.forEach(function(j){j.style.display=(f==='all'||j.getAttribute('data-type')===f)?'':'none';});
});});
// hash open
function hashOpen(){var h=location.hash.replace('#','');if(!h)return;var d=document.getElementById(h);if(d&&d.tagName==='DETAILS'){d.open=true;}}
addEventListener('hashchange',hashOpen);hashOpen();
// menu (mobile): mở/đóng dropdown
var mbtn=document.querySelector('.nav__menu'),drop=document.getElementById('navDrop');
if(mbtn&&drop){
mbtn.addEventListener('click',function(){drop.classList.toggle('open');});
drop.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){drop.classList.remove('open');});});
document.addEventListener('click',function(e){if(!drop.contains(e.target)&&e.target!==mbtn)drop.classList.remove('open');});
}
// === Tương tác: bấm chuột là có cò bay ===
(function(){
if(window.__craneWired)return;window.__craneWired=1;
var syms=['co-glide','co-up','co-down'];
function crane(x,y,delay){
var el=document.createElement('div');el.className='click-crane';
el.style.left=(x-22)+'px';el.style.top=(y-13)+'px';
el.style.setProperty('--dx',((Math.random()<.5?-1:1)*(70+Math.random()*120))+'px');
el.style.setProperty('--dy',(-(190+Math.random()*140))+'px');
el.style.setProperty('--rot',(-6-Math.random()*12)+'deg');
el.style.animationDelay=delay+'ms';
var s=syms[Math.floor(Math.random()*syms.length)];
el.innerHTML='<svg viewBox="0 0 170 100"><g transform="translate(170 0) scale(-1 1)"><use href="#'+s+'"></use></g></svg>';
document.body.appendChild(el);
setTimeout(function(){el.remove();},2500+delay);
}
document.addEventListener('click',function(e){
if(reduced||document.body.classList.contains('editing'))return;
if(e.target.closest('a,button,summary,details,input,textarea,select,label,.nav,.jobfilter__btn'))return;
var n=1+Math.floor(Math.random()*2);
for(var i=0;i<n;i++)crane(e.clientX,e.clientY,i*130);
},{passive:true});
})();
// === Tương tác: nghiêng nhẹ thẻ kính theo con trỏ ===
(function(){
if(reduced||!window.matchMedia||!matchMedia('(pointer:fine)').matches)return;
document.querySelectorAll('.pcard,.trio-card').forEach(function(c){
c.addEventListener('pointerenter',function(){c.classList.add('tilt-on');});
c.addEventListener('pointermove',function(e){
if(document.body.classList.contains('editing'))return;
var r=c.getBoundingClientRect();
var px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
c.style.transform='perspective(760px) rotateX('+(-py*4).toFixed(2)+'deg) rotateY('+(px*5).toFixed(2)+'deg) translateY(-5px)';
});
c.addEventListener('pointerleave',function(){c.classList.remove('tilt-on');c.style.transform='';});
});
})();
// === Mini game: chốt deal (CSS Grid) ===
(function(){
var grid=document.getElementById('mgGrid');if(!grid)return;
var board=grid.parentNode,cells=[],N=9;
var elScore=document.getElementById('mgScore'),elTime=document.getElementById('mgTime'),elBest=document.getElementById('mgBest');
var overlay=document.getElementById('mgOverlay'),title=document.getElementById('mgTitle'),msg=document.getElementById('mgMsg'),startBtn=document.getElementById('mgStart'),applyBtn=document.getElementById('mgApply');
var score=0,time=0,best=0,running=false,tick=null,spawner=null;
try{var sb=localStorage.getItem('mg_best');if(sb)best=parseInt(sb,10)||0;}catch(e){}
elBest.textContent=best;
var syms=['co-glide','co-up','co-down'];
function bird(){var s=syms[Math.floor(Math.random()*syms.length)];return '<svg viewBox="0 0 170 100"><g transform="translate(170 0) scale(-1 1)"><use href="#'+s+'"></use></g></svg>';}
var cloud='<svg viewBox="0 0 64 40"><path d="M20 34h28a10 10 0 0 0 1-20 14 14 0 0 0-26-4 9 9 0 0 0-3 24z"/></svg>';
function build(){for(var i=0;i<N;i++){var c=document.createElement('button');c.type='button';c.className='mg-cell';c.setAttribute('aria-label','ô ruộng');var a=document.createElement('span');a.className='mg-actor';c.appendChild(a);grid.appendChild(c);var o={el:c,actor:a,kind:null,timer:null};cells.push(o);(function(cell){cell.el.addEventListener('click',function(){onHit(cell);});})(o);}}
function clearCell(cell){cell.kind=null;cell.el.classList.remove('up');cell.actor.className='mg-actor';cell.actor.innerHTML='';if(cell.timer){clearTimeout(cell.timer);cell.timer=null;}}
function spawn(){var em=cells.filter(function(c){return !c.kind;});if(!em.length)return;var cell=em[Math.floor(Math.random()*em.length)];var isCloud=Math.random()<0.22;cell.kind=isCloud?'cloud':'bird';cell.actor.className='mg-actor '+cell.kind;cell.actor.innerHTML=isCloud?cloud:bird();void cell.el.offsetWidth;cell.el.classList.add('up');var life=Math.max(650,1100-score*12);cell.timer=setTimeout(function(){clearCell(cell);},life);}
function floatTxt(cell,txt,cls){var f=document.createElement('span');f.className='mg-float '+cls;f.textContent=txt;f.style.left=(cell.el.offsetLeft+cell.el.offsetWidth/2)+'px';f.style.top=(cell.el.offsetTop+8)+'px';board.appendChild(f);setTimeout(function(){f.remove();},700);}
function onHit(cell){if(!running||!cell.kind)return;if(cell.kind==='bird'){score++;cell.el.classList.add('hit');floatTxt(cell,'+1','plus');}else{score=Math.max(0,score-1);cell.el.classList.add('bad');floatTxt(cell,'\u22121','minus');}elScore.textContent=score;var cc=cell.el;setTimeout(function(){cc.classList.remove('hit','bad');},320);clearCell(cell);}
function start(){if(running)return;score=0;time=20;running=true;elScore.textContent=0;elTime.textContent=20;overlay.classList.add('hide');startBtn.classList.remove('mg-cta-arm');cells.forEach(clearCell);tick=setInterval(function(){time--;elTime.textContent=time;if(time<=0)end();},1000);spawner=setInterval(spawn,640);spawn();spawn();}
function end(){running=false;clearInterval(tick);clearInterval(spawner);cells.forEach(clearCell);if(score>best){best=score;elBest.textContent=best;try{localStorage.setItem('mg_best',best);}catch(e){}}var m;if(score>=22)m='Sát thủ chốt deal! Đội Sales cần đúng người như bạn.';else if(score>=14)m='Phản xạ tốt lắm — bạn có tố chất sales đấy.';else if(score>=7)m='Khởi đầu ổn! Vào Meetup luyện thêm là bùng nổ.';else m='Cứ từ từ, sales là nghề luyện được. Quan trọng là dám bắt đầu.';
title.textContent='Bạn chốt được '+score+' deal!';msg.textContent=m;startBtn.textContent='Chơi lại \u25b8';applyBtn.style.display='';overlay.classList.remove('hide');}
build();startBtn.addEventListener('click',start);
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&!running&&!reduced){startBtn.classList.add('mg-cta-arm');io.disconnect();}});},{threshold:.5});io.observe(board);}
})();
// === Co cuoi thanh tien do doc (scroll) ===
(function(){
if(reduced)return;var prog=document.getElementById('progress');if(!prog)return;
var cr=document.createElement('div');cr.className='progress-crane';
cr.innerHTML='<svg viewBox="0 0 170 100"><g transform="translate(170 0) scale(-1 1)"><use href="#co-glide"></use></g></svg>';
prog.parentNode.appendChild(cr);
function upd(){var h=document.documentElement,m=h.scrollHeight-h.clientHeight;cr.style.left=(m>0?(h.scrollTop/m)*100:0)+'%';}
addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();
})();
}
