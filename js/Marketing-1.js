
(async function(){
var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var STORE_KEYS=['top','vi-tri','that-that','chan-dung','vi-sao','thu-nhap','lo-trinh','van-hoa','ung-tuyen','footer'];
// Đổi số này mỗi lần code/markup gốc được cập nhật, để bản đã lưu cũ không đè lên bản mới
var CONTENT_VERSION='v17';
function storeKey(k){ return 'content:'+CONTENT_VERSION+':'+k; }

// Khôi phục nội dung đã lưu (nếu có).
// Chạy song song + giới hạn thời gian chờ: nếu bộ nhớ không sẵn sàng (ví dụ khi mở bằng link
// công khai), phải bỏ qua ngay để còn kịp gắn sự kiện cho các nút, không được treo cả trang.
function restoreSavedContent(){
if(!window.storage) return Promise.resolve();
var expired=false;
var jobs=STORE_KEYS.map(function(key){
return Promise.resolve()
.then(function(){ return window.storage.get(storeKey(key), false); })
.then(function(res){
// nếu đã quá hạn chờ thì bỏ qua: lúc này sự kiện đã gắn xong,
// ghi đè innerHTML sẽ làm mất luôn các nút bấm
if(expired) return;
if(res&&res.value){
var el=document.querySelector('[data-store-key="'+key+'"]');
if(el)el.innerHTML=res.value;
}
})
.catch(function(){ /* chưa có bản lưu cho key này, bỏ qua */ });
});
var timeout=new Promise(function(resolve){ setTimeout(function(){ expired=true; resolve(); },1500); });
return Promise.race([Promise.all(jobs), timeout]);
}
try{ await restoreSavedContent(); }catch(e){ /* không để lỗi bộ nhớ chặn phần còn lại */ }

// grain burst confetti: dùng chung cho cối giã và nút gửi CV
// t = tiến trình giã (0 = thóc nâu, 1 = gạo trắng ngần). Bỏ trống thì dùng màu vàng mặc định.
function grainBurst(x,y,count,t){
if(reduced)return;
count=count||14;
var top,bot,glow;
if(typeof t==='number'){
// thóc (nâu sẫm) -> gạo trắng ngần
var lerp=function(a,b){ return Math.round(a+(b-a)*t); };
top='rgb('+lerp(166,255)+','+lerp(124,253)+','+lerp(74,247)+')';
bot='rgb('+lerp(120,227)+','+lerp(82,190)+','+lerp(45,120)+')';
glow='rgba('+lerp(140,255)+','+lerp(100,246)+','+lerp(55,200)+','+(0.35+0.45*t).toFixed(2)+')';
}
for(var i=0;i<count;i++){
var p=document.createElement('div');
p.className='grain-particle';
var dist=50+Math.random()*100,ang=Math.random()*Math.PI*2;
var dx=Math.cos(ang)*dist, dy=Math.sin(ang)*dist-30;
p.style.left=x+'px'; p.style.top=y+'px';
p.style.setProperty('--dx',dx+'px');
p.style.setProperty('--dy',dy+'px');
p.style.setProperty('--rot',(Math.random()*360)+'deg');
if(top){
p.style.setProperty('--g-top',top);
p.style.setProperty('--g-bot',bot);
p.style.setProperty('--g-glow',glow);
}
document.body.appendChild(p);
(function(el){setTimeout(function(){el.remove();},800);})(p);
}
}

// hạt gạo rơi nhẹ theo con trỏ chuột khi di chuyển — throttle kỹ để không nặng máy
if(!reduced && window.matchMedia('(pointer:fine)').matches){
var lastTrail=0;
document.addEventListener('mousemove',function(e){
if(document.body.classList.contains('edit-mode'))return;
var now=Date.now();
if(now-lastTrail<160)return;
lastTrail=now;
if(document.querySelectorAll('.grain-trail').length>24)return;
var p=document.createElement('div');
p.className='grain-trail';
p.style.left=(e.clientX-3)+'px';
p.style.top=(e.clientY-2)+'px';
document.body.appendChild(p);
setTimeout(function(){p.remove();},900);
},{passive:true});
}

// reveal on scroll
var els=document.querySelectorAll('.reveal');
if('IntersectionObserver' in window && !reduced){
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});
els.forEach(function(el){io.observe(el);});
} else els.forEach(function(el){el.classList.add('in');});

