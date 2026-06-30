/* Stackly Swimming School — shared site behaviour */
(function(){
  "use strict";

  /* Preloader */
  window.addEventListener("load",function(){
    var pl=document.getElementById("preloader");
    if(pl){ setTimeout(function(){ pl.classList.add("loaded"); },350); }
  });

  /* Navbar scroll state + mobile menu */
  var navbar=document.querySelector(".navbar");
  var hamburger=document.querySelector(".hamburger");
  var navLinks=document.querySelector(".nav-links");

  function onScroll(){
    if(!navbar) return;
    if(window.scrollY>40) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");

    var btt=document.querySelector(".back-to-top");
    if(btt){ window.scrollY>500 ? btt.classList.add("show") : btt.classList.remove("show"); }
  }
  document.addEventListener("scroll",onScroll);
  onScroll();

  if(hamburger&&navLinks){
    /* Inject X close button inside mobile sidebar */
    var navClose=document.createElement("button");
    navClose.className="nav-close";
    navClose.setAttribute("aria-label","Close menu");
    navClose.innerHTML='<i class="fa-solid fa-xmark"></i>';
    navLinks.insertBefore(navClose,navLinks.firstChild);
    navClose.addEventListener("click",function(){
      hamburger.classList.remove("active");
      navLinks.classList.remove("open");
    });

    hamburger.addEventListener("click",function(){
      hamburger.classList.toggle("active");
      navLinks.classList.toggle("open");
    });
    navLinks.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click",function(){
        hamburger.classList.remove("active");
        navLinks.classList.remove("open");
      });
    });
  }

  /* Mark active nav link */
  (function(){
    var path=location.pathname.split("/").pop()||"index.html";
    document.querySelectorAll(".nav-links a").forEach(function(a){
      var href=a.getAttribute("href");
      if(href===path) a.classList.add("active");
    });
  })();

  /* Dark mode — permanently locked, no toggle */
  document.documentElement.setAttribute("data-theme","dark");
  localStorage.removeItem("stackly_theme_v2");

  /* Redirect all non-functional links/buttons → 404 */
  document.querySelectorAll('a[href="#"]').forEach(function(a){
    a.addEventListener("click",function(e){
      e.preventDefault();
      window.location.href="404.html";
    });
  });
  document.querySelectorAll(".social-btn").forEach(function(btn){
    btn.addEventListener("click",function(e){
      e.preventDefault();
      window.location.href="404.html";
    });
  });

  /* Back to top */
  var btt=document.querySelector(".back-to-top");
  if(btt){ btt.addEventListener("click",function(){ window.scrollTo({top:0,behavior:"smooth"}); }); }

  /* Scroll reveal */
  var revealEls=document.querySelectorAll("[data-reveal]");
  if("IntersectionObserver" in window && revealEls.length){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          var delay=e.target.getAttribute("data-delay")||0;
          setTimeout(function(){ e.target.classList.add("in-view"); },Number(delay));
          io.unobserve(e.target);
        }
      });
    },{threshold:.15});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add("in-view"); });
  }

  /* Counters */
  var counters=document.querySelectorAll("[data-count]");
  if(counters.length && "IntersectionObserver" in window){
    var cio=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        var el=e.target, target=parseFloat(el.getAttribute("data-count")), suffix=el.getAttribute("data-suffix")||"";
        var dur=1600, start=null;
        function step(ts){
          if(!start) start=ts;
          var p=Math.min((ts-start)/dur,1);
          var val=(target*(1-Math.pow(1-p,3)));
          el.textContent=(target%1===0?Math.floor(val):val.toFixed(1))+suffix;
          if(p<1) requestAnimationFrame(step);
          else el.textContent=target+suffix;
        }
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    },{threshold:.4});
    counters.forEach(function(c){ cio.observe(c); });
  }

  /* Accordion (FAQ) */
  document.querySelectorAll(".accordion-item").forEach(function(item){
    var head=item.querySelector(".accordion-head");
    var body=item.querySelector(".accordion-body");
    if(!head||!body) return;
    head.addEventListener("click",function(){
      var open=item.classList.contains("open");
      item.parentElement.querySelectorAll(".accordion-item").forEach(function(i){
        i.classList.remove("open");
        i.querySelector(".accordion-body").style.maxHeight=null;
      });
      if(!open){
        item.classList.add("open");
        body.style.maxHeight=body.scrollHeight+"px";
      }
    });
  });

  /* Generic slider (testimonials / others) */
  document.querySelectorAll("[data-slider]").forEach(function(slider){
    var track=slider.querySelector(".slider-track");
    var slides=track?Array.from(track.children):[];
    var dotsWrap=slider.querySelector(".slider-dots");
    var idx=0;
    if(!track||!slides.length) return;
    function go(i){
      idx=(i+slides.length)%slides.length;
      track.style.transform="translateX(-"+(idx*100)+"%)";
      if(dotsWrap){
        dotsWrap.querySelectorAll("button").forEach(function(d,di){ d.classList.toggle("active",di===idx); });
      }
    }
    if(dotsWrap){
      slides.forEach(function(_,i){
        var b=document.createElement("button");
        if(i===0) b.classList.add("active");
        b.addEventListener("click",function(){ go(i); });
        dotsWrap.appendChild(b);
      });
    }
    var prev=slider.querySelector(".slider-arrow.prev");
    var next=slider.querySelector(".slider-arrow.next");
    if(prev) prev.addEventListener("click",function(){ go(idx-1); });
    if(next) next.addEventListener("click",function(){ go(idx+1); });
    var auto=slider.getAttribute("data-autoplay");
    if(auto){ setInterval(function(){ go(idx+1); },Number(auto)); }
  });

  /* Ripple removed — was causing buttons to grow on click */

  /* Cursor glow */
  var glow=document.querySelector(".cursor-glow");
  if(glow){
    document.addEventListener("mousemove",function(e){
      glow.style.left=e.clientX+"px";
      glow.style.top=e.clientY+"px";
    });
  }

  /* Modals */
  document.querySelectorAll("[data-modal-open]").forEach(function(btn){
    btn.addEventListener("click",function(){
      var m=document.getElementById(btn.getAttribute("data-modal-open"));
      if(m) m.classList.add("open");
    });
  });
  document.querySelectorAll("[data-modal-close]").forEach(function(btn){
    btn.addEventListener("click",function(){ btn.closest(".modal-overlay").classList.remove("open"); });
  });
  document.querySelectorAll(".modal-overlay").forEach(function(ov){
    ov.addEventListener("click",function(e){ if(e.target===ov) ov.classList.remove("open"); });
  });

  /* Toast helper (global) */
  window.StacklyToast=function(type,title,msg){
    var stack=document.querySelector(".toast-stack");
    if(!stack){ stack=document.createElement("div"); stack.className="toast-stack"; document.body.appendChild(stack); }
    var icon=type==="error"?"fa-circle-exclamation":(type==="warn"?"fa-triangle-exclamation":"fa-circle-check");
    var t=document.createElement("div");
    t.className="toast "+type;
    t.innerHTML='<i class="fa-solid '+icon+'"></i><div><strong>'+title+'</strong><p>'+msg+'</p></div>';
    stack.appendChild(t);
    setTimeout(function(){ t.style.opacity="0"; t.style.transform="translateX(40px)"; t.style.transition="all .4s"; setTimeout(function(){ t.remove(); },400); },3800);
  };

  /* Password visibility toggle */
  document.querySelectorAll(".field-toggle").forEach(function(tg){
    tg.addEventListener("click",function(){
      var input=tg.previousElementSibling.tagName==="INPUT"?tg.previousElementSibling:tg.parentElement.querySelector("input");
      if(!input) return;
      var show=input.type==="password";
      input.type=show?"text":"password";
      tg.innerHTML='<i class="fa-solid '+(show?"fa-eye-slash":"fa-eye")+'"></i>';
    });
  });

  /* Image fallback — swap any broken photo for a branded gradient placeholder */
  var FALLBACK_SRC="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%230077B6'/%3E%3Cstop offset='1' stop-color='%2300C2FF'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='400' fill='url(%23g)'/%3E%3Ctext x='50%25' y='52%25' font-family='Arial' font-size='28' fill='white' text-anchor='middle' opacity='.85'%3E%F0%9F%8F%8A Stackly%3C/text%3E%3C/svg%3E";
  document.querySelectorAll("img").forEach(function(img){
    img.addEventListener("error",function(){
      if(img.src.indexOf("data:image/svg")===0) return;
      img.onerror=null; img.src=FALLBACK_SRC; img.classList.add("img-fallback");
    });
  });

  /* Mouse parallax for hero blobs */
  document.querySelectorAll("[data-parallax]").forEach(function(zone){
    var items=zone.querySelectorAll(".blob,[data-parallax-item]");
    zone.addEventListener("mousemove",function(e){
      var rect=zone.getBoundingClientRect();
      var x=(e.clientX-rect.left)/rect.width-0.5;
      var y=(e.clientY-rect.top)/rect.height-0.5;
      items.forEach(function(it,i){
        var depth=(i+1)*10;
        it.style.transform="translate("+(x*depth)+"px,"+(y*depth)+"px)";
      });
    });
  });

})();
