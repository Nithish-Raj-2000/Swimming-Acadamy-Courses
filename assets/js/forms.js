(function () {
  "use strict";

  /* ─── Validators — return error string or null ─── */
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

  function validateName(v) {
    var t = v.trim();
    if (!t) return "Full name is required.";
    if (t.length < 2) return "Name must be at least 2 characters.";
    if (t.length > 50) return "Name must not exceed 50 characters.";
    if (!/^[A-Za-z\s'\-]+$/.test(t)) return "Name can only contain letters, spaces, hyphens and apostrophes.";
    return null;
  }
  function validateEmail(v) {
    var t = v.trim();
    if (!t) return "Email address is required.";
    if (!isEmail(t)) return "Enter a valid email — e.g. name@example.com";
    return null;
  }
  function validatePhone(v) {
    var t = v.replace(/\s/g, "");
    if (!t) return "Phone number is required.";
    if (!/^[6-9]\d{9}$/.test(t)) return "Enter a valid 10-digit number starting with 6–9.";
    return null;
  }
  function validateAge(v) {
    if (!v || !String(v).trim()) return "Age is required.";
    var n = parseInt(v, 10);
    if (isNaN(n) || n < 1 || n > 100) return "Enter a valid age between 1 and 100.";
    return null;
  }
  function validateSelect(v, msg) {
    return v ? null : (msg || "Please make a selection.");
  }
  function validateMessage(v) {
    var t = v.trim();
    if (!t) return "Message is required.";
    if (t.length < 10) return "Message must be at least 10 characters.";
    return null;
  }
  function validateDate(v) {
    if (!v) return "Please select a training start date.";
    var sel = new Date(v);
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    if (sel < today) return "Start date cannot be in the past.";
    return null;
  }

  /* ─── UI helpers ─── */
  function showErr(el, msg) {
    var field = el.closest(".field");
    if (!field) return;
    var errEl = field.querySelector(".field-msg.error");
    if (errEl) errEl.textContent = msg;
    field.classList.add("has-error");
  }
  function clearErr(el) {
    var field = el.closest(".field");
    if (field) field.classList.remove("has-error");
  }

  /*
    realtimeField — validates live after the field has been touched (blurred once).
    Before first blur: only proactively clears error if the field becomes valid.
    After first blur: both shows and clears errors as the user types.
  */
  function realtimeField(input, validateFn) {
    var blurred = false;
    var field = input.closest(".field");
    function run() {
      var err = validateFn(input.value);
      if (err) showErr(input, err);
      else clearErr(input);
      return !err;
    }
    input.addEventListener("blur", function () { blurred = true; run(); });
    input.addEventListener("input", function () {
      var hasErr = field && field.classList.contains("has-error");
      if (blurred || hasErr) run();
      else if (!validateFn(input.value)) clearErr(input);
    });
    return run;
  }

  /* realtimeSelect — validates immediately on every change */
  function realtimeSelect(select, validateFn) {
    function run() {
      var err = validateFn(select.value);
      if (err) showErr(select, err);
      else clearErr(select);
      return !err;
    }
    select.addEventListener("change", run);
    return run;
  }

  function setBtn(btn, loading, label) {
    if (loading) {
      btn._orig = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i><span>' + label + "</span>";
      btn.disabled = true;
    } else {
      btn.innerHTML = btn._orig || btn.innerHTML;
      btn.disabled = false;
    }
  }

  /* ─── Newsletter (all pages) ─── */
  document.querySelectorAll(".news-form").forEach(function (form) {
    var input = form.querySelector('input[type="email"]');
    if (!input) return;

    /* Create inline error element below the form */
    var errEl = document.createElement("p");
    errEl.className = "news-err";
    errEl.style.cssText = "color:#EF4444;font-size:12px;margin:6px 0 0;display:none;line-height:1.4;";
    form.parentNode.insertBefore(errEl, form.nextSibling);

    /* Real-time: show error as user types when value is non-empty and invalid */
    input.addEventListener("input", function () {
      var val = input.value.trim();
      if (val) {
        if (!isEmail(val)) {
          errEl.textContent = "Enter a valid email — e.g. name@example.com";
          errEl.style.display = "block";
        } else {
          errEl.style.display = "none";
        }
      } else {
        errEl.style.display = "none";
      }
    });

    /* Blur: show required error if empty */
    input.addEventListener("blur", function () {
      if (!input.value.trim()) {
        errEl.textContent = "Email address is required.";
        errEl.style.display = "block";
      }
    });

    input.addEventListener("focus", function () {
      if (input.value.trim()) errEl.style.display = "none";
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var val = input.value.trim();
      if (!val) {
        errEl.textContent = "Email address is required.";
        errEl.style.display = "block";
        input.focus();
        return;
      }
      if (!isEmail(val)) {
        errEl.textContent = "Enter a valid email — e.g. name@example.com";
        errEl.style.display = "block";
        input.focus();
        return;
      }
      errEl.style.display = "none";
      window.StacklyToast("success", "Subscribed!", "You're on the list for swim tips and updates.");
      form.reset();
    });
  });

  /* ─── Contact Form ─── */
  var cf = document.getElementById("contactForm");
  if (cf) {
    var cName    = document.getElementById("cName");
    var cEmail   = document.getElementById("cEmail");
    var cSubject = document.getElementById("cSubject");
    var cMsg     = document.getElementById("cMsg");

    if (cName)    realtimeField(cName,    validateName);
    if (cEmail)   realtimeField(cEmail,   validateEmail);
    if (cSubject) realtimeSelect(cSubject, function (v) { return validateSelect(v, "Please select a subject."); });
    if (cMsg)     realtimeField(cMsg,     validateMessage);

    cf.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var ok = true;

      if (cName)    clearErr(cName);
      if (cEmail)   clearErr(cEmail);
      if (cSubject) clearErr(cSubject);
      if (cMsg)     clearErr(cMsg);

      var nErr = cName    ? validateName(cName.value)                          : null; if (nErr) { showErr(cName,    nErr); ok = false; }
      var eErr = cEmail   ? validateEmail(cEmail.value)                        : null; if (eErr) { showErr(cEmail,   eErr); ok = false; }
      var sErr = cSubject ? validateSelect(cSubject.value, "Please select a subject.") : null; if (sErr) { showErr(cSubject, sErr); ok = false; }
      var mErr = cMsg     ? validateMessage(cMsg.value)                        : null; if (mErr) { showErr(cMsg,     mErr); ok = false; }

      if (!ok) {
        var first = cf.querySelector(".has-error");
        if (first) {
          var inp = first.querySelector("input,select,textarea");
          if (inp) { inp.focus(); inp.scrollIntoView({ behavior: "smooth", block: "center" }); }
        }
        return;
      }

      var btn = cf.querySelector("button[type=submit]");
      setBtn(btn, true, "Sending…");
      setTimeout(function () {
        setBtn(btn, false);
        window.StacklyToast("success", "Message Sent!", "Thanks for reaching out — we'll reply within a few hours.");
        cf.reset();
        cf.querySelectorAll(".has-error").forEach(function (f) { f.classList.remove("has-error"); });
      }, 800);
    });
  }

  /* ─── Admission Form ─── */
  var af = document.getElementById("admissionForm");
  if (af) {
    var aName      = document.getElementById("aName");
    var aAge       = document.getElementById("aAge");
    var aEmail     = document.getElementById("aEmail");
    var aPhone     = document.getElementById("aPhone");
    var aProgram   = document.getElementById("aProgram");
    var aTiming    = document.getElementById("aTiming");
    var aStartDate = document.getElementById("aStartDate");

    /* Set minimum date to today */
    if (aStartDate) {
      aStartDate.min = new Date().toISOString().split("T")[0];
    }

    if (aName)    realtimeField(aName,    validateName);
    if (aAge)     realtimeField(aAge,     validateAge);
    if (aEmail)   realtimeField(aEmail,   validateEmail);
    if (aPhone)   realtimeField(aPhone,   validatePhone);
    if (aProgram) realtimeSelect(aProgram, function (v) { return validateSelect(v, "Please select a program."); });
    if (aTiming)  realtimeSelect(aTiming,  function (v) { return validateSelect(v, "Please select a preferred timing."); });

    if (aStartDate) {
      aStartDate.addEventListener("change", function () {
        var err = validateDate(aStartDate.value);
        if (err) showErr(aStartDate, err);
        else clearErr(aStartDate);
      });
      aStartDate.addEventListener("blur", function () {
        var err = validateDate(aStartDate.value);
        if (err) showErr(aStartDate, err);
        else clearErr(aStartDate);
      });
    }

    af.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var ok = true;

      [aName, aAge, aEmail, aPhone, aProgram, aTiming, aStartDate].forEach(function (el) {
        if (el) clearErr(el);
      });

      var nErr  = aName      ? validateName(aName.value)                              : null; if (nErr)  { showErr(aName,      nErr);  ok = false; }
      var ageE  = aAge       ? validateAge(aAge.value)                                : null; if (ageE)  { showErr(aAge,       ageE);  ok = false; }
      var eErr  = aEmail     ? validateEmail(aEmail.value)                            : null; if (eErr)  { showErr(aEmail,     eErr);  ok = false; }
      var phErr = aPhone     ? validatePhone(aPhone.value)                            : null; if (phErr) { showErr(aPhone,     phErr); ok = false; }
      var prErr = aProgram   ? validateSelect(aProgram.value,  "Please select a program.")         : null; if (prErr) { showErr(aProgram,   prErr); ok = false; }
      var tErr  = aTiming    ? validateSelect(aTiming.value,   "Please select a preferred timing."): null; if (tErr)  { showErr(aTiming,    tErr);  ok = false; }
      var dErr  = aStartDate ? validateDate(aStartDate.value)                         : null; if (dErr)  { showErr(aStartDate, dErr);  ok = false; }

      if (!ok) {
        var first = af.querySelector(".has-error");
        if (first) {
          var inp = first.querySelector("input,select");
          if (inp) { inp.focus(); first.scrollIntoView({ behavior: "smooth", block: "center" }); }
        }
        return;
      }

      var btn = af.querySelector("button[type=submit]");
      setBtn(btn, true, "Submitting…");
      setTimeout(function () {
        setBtn(btn, false);
        window.StacklyToast("success", "Application Submitted!", "Our admissions team will reach out within 24 hours.");
        af.reset();
        af.querySelectorAll(".has-error").forEach(function (f) { f.classList.remove("has-error"); });
        setTimeout(function () { window.location.href = "signup.html"; }, 1600);
      }, 900);
    });
  }

})();
