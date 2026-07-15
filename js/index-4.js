
/* ===== FX 3D controller — thêm mới, độc lập với script gốc ===== */
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine    = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* 1) Gắn class dập nổi + tilt cho các thẻ trong lưới */
  var cards = document.querySelectorAll('.vcard, .pillar, .bcard, .person, .office, .vquote');
  cards.forEach(function(el){
    el.classList.add('fx-emboss');
    if (fine && !reduced){
      el.classList.add('fx-tilt');
      var g = document.createElement('span');
      g.className = 'fx-glare';
      el.appendChild(g);
      el.__glare = g;
    }
  });

  /* 2) Dập nổi mạnh cho các khối lớn */
  var strong = {'.storyblock':'fx-emboss fx-emboss--strong',
                '.letter':'fx-emboss fx-emboss--strong',
                '.milestone':'fx-emboss--strong'};
  Object.keys(strong).forEach(function(sel){
    document.querySelectorAll(sel).forEach(function(el){
      strong[sel].split(' ').forEach(function(c){ el.classList.add(c); });
    });
  });

  /* 3) Bật scroll-triggered 3D cho các lưới (chỉ khi cho phép chuyển động) */
  if (!reduced){
    ['.vbento','.mission__pillars','.benefits','.people','.vquotes','.offices'].forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(el){ el.classList.add('fx-grid'); });
    });
  }

  if (reduced) return;   /* người dùng tắt hiệu ứng → dừng phần tương tác */

  /* 4) Tilt theo con trỏ */
  if (fine){
    var MAX = 7; /* độ nghiêng tối đa — "3d 1 chút" */
    document.querySelectorAll('.fx-tilt').forEach(function(card){
      var raf = null;
      function onMove(e){
        var r  = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top)  / r.height;
        var ry = (px - .5) * 2 * MAX;
        var rx = (.5 - py) * 2 * MAX;
        if (card.__glare){
          card.__glare.style.setProperty('--gx', (px*100).toFixed(1)+'%');
          card.__glare.style.setProperty('--gy', (py*100).toFixed(1)+'%');
        }
        if (raf) return;
        raf = requestAnimationFrame(function(){
          card.style.transform = 'perspective(900px) rotateX('+rx.toFixed(2)+'deg) rotateY('+ry.toFixed(2)+'deg) translateY(-6px) scale(1.015)';
          raf = null;
        });
      }
      card.addEventListener('pointerenter', function(){ card.classList.add('is-tilting'); });
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerleave', function(){
        card.classList.remove('is-tilting');
        if (raf){ cancelAnimationFrame(raf); raf = null; }
        card.style.transform = '';
      });
    });

    /* 5) Parallax nhẹ ở Hero (cảnh đồng + nội dung dịch theo chuột & cuộn) */
    var hero = document.querySelector('.hero');
    if (hero){
      var scene = hero.querySelector('.hero__scene');
      var inner = hero.querySelector('.hero__inner');
      var mx=0, my=0, sy=0, hraf=false;
      function apply(){
        if (scene) scene.style.transform = 'translate3d('+(mx*-18).toFixed(1)+'px,'+(my*-8 + sy*0.10).toFixed(1)+'px,0)';
        if (inner) inner.style.transform = 'translate3d('+(mx*6).toFixed(1)+'px,'+(my*3).toFixed(1)+'px,0)';
        hraf=false;
      }
      function req(){ if(!hraf){ hraf=true; requestAnimationFrame(apply); } }
      hero.addEventListener('pointermove', function(e){
        var r = hero.getBoundingClientRect();
        mx = (e.clientX - r.left)/r.width - .5;
        my = (e.clientY - r.top )/r.height - .5;
        req();
      });
      hero.addEventListener('pointerleave', function(){ mx=0; my=0; req(); });
      window.addEventListener('scroll', function(){ sy = Math.min(window.scrollY, 600); req(); }, {passive:true});
    }
  }
})();