// hero parallax: mỗi lớp trôi theo tốc độ khác nhau khi cuộn, tạo chiều sâu 3D
var heroSection=document.getElementById('top');
if(heroSection && !reduced){
var players=[
{el:document.querySelector('.stars'),speed:.18},
{el:document.getElementById('glowLayer'),speed:.32},
{el:document.querySelector('.grainfx'),speed:.46},
{el:document.querySelector('.hero__grain-layer'),speed:.14},
{el:document.querySelector('.hero__scene'),speed:.06}
].filter(function(p){return p.el;});
var ticking=false;
function updateParallax(){
var rect=heroSection.getBoundingClientRect();
if(rect.bottom>0 && rect.top<window.innerHeight){
var y=-rect.top; // 0 khi hero vừa chạm đỉnh, dương khi cuộn xuống
players.forEach(function(p){ p.el.style.transform='translateY('+(y*p.speed)+'px)'; });
}
ticking=false;
}
addEventListener('scroll',function(){ if(!ticking){ requestAnimationFrame(updateParallax); ticking=true; } },{passive:true});
updateParallax();
}

// scroll progress
var bar=document.getElementById('progress');
addEventListener('scroll',function(){var h=document.documentElement,m=h.scrollHeight-h.clientHeight;if(bar)bar.style.width=(m>0?(h.scrollTop/m)*100:0)+'%';},{passive:true});

// jar gauge (quyền lợi): count-up + fill
var card=document.getElementById('incomeCard'),num=document.getElementById('incomeNum'),
peakNum=document.getElementById('peakNum'),peakCard=document.getElementById('peakCard'),
jB=document.getElementById('jarBase'),jF=document.getElementById('jarFull'),jg=document.getElementById('jarGrain'),fired=false;
function fillJar(){
if(fired)return;fired=true;
if(jB)jB.style.width='30%'; if(jF)jF.style.width='100%'; if(jg)jg.style.left='97%';
if(reduced){
if(num)num.textContent='3';
if(peakNum)peakNum.textContent='20';
return;
}
var v=0,iv=setInterval(function(){v+=1;if(v>=3){v=3;clearInterval(iv);}if(num)num.textContent=v;},220);

// số 20 triệu: đếm nhanh dần rồi bắn hạt gạo ăn mừng
if(peakNum){
var p=0,step=0;
var pv=setInterval(function(){
step++;
p=Math.min(20,Math.round(20*(1-Math.pow(1-step/26,3))));
peakNum.textContent=p;
if(p>=20){
clearInterval(pv);
peakNum.textContent='20';
if(peakCard){
var r=peakCard.getBoundingClientRect();
grainBurst(r.left+r.width/2,r.top+r.height/2,22,1);
}
}
},45);
}
}
if(card){ if('IntersectionObserver' in window){var io2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){fillJar();io2.unobserve(card);}});},{threshold:.4});io2.observe(card);} else fillJar(); }

// mortar & pestle: giã 20 chày để thóc thành gạo trắng
var mortar=document.getElementById('mortarBtn'),poundCount=document.getElementById('poundCount'),
poundHint=document.getElementById('poundHint'),poundBar=document.getElementById('poundBar'),
poundGrain=document.getElementById('poundGrain');
var POUND_GOAL=20, pounds=0, poundDone=false;

// màu hạt: thóc nâu -> gạo trắng ngần
function grainColor(t){
var from=[138,95,56], to=[255,253,247];
var c=from.map(function(v,i){ return Math.round(v+(to[i]-v)*t); });
return 'rgb('+c[0]+','+c[1]+','+c[2]+')';
}
function poundHintFor(p){
if(p===0)return 'Bấm vào cối để bắt đầu giã thóc';
if(p<5)return 'Còn nguyên lớp trấu, giã tiếp đi';
if(p<10)return 'Trấu bong dần rồi đó';
if(p<15)return 'Hạt đang sáng lên, đừng dừng';
if(p<POUND_GOAL)return 'Sắp trắng rồi, ráng thêm vài chày';
return 'Gạo trắng ngần! Nội dung cũng vậy, càng giã càng tinh.';
}
if(mortar){
mortar.addEventListener('click',function(){
if(pounds<POUND_GOAL)pounds++;
var t=pounds/POUND_GOAL;
if(poundCount)poundCount.textContent=pounds;
if(poundBar)poundBar.style.width=(t*100)+'%';
if(poundGrain){
var svg=poundGrain.querySelector('svg');
if(svg)svg.style.color=grainColor(t);
}
if(poundHint)poundHint.textContent=poundHintFor(pounds);
mortar.classList.remove('pound'); void mortar.offsetWidth; mortar.classList.add('pound');
var r=mortar.getBoundingClientRect();
grainBurst(r.left+34,r.top+22,pounds>=POUND_GOAL?30:8,t);

if(pounds>=POUND_GOAL && !poundDone){
poundDone=true;
mortar.classList.add('is-done');
setTimeout(function(){ grainBurst(r.left+34,r.top+22,26,1); },220);
setTimeout(function(){
var target=document.getElementById('vi-tri');
if(target)target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
},1400);
}
});
}

