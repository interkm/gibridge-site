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

  /* ---------- 최신 공고 자동 렌더링 (announcements.json) ---------- */
  var annList = document.getElementById("annList");
  if (annList) {
    var fallbackItems = [
      { title: "[기업마당] 2026년 강한 소상공인 성장지원 — 사업화자금 최대 1억원", dept: "기업마당", period: "2026-08-07", url: "https://www.bizinfo.go.kr/" },
      { title: "[중기부] 소상공인 정책자금(융자) — 일반·성장기반 구분, 예산 소진 시까지", dept: "중기부", period: "2026-08-07", url: "https://www.bizinfo.go.kr/" },
      { title: "[중기부] 기업승계 M&A 컨설팅 지원 — 기초 100만원·종합 1,000만원", dept: "중기부", period: "2026-08-07", url: "https://www.bizinfo.go.kr/" },
      { title: "[기업마당] 소상공인 지원사업 통합공고 — 예비창업·소상공인·소공인 대상", dept: "기업마당", period: "2026-08-07", url: "https://www.bizinfo.go.kr/" },
      { title: "[중기부] 경영안정 바우처 — 2025년 매출 0초과~1.04억 미만", dept: "중기부", period: "2026-08-07", url: "https://www.bizinfo.go.kr/" }
    ];

    function renderAnn(items) {
      annList.innerHTML = "";
      (items || []).forEach(function (it) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = it.url || "https://www.bizinfo.go.kr/";
        a.target = "_blank";
        a.rel = "noopener";
        var label = it.title || "";
        if (it.dept) label = "[" + it.dept + "] " + label;
        a.textContent = label;
        li.appendChild(a);
        if (it.period) {
          var span = document.createElement("span");
          span.className = "ann-date";
          span.textContent = it.period;
          li.appendChild(span);
        }
        annList.appendChild(li);
      });
      if (!items || !items.length) {
        annList.innerHTML = "<li class='ann-empty'>현재 공고를 불러오는 중입니다. 잠시 후 다시 확인해 주세요.</li>";
      }
    }

    // 캐시 방지: fetch 시각 쿼리 추가
    var ts = new Date().getTime();
    fetch("announcements.json?t=" + ts, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("announcements fetch failed: " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (data && data.items && data.items.length) {
          renderAnn(data.items);
          var note = document.getElementById("annNote");
          if (note && data.updated) {
            note.textContent = "※ 매일 공고를 수집해 최신화합니다. (최종 수집: " + data.updated + ") 자세한 조건은 공식 링크에서 확인하세요.";
          }
        } else {
          renderAnn(fallbackItems);
        }
      })
      .catch(function () {
        renderAnn(fallbackItems);
      });
  }
})();
