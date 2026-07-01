/* Stackly — scroll-story: sticky photo swaps as right-column content scrolls */
(function(){
  "use strict";

  document.querySelectorAll("[data-scroll-story]").forEach(function(story){
    var blocks = story.querySelectorAll(".story-block");
    var images = story.querySelectorAll(".story-media img");
    var dots   = story.querySelectorAll(".story-progress span");
    if(!blocks.length || !images.length) return;

    var cur = -1;

    function activate(n){
      if(n === cur) return;
      cur = n;
      for(var i = 0; i < images.length; i++){
        if(i === n) images[i].classList.add("active");
        else        images[i].classList.remove("active");
      }
      for(var j = 0; j < dots.length; j++){
        if(j === n) dots[j].classList.add("active");
        else        dots[j].classList.remove("active");
      }
    }

    function sync(){
      var mid  = window.innerHeight * 0.5;
      var next = 0;
      for(var i = 0; i < blocks.length; i++){
        if(blocks[i].getBoundingClientRect().top <= mid) next = i;
      }
      activate(next);
    }

    /* Primary: scroll + resize listeners */
    window.addEventListener("scroll",   sync, {passive: true});
    document.addEventListener("scroll", sync, {passive: true});
    window.addEventListener("resize",   sync, {passive: true});
    window.addEventListener("load",     sync);

    /* Failsafe: poll every 150 ms so image always matches scroll position */
    setInterval(sync, 150);

    activate(0);
    sync();
  });
})();
