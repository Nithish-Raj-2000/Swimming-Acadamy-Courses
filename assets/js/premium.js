/* Stackly — scroll-story sticky image swap */
(function(){
  "use strict";
  document.querySelectorAll("[data-scroll-story]").forEach(function(story){
    var blocks=story.querySelectorAll(".story-block");
    var images=story.querySelectorAll(".story-media img");
    var dots=story.querySelectorAll(".story-progress span");
    if(!blocks.length||!images.length) return;

    function setActive(i){
      images.forEach(function(img,idx){ img.classList.toggle("active",idx===i); });
      dots.forEach(function(d,idx){ d.classList.toggle("active",idx===i); });
    }
    setActive(0);

    if("IntersectionObserver" in window){
      var io=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            var idx=Array.prototype.indexOf.call(blocks,entry.target);
            if(idx>-1) setActive(idx);
          }
        });
      },{rootMargin:"-45% 0px -45% 0px",threshold:0});
      blocks.forEach(function(b){ io.observe(b); });
    }
  });
})();
