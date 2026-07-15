
(function(){
  document.querySelectorAll('.vphone[data-drive]').forEach(function(p){
    p.addEventListener('click', function(){
      if(p.classList.contains('playing')) return;
      var f=document.createElement('iframe');
      f.src=p.getAttribute('data-drive'); f.setAttribute('allow','autoplay; encrypted-media; fullscreen'); f.setAttribute('allowfullscreen','');
      p.classList.add('playing'); p.appendChild(f);
    });
  });
})();
