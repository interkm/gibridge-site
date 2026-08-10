/* ===== 기업브릿지 v2 — 인터랙션 (KVIC 스타일) ===== */
(function () {
  "use strict";

  /* ---------- 모바일 메뉴 ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var open = mainNav.classList.toggle("open");
      navToggle.textContent = open ? "닫기" : "메뉴";
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mainNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mainNav.classList.remove("open");
        navToggle.textContent = "메뉴";
      });
    });
  }

  /* ---------- 히어로 슬라이더 ---------- */
  var slider = document.getElementById("heroSlider");
  var dotsWrap = document.getElementById("slideDots");
  if (slider && dotsWrap) {
    var slides = slider.querySelectorAll(".slide");
    var current = 0;
    var timer = null;

    slides.forEach(function (_, i) {
      var d = document.createElement("button");
      d.setAttribute("aria-label", (i + 1) + "번째 슬라이드로 이동");
      if (i === 0) d.classList.add("active");
      d.addEventListener("click", function () { go(i); restart(); });
      dotsWrap.appendChild(d);
    });
    var dots = dotsWrap.querySelectorAll("button");

    function go(i) {
      slides[current].classList.remove("active");
      dots[current].classList.remove("active");
      current = (i + slides.length) % slides.length;
      slides[current].classList.add("active");
      dots[current].classList.add("active");
    }
    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () { go(current + 1); }, 6000);
    }

    var prev = document.getElementById("slidePrev");
    var next = document.getElementById("slideNext");
    if (prev) prev.addEventListener("click", function () { go(current - 1); restart(); });
    if (next) next.addEventListener("click", function () { go(current + 1); restart(); });

    restart();
  }

  /* ---------- 탭 ---------- */
  var tabs = document.querySelectorAll(".tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      document.querySelectorAll(".tab-panel").forEach(function (p) { p.classList.remove("active"); });
      var panel = document.getElementById(tab.getAttribute("data-tab"));
      if (panel) panel.classList.add("active");
    });
  });

  /* ---------- 숫자 카운터 + 스크롤 등장 ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  // 숫자 카운터 (화면에 들어오면 애니메이션)
  var counters = document.querySelectorAll("[data-count]");
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimal = parseInt(el.getAttribute("data-decimal") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      var text = decimal > 0 ? val.toFixed(decimal) : Math.round(val).toLocaleString("ko-KR");
      el.textContent = text + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animateCounter(en.target);
          cio.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { cio.observe(c); });
    // 안전장치: 3초 후에도 카운터가 0이면 강제로 최종값 표시 (observer 미발동 환경 대비)
    setTimeout(function () {
      counters.forEach(function (c) {
        if (c.textContent === "0" || c.textContent === "0.0") {
          var suffix = c.getAttribute("data-suffix") || "";
          var decimal = parseInt(c.getAttribute("data-decimal") || "0", 10);
          var val = parseFloat(c.getAttribute("data-count"));
          c.textContent = (decimal > 0 ? val.toFixed(decimal) : Math.round(val).toLocaleString("ko-KR")) + suffix;
        }
      });
    }, 3000);
  } else {
    counters.forEach(function (c) {
      var suffix = c.getAttribute("data-suffix") || "";
      var decimal = parseInt(c.getAttribute("data-decimal") || "0", 10);
      var val = parseFloat(c.getAttribute("data-count"));
      c.textContent = (decimal > 0 ? val.toFixed(decimal) : Math.round(val).toLocaleString("ko-KR")) + suffix;
    });
  }

  /* ---------- 상담신청 폼 ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  if (form && status) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (document.getElementById("fName").value || "").trim();
      var phone = (document.getElementById("fPhone").value || "").trim();
      if (!name || !phone) {
        status.textContent = "이름과 연락처를 입력해 주세요.";
        status.className = "form-status err";
        return;
      }
      if (!/^01[0-9]{8,9}$/.test(phone.replace(/-/g, ""))) {
        status.textContent = "연락처 형식을 확인해 주세요. (예: 010-0000-0000)";
        status.className = "form-status err";
        return;
      }

      var company = (document.getElementById("fCompany").value || "").trim();
      var type = document.getElementById("fType").value;
      var msg = (document.getElementById("fMsg").value || "").trim();

      var typeLabel = {
        sell: "기업 매각",
        buy: "기업 인수·투자",
        succession: "기업승계 M&A",
        support: "정부지원사업",
        etc: "기타"
      }[type] || type;

      var body =
        "상담신청 (기업브릿지)\n\n" +
        "이름: " + name + "\n" +
        "연락처: " + phone + "\n" +
        "회사: " + (company || "-") + "\n" +
        "관심 분야: " + typeLabel + "\n" +
        "문의 내용:\n" + (msg || "-");

      var mailto =
        "mailto:interkm@naver.com?subject=" +
        encodeURIComponent("[기업브릿지 상담신청] " + name) +
        "&body=" + encodeURIComponent(body);

      try {
        var history = JSON.parse(localStorage.getItem("bridge_contacts") || "[]");
        history.push({
          name: name, phone: phone, company: company, type: typeLabel,
          message: msg, at: new Date().toISOString()
        });
        localStorage.setItem("bridge_contacts", JSON.stringify(history));
      } catch (err) { /* 저장 실패해도 진행 */ }

      window.location.href = mailto;

      status.textContent = "메일 앱이 열립니다. 전송 버튼을 눌러 완료해 주세요. (카카오톡 문의도 가능)";
      status.className = "form-status ok";
    });
  }
})();
