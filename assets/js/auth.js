/* Stackly Swimming School — role-based auth simulation */
(function(){
  "use strict";

  var DB_KEY="stackly_users";
  var SESSION_KEY="stackly_session";
  var RESET_KEY="stackly_reset_token";

  function getUsers(){ return JSON.parse(localStorage.getItem(DB_KEY)||"[]"); }
  function saveUsers(list){ localStorage.setItem(DB_KEY,JSON.stringify(list)); }

  function seedDemoUsers(){
    var users=getUsers();
    if(users.length) return;
    saveUsers([
      {name:"Avery Cole",email:"admin@stackly.com",password:"Admin@123",role:"admin",age:"32",phone:"9876543210"},
      {name:"Jordan Lee",email:"trainer@stackly.com",password:"Trainer@123",role:"trainer",age:"28",phone:"8765432109"},
      {name:"Maya Brooks",email:"student@stackly.com",password:"Student@123",role:"student",age:"20",phone:"7654321098"}
    ]);
  }
  seedDemoUsers();

  function dashboardFor(role){
    return {admin:"admin-dashboard.html",trainer:"trainer-dashboard.html",student:"student-dashboard.html"}[role]||"index.html";
  }
  function setSession(user,remember){
    var data=JSON.stringify({name:user.name,email:user.email,role:user.role});
    if(remember) localStorage.setItem(SESSION_KEY,data);
    else sessionStorage.setItem(SESSION_KEY,data);
  }
  function getSession(){
    var raw=localStorage.getItem(SESSION_KEY)||sessionStorage.getItem(SESSION_KEY);
    return raw?JSON.parse(raw):null;
  }
  window.StacklyAuth={getSession:getSession,logout:function(){
    localStorage.removeItem(SESSION_KEY);sessionStorage.removeItem(SESSION_KEY);
    window.location.href="login.html";
  }};

  function setLoading(btn,on,label){
    if(!btn) return;
    if(on){ btn.dataset.label=btn.innerHTML; btn.innerHTML='<i class="fa-solid fa-circle-notch fa-spin"></i><span>'+label+'</span>'; btn.disabled=true; }
    else{ btn.innerHTML=btn.dataset.label; btn.disabled=false; }
  }

  /* ---- Field validators — return error string or null ---- */
  function validateName(v){
    var t=v.trim();
    if(!t) return "Full name is required.";
    if(t.length<2) return "Name must be at least 2 characters.";
    if(t.length>50) return "Name must not exceed 50 characters.";
    if(!/^[A-Za-z\s'\-]+$/.test(t)) return "Name can only contain letters, spaces, hyphens and apostrophes.";
    return null;
  }
  function validateEmail(v){
    var t=v.trim();
    if(!t) return "Email address is required.";
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return "Enter a valid email — e.g. name@example.com";
    return null;
  }
  function validatePhone(v){
    var t=v.replace(/\s/g,"");
    if(!t) return "Mobile number is required.";
    if(!/^[6-9]\d{9}$/.test(t)) return "Enter a valid 10-digit number starting with 6–9.";
    return null;
  }
  function validateAge(v){
    if(!v||!String(v).trim()) return "Age is required.";
    var n=parseInt(v,10);
    if(isNaN(n)||n<1||n>100) return "Enter a valid age between 1 and 100.";
    return null;
  }
  function validatePassword(v){
    if(!v) return "Password is required.";
    if(v.length<8) return "Password must be at least 8 characters.";
    if(v.length>20) return "Password must not exceed 20 characters.";
    if(!/[A-Z]/.test(v)) return "Include at least one uppercase letter (A–Z).";
    if(!/[a-z]/.test(v)) return "Include at least one lowercase letter (a–z).";
    if(!/\d/.test(v)) return "Include at least one number (0–9).";
    if(!/[^A-Za-z0-9]/.test(v)) return "Include at least one special character (!@#$…).";
    return null;
  }
  function validateConfirm(v,pw){
    if(!v) return "Please confirm your password.";
    if(v!==pw) return "Passwords do not match.";
    return null;
  }
  function isEmailValid(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  /* ---- UI helpers ---- */
  function showError(input,msg){
    var field=input.closest(".field");
    if(!field) return false;
    var msgEl=field.querySelector(".field-msg.error");
    if(msgEl) msgEl.textContent=msg;
    field.classList.add("has-error");
    return false;
  }
  function clearError(input){
    var field=input.closest(".field");
    if(field) field.classList.remove("has-error");
  }

  /*
    realtimeField — validates on every keystroke after the field has been touched (blurred once).
    Before first blur: only clears the error if the field becomes valid (no false-positive "required" errors on initial load).
    After first blur: shows errors as the user types.
  */
  function realtimeField(input,validateFn){
    var blurred=false;
    var field=input.closest(".field");
    function run(){
      var err=validateFn(input.value);
      if(err) showError(input,err);
      else clearError(input);
      return !err;
    }
    input.addEventListener("blur",function(){ blurred=true; run(); });
    input.addEventListener("input",function(){
      var hasErr=field&&field.classList.contains("has-error");
      if(blurred||hasErr) run();
      else if(!validateFn(input.value)) clearError(input);
    });
    return run;
  }

  /* ===================== LOGIN ===================== */
  var loginForm=document.getElementById("loginForm");
  if(loginForm){
    var roleTabs=loginForm.querySelectorAll(".role-tabs button");
    var roleInput=document.getElementById("loginRole");
    roleTabs.forEach(function(btn){
      btn.addEventListener("click",function(){
        roleTabs.forEach(function(b){ b.classList.remove("active"); });
        btn.classList.add("active");
        roleInput.value=btn.getAttribute("data-role");
      });
    });

    var loginEmail=document.getElementById("loginEmail");
    var loginPw=document.getElementById("loginPassword");

    realtimeField(loginEmail,validateEmail);
    realtimeField(loginPw,function(v){ return v?null:"Password is required."; });

    loginForm.addEventListener("submit",function(e){
      e.preventDefault();
      var email=loginEmail.value.trim();
      var password=loginPw.value;
      var role=roleInput.value;
      var remember=document.getElementById("rememberMe").checked;
      var btn=loginForm.querySelector("button[type=submit]");
      var ok=true;

      clearError(loginEmail); clearError(loginPw);

      var eErr=validateEmail(email);
      if(eErr){ showError(loginEmail,eErr); ok=false; }
      if(!password){ showError(loginPw,"Password is required."); ok=false; }
      if(!ok) return;

      setLoading(btn,true,"Signing in...");
      setTimeout(function(){
        var users=getUsers();
        var match=users.find(function(u){
          return u.email.toLowerCase()===email.toLowerCase()&&u.password===password;
        });
        setLoading(btn,false);
        if(!match){
          window.StacklyToast("error","Login failed","Incorrect email or password. Please try again.");
          showError(loginEmail,"Incorrect email or password.");
          showError(loginPw,"Incorrect email or password.");
          return;
        }
        if(match.role!==role){
          window.StacklyToast("warn","Wrong role selected","This account is a '"+match.role+"'. Please select the correct role tab.");
          return;
        }
        setSession(match,remember);
        window.StacklyToast("success","Welcome back, "+match.name.split(" ")[0]+"!","Redirecting to your dashboard...");
        setTimeout(function(){ window.location.href=dashboardFor(match.role); },900);
      },700);
    });
  }

  /* ===================== SIGNUP ===================== */
  var signupForm=document.getElementById("signupForm");
  if(signupForm){
    var sRoleTabs=signupForm.querySelectorAll(".role-tabs button");
    var sRoleInput=document.getElementById("signupRole");
    sRoleTabs.forEach(function(btn){
      btn.addEventListener("click",function(){
        sRoleTabs.forEach(function(b){ b.classList.remove("active"); });
        btn.classList.add("active");
        sRoleInput.value=btn.getAttribute("data-role");
      });
    });

    var sName    =document.getElementById("signupName");
    var sEmail   =document.getElementById("signupEmail");
    var sAge     =document.getElementById("signupAge");
    var sPhone   =document.getElementById("signupPhone");
    var sPw      =document.getElementById("signupPassword");
    var sConfirm =document.getElementById("signupConfirm");
    var termsBox =document.getElementById("agreeTerms");
    var termsErr =document.getElementById("termsErrMsg");

    /* Password strength bars */
    var strengthBars=signupForm.querySelectorAll(".pw-strength span");
    if(sPw){
      sPw.addEventListener("input",function(){
        var v=sPw.value,score=0;
        if(v.length>=8&&v.length<=20) score++;
        if(/[A-Z]/.test(v)&&/[a-z]/.test(v)) score++;
        if(/\d/.test(v)) score++;
        if(/[^A-Za-z0-9]/.test(v)) score++;
        var colors=["var(--c-border)","#EF4444","#F59E0B","#2DD4BF","#10B981"];
        strengthBars.forEach(function(bar,i){ bar.style.background=i<score?colors[score]:colors[0]; });
      });
    }

    realtimeField(sName,  validateName);
    realtimeField(sEmail, validateEmail);
    if(sAge)     realtimeField(sAge,    validateAge);
    if(sPhone)   realtimeField(sPhone,  validatePhone);
    realtimeField(sPw,    validatePassword);
    if(sConfirm) realtimeField(sConfirm,function(v){ return validateConfirm(v,sPw.value); });

    /* When password changes, re-check confirm field in real time */
    if(sPw&&sConfirm){
      sPw.addEventListener("input",function(){
        var cf=sConfirm.closest(".field");
        if(sConfirm.value||(cf&&cf.classList.contains("has-error"))){
          var err=validateConfirm(sConfirm.value,sPw.value);
          if(err) showError(sConfirm,err);
          else clearError(sConfirm);
        }
      });
    }

    /* Live terms error clear */
    if(termsBox&&termsErr){
      termsBox.addEventListener("change",function(){
        if(termsBox.checked) termsErr.style.display="none";
      });
    }

    signupForm.addEventListener("submit",function(e){
      e.preventDefault();
      var name    =sName.value.trim();
      var email   =sEmail.value.trim();
      var age     =sAge?sAge.value:"";
      var phone   =sPhone?sPhone.value.replace(/\s/g,""):"";
      var password=sPw.value;
      var confirm =sConfirm?sConfirm.value:"";
      var terms   =termsBox?termsBox.checked:false;
      var btn     =signupForm.querySelector("button[type=submit]");
      var ok=true;

      [sName,sEmail,sPw,sConfirm,sAge,sPhone].forEach(function(el){ if(el) clearError(el); });
      if(termsErr) termsErr.style.display="none";

      var nErr=validateName(name);
      if(nErr){ showError(sName,nErr); ok=false; }

      var eErr=validateEmail(email);
      if(eErr){ showError(sEmail,eErr); ok=false; }

      if(sAge){ var aErr=validateAge(age); if(aErr){ showError(sAge,aErr); ok=false; } }
      if(sPhone){ var phErr=validatePhone(phone); if(phErr){ showError(sPhone,phErr); ok=false; } }

      var pErr=validatePassword(password);
      if(pErr){ showError(sPw,pErr); ok=false; }

      if(sConfirm){ var cErr=validateConfirm(confirm,password); if(cErr){ showError(sConfirm,cErr); ok=false; } }

      if(!terms){
        if(termsErr) termsErr.style.display="block";
        window.StacklyToast("warn","Accept Terms","Please agree to the Terms & Privacy Policy to continue.");
        ok=false;
      }
      if(!ok) return;

      var users=getUsers();
      if(users.some(function(u){ return u.email.toLowerCase()===email.toLowerCase(); })){
        showError(sEmail,"An account with this email already exists.");
        window.StacklyToast("error","Account exists","Try logging in instead.");
        return;
      }

      setLoading(btn,true,"Creating account...");
      setTimeout(function(){
        users.push({name:name,email:email,password:password,role:sRoleInput.value,age:age,phone:phone});
        saveUsers(users);
        setLoading(btn,false);
        window.StacklyToast("success","Account created!","Welcome to Stackly, "+name.split(" ")[0]+". Redirecting to login...");
        setTimeout(function(){ window.location.href="login.html"; },1100);
      },800);
    });
  }

  /* ===================== FORGOT PASSWORD ===================== */
  var forgotForm=document.getElementById("forgotForm");
  if(forgotForm){
    var fEmail=document.getElementById("forgotEmail");
    realtimeField(fEmail,validateEmail);

    forgotForm.addEventListener("submit",function(e){
      e.preventDefault();
      var email=fEmail.value.trim();
      var btn=forgotForm.querySelector("button[type=submit]");
      var success=document.getElementById("forgotSuccess");
      clearError(fEmail);
      var err=validateEmail(email);
      if(err){ showError(fEmail,err); return; }

      setLoading(btn,true,"Sending link...");
      setTimeout(function(){
        sessionStorage.setItem(RESET_KEY,email);
        setLoading(btn,false);
        if(success){ success.style.display="flex"; }
        window.StacklyToast("success","Reset link sent","Check your inbox for password reset instructions.");
      },800);
    });
  }

  /* ===================== RESET PASSWORD — Two-step flow ===================== */
  var resetStep1=document.getElementById("resetStep1");
  var resetStep2=document.getElementById("resetStep2");

  /* ── Step 1 : Email verification ── */
  var resetEmailForm=document.getElementById("resetEmailForm");
  if(resetEmailForm){
    var rEmail=document.getElementById("resetEmail");
    realtimeField(rEmail,validateEmail);

    resetEmailForm.addEventListener("submit",function(e){
      e.preventDefault();
      clearError(rEmail);
      var email=rEmail.value.trim();
      var err=validateEmail(email);
      if(err){ showError(rEmail,err); return; }

      var btn=resetEmailForm.querySelector("button[type=submit]");
      setLoading(btn,true,"Verifying...");
      setTimeout(function(){
        var users=getUsers();
        var found=users.find(function(u){ return u.email.toLowerCase()===email.toLowerCase(); });
        setLoading(btn,false);
        if(!found){
          showError(rEmail,"No account found with this email. Please sign up first.");
          window.StacklyToast("error","Email not found","No account is registered with that address.");
          return;
        }
        /* Verified — store email and reveal Step 2 */
        sessionStorage.setItem(RESET_KEY,email);
        var display=document.getElementById("resetEmailDisplay");
        if(display) display.textContent=email;
        if(resetStep1){ resetStep1.style.display="none"; }
        if(resetStep2){ resetStep2.style.display="block"; resetStep2.classList.add("step-enter"); }
        window.StacklyToast("success","Email verified","Now set your new password.");
      },650);
    });

    /* "Use a different email" link — go back to Step 1 */
    var resetChangeEmail=document.getElementById("resetChangeEmail");
    if(resetChangeEmail){
      resetChangeEmail.addEventListener("click",function(e){
        e.preventDefault();
        if(resetStep2){ resetStep2.style.display="none"; resetStep2.classList.remove("step-enter"); }
        if(resetStep1){ resetStep1.style.display="block"; }
        if(rEmail){ rEmail.value=""; clearError(rEmail); }
        sessionStorage.removeItem(RESET_KEY);
      });
    }
  }

  /* ── Step 2 : Set new password ── */
  var resetForm=document.getElementById("resetForm");
  if(resetForm){
    var rPw     =document.getElementById("resetPassword");
    var rConfirm=document.getElementById("resetConfirm");

    /* Password strength bars */
    var rStrengthBars=resetForm.querySelectorAll(".pw-strength span");
    if(rPw){
      rPw.addEventListener("input",function(){
        var v=rPw.value,score=0;
        if(v.length>=8&&v.length<=20) score++;
        if(/[A-Z]/.test(v)&&/[a-z]/.test(v)) score++;
        if(/\d/.test(v)) score++;
        if(/[^A-Za-z0-9]/.test(v)) score++;
        var colors=["var(--c-border)","#EF4444","#F59E0B","#2DD4BF","#10B981"];
        rStrengthBars.forEach(function(bar,i){ bar.style.background=i<score?colors[score]:colors[0]; });
      });
    }

    realtimeField(rPw,     validatePassword);
    realtimeField(rConfirm,function(v){ return validateConfirm(v,rPw.value); });

    /* Re-validate confirm when password changes */
    if(rPw&&rConfirm){
      rPw.addEventListener("input",function(){
        var cf=rConfirm.closest(".field");
        if(rConfirm.value||(cf&&cf.classList.contains("has-error"))){
          var err=validateConfirm(rConfirm.value,rPw.value);
          if(err) showError(rConfirm,err);
          else clearError(rConfirm);
        }
      });
    }

    resetForm.addEventListener("submit",function(e){
      e.preventDefault();
      var pw=rPw.value,confirm=rConfirm.value;
      var btn=resetForm.querySelector("button[type=submit]");
      var ok=true;
      clearError(rPw); clearError(rConfirm);
      var pErr=validatePassword(pw);
      if(pErr){ showError(rPw,pErr); ok=false; }
      var cErr=validateConfirm(confirm,pw);
      if(cErr){ showError(rConfirm,cErr); ok=false; }
      if(!ok) return;

      setLoading(btn,true,"Updating...");
      setTimeout(function(){
        var email=sessionStorage.getItem(RESET_KEY);
        var users=getUsers();
        var idx=users.findIndex(function(u){ return u.email.toLowerCase()===email.toLowerCase(); });
        if(idx>-1){ users[idx].password=pw; saveUsers(users); }
        sessionStorage.removeItem(RESET_KEY);
        setLoading(btn,false);
        window.StacklyToast("success","Password updated!","You can now sign in with your new password.");
        setTimeout(function(){ window.location.href="login.html"; },1100);
      },800);
    });
  }

  /* Guard dashboard pages */
  if(document.body.hasAttribute("data-requires-auth")){
    var session=getSession();
    var requiredRole=document.body.getAttribute("data-requires-auth");
    if(!session||(requiredRole&&session.role!==requiredRole)){
      window.location.href="login.html";
    }
  }
})();
