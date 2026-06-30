/* Stackly — shared dashboard behaviour (sidebar, tabs, dropdowns, charts) */
(function(){
  "use strict";

  /* Load session into topbar/sidebar placeholders */
  var session=window.StacklyAuth?window.StacklyAuth.getSession():null;
  if(session){
    document.querySelectorAll("[data-user-name]").forEach(function(el){ el.textContent=session.name; });
    document.querySelectorAll("[data-user-role]").forEach(function(el){ el.textContent=session.role.charAt(0).toUpperCase()+session.role.slice(1); });
    document.querySelectorAll("[data-user-email]").forEach(function(el){ el.textContent=session.email; });
    var firstName=session.name?session.name.trim().split(/\s+/)[0]:"";
    document.querySelectorAll("[data-user-firstname]").forEach(function(el){ el.textContent=firstName; });
    var initial=session.name?session.name.trim().charAt(0).toUpperCase():"?";
    document.querySelectorAll("[data-user-avatar]").forEach(function(el){ el.textContent=initial; });
  }

  /* Sidebar mobile toggle + X close */
  var sidebar=document.querySelector(".dash-sidebar");
  var toggle=document.querySelector(".sidebar-toggle");
  var sidebarClose=document.getElementById("sidebarClose");
  if(toggle&&sidebar){
    toggle.addEventListener("click",function(){ sidebar.classList.toggle("open"); });
  }
  if(sidebarClose&&sidebar){
    sidebarClose.addEventListener("click",function(){ sidebar.classList.remove("open"); });
  }

  /* Tab/view switching */
  var navLinks=document.querySelectorAll(".dash-nav a[data-view]");
  var views=document.querySelectorAll(".dash-view");
  navLinks.forEach(function(link){
    link.addEventListener("click",function(e){
      e.preventDefault();
      var target=link.getAttribute("data-view");
      navLinks.forEach(function(l){ l.classList.remove("active"); });
      link.classList.add("active");
      views.forEach(function(v){ v.classList.toggle("active",v.id==="view-"+target); });
      document.querySelectorAll(".view-title").forEach(function(t){ t.textContent=link.textContent.trim(); });
      if(sidebar) sidebar.classList.remove("open");
      animateBars();
    });
  });

  /* Dropdown panels (notifications / profile) */
  document.querySelectorAll("[data-dropdown]").forEach(function(trigger){
    var panel=document.getElementById(trigger.getAttribute("data-dropdown"));
    if(!panel) return;
    trigger.addEventListener("click",function(e){
      e.stopPropagation();
      var willOpen=!panel.classList.contains("open");
      document.querySelectorAll(".dropdown-panel").forEach(function(p){ p.classList.remove("open"); });
      if(willOpen) panel.classList.add("open");
    });
  });
  document.addEventListener("click",function(){
    document.querySelectorAll(".dropdown-panel").forEach(function(p){ p.classList.remove("open"); });
  });

  /* Settings toggle switches */
  document.querySelectorAll(".switch").forEach(function(sw){
    sw.addEventListener("click",function(){ sw.classList.toggle("on"); });
  });

  /* Settings sub-tabs */
  document.querySelectorAll(".settings-tabs button").forEach(function(btn){
    btn.addEventListener("click",function(){
      var group=btn.closest(".settings-grid");
      group.querySelectorAll(".settings-tabs button").forEach(function(b){ b.classList.remove("active"); });
      btn.classList.add("active");
      group.querySelectorAll(".settings-pane").forEach(function(p){ p.classList.toggle("active",p.id===btn.getAttribute("data-pane")); });
    });
  });

  /* Bar chart animate-in */
  function animateBars(){
    document.querySelectorAll(".bar-fill").forEach(function(bar){
      var target=bar.getAttribute("data-height")||"0%";
      bar.style.height="0%";
      requestAnimationFrame(function(){ setTimeout(function(){ bar.style.height=target; },60); });
    });
  }
  animateBars();

  /* Line chart renderer: pass comma-separated values via data-points */
  document.querySelectorAll("[data-linechart]").forEach(function(svg){
    var values=svg.getAttribute("data-linechart").split(",").map(Number);
    var w=300,h=160,max=Math.max.apply(null,values),min=Math.min.apply(null,values);
    var step=w/(values.length-1);
    var pts=values.map(function(v,i){
      var y=h-((v-min)/((max-min)||1))*(h-20)-10;
      return [i*step,y];
    });
    var line="M"+pts.map(function(p){ return p[0]+","+p[1]; }).join(" L");
    var fill=line+" L"+w+","+h+" L0,"+h+" Z";
    svg.setAttribute("viewBox","0 0 "+w+" "+h);
    svg.innerHTML=
      '<defs><linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#00C2FF"/><stop offset="1" stop-color="#00C2FF" stop-opacity="0"/></linearGradient></defs>'+
      '<path class="fill" d="'+fill+'"></path>'+
      '<path class="stroke" d="'+line+'"></path>'+
      pts.map(function(p){ return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="4"></circle>'; }).join("");
  });

  /* Ring/donut chart via conic-gradient: data-ring="percent,color" */
  document.querySelectorAll("[data-ring]").forEach(function(el){
    var parts=el.getAttribute("data-ring").split(",");
    var pct=parseFloat(parts[0]), color=parts[1]||"#0077B6";
    el.style.background="conic-gradient("+color+" "+(pct*3.6)+"deg, var(--c-border) 0deg)";
  });

  /* Messages mini inbox */
  document.querySelectorAll(".msg-item").forEach(function(item){
    item.addEventListener("click",function(){
      document.querySelectorAll(".msg-item").forEach(function(i){ i.classList.remove("active"); });
      item.classList.add("active");
      var name=item.querySelector("strong").textContent;
      var img=item.querySelector("img").src;
      var head=document.querySelector(".msg-thread-head");
      if(head){ head.querySelector("img").src=img; head.querySelector("strong").textContent=name; }
    });
  });
  var msgForm=document.querySelector(".msg-input-row");
  if(msgForm){
    msgForm.addEventListener("submit",function(e){
      e.preventDefault();
      var input=msgForm.querySelector("input");
      if(!input.value.trim()) return;
      var body=document.querySelector(".msg-body");
      var b=document.createElement("div");
      b.className="msg-bubble out";
      b.textContent=input.value;
      body.appendChild(b);
      body.scrollTop=body.scrollHeight;
      input.value="";
    });
  }

  /* Logout */
  document.querySelectorAll("[data-logout]").forEach(function(btn){
    btn.addEventListener("click",function(){ window.StacklyAuth.logout(); });
  });

  /* Generic approve/reject/issue action buttons -> toast + row fade */
  document.querySelectorAll("[data-row-action]").forEach(function(btn){
    btn.addEventListener("click",function(){
      var action=btn.getAttribute("data-row-action");
      var row=btn.closest("tr");
      var msgs={approve:["Approved","Request has been approved."],reject:["Rejected","Request has been rejected."],issue:["Certificate Issued","Certificate has been generated and sent."],remind:["Reminder Sent","A reminder notification was sent."]};
      var m=msgs[action]||["Done","Action completed."];
      window.StacklyToast(action==="reject"?"warn":"success",m[0],m[1]);
      if(row&&(action==="approve"||action==="reject")){
        row.style.transition="opacity .4s"; row.style.opacity=".35";
        var badge=row.querySelector(".badge");
        if(badge){ badge.className="badge "+(action==="approve"?"success":"danger"); badge.textContent=action==="approve"?"Approved":"Rejected"; row.style.opacity="1"; }
      }
    });
  });

})();