// tilt 3D nhẹ theo con trỏ chuột (chỉ desktop, có chuột thật)
if(window.matchMedia('(pointer:fine)').matches && !reduced){
document.querySelectorAll('.trio-card,.pcard,.job').forEach(function(el){
el.classList.add('tilt');
el.addEventListener('mousemove',function(e){
var r=el.getBoundingClientRect();
var x=e.clientX-r.left,y=e.clientY-r.top;
var rx=((y/r.height)-0.5)*-7,ry=((x/r.width)-0.5)*7;
el.style.transform='perspective(800px) rotateX('+rx+'deg) rotateY('+ry+'deg) translateY(-4px)';
});
el.addEventListener('mouseleave',function(){ el.style.transform=''; });
});
}

// hero: vệt sáng theo con trỏ chuột
var heroEl=document.getElementById('top'),heroSpot=document.getElementById('heroSpot');
if(heroEl&&heroSpot&&window.matchMedia('(pointer:fine)').matches && !reduced){
heroEl.addEventListener('mousemove',function(e){
var r=heroEl.getBoundingClientRect();
heroSpot.style.left=(e.clientX-r.left)+'px';
heroSpot.style.top=(e.clientY-r.top)+'px';
});
}

// language toggle (Pháp / Ả Rập)
var langBtns=document.querySelectorAll('.langbtn');
var jobTitle=document.getElementById('jobTitle'),jobLangChip=document.getElementById('jobLangChip'),
jobApplyCode=document.getElementById('jobApplyCode'),jobApplyBtn=document.getElementById('jobApplyBtn');
var langData={
fr:{title:'Intern Content Creator – Tiếng Pháp',chip:'<span class="lang-badge">FR</span>Tiếng Pháp là lợi thế',code:'[INTERN CONTENT CREATOR TIẾNG PHÁP] + Họ và tên + SĐT',subject:'%5BINTERN%20CONTENT%20CREATOR%20TIENG%20PHAP%5D%20Ho%20ten%20-%20SDT'},
ar:{title:'Intern Content Creator – Tiếng Ả Rập',chip:'<span class="lang-badge">AR</span>Tiếng Ả Rập là lợi thế',code:'[INTERN CONTENT CREATOR TIẾNG Ả RẬP] + Họ và tên + SĐT',subject:'%5BINTERN%20CONTENT%20CREATOR%20TIENG%20A%20RAP%5D%20Ho%20ten%20-%20SDT'}
};
langBtns.forEach(function(b){
b.addEventListener('click',function(){
langBtns.forEach(function(x){x.classList.remove('is-active');});
b.classList.add('is-active');
var d=langData[b.getAttribute('data-lang')];
if(!d)return;
if(jobTitle)jobTitle.textContent=d.title;
if(jobLangChip)jobLangChip.innerHTML=d.chip;
if(jobApplyCode)jobApplyCode.textContent=d.code;
if(jobApplyBtn)jobApplyBtn.href='mailto:hr@meetup.travel?subject='+d.subject;
});
});

// nút Gửi CV: bắn hạt gạo ăn mừng trước khi mở mail
if(jobApplyBtn){
jobApplyBtn.addEventListener('click',function(e){
grainBurst(e.clientX,e.clientY,18);
});
}

// mobile menu
var mbtn=document.querySelector('.nav__menu'),drop=document.getElementById('navDrop');
if(mbtn&&drop){
mbtn.addEventListener('click',function(){drop.classList.toggle('open');});
drop.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){drop.classList.remove('open');});});
document.addEventListener('click',function(e){if(!drop.contains(e.target)&&e.target!==mbtn)drop.classList.remove('open');});
}

})();
