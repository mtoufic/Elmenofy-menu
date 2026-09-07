(function () {
  "use strict";

  var UI = {
    ar: {
      draftBanner:
        "قائمة تجريبية منقولة من المنيو المطبوع — في انتظار تأكيد المطعم للأسعار والتوفر. Draft menu, pending restaurant confirmation.",
      notesTitle: "ملاحظات",
      notesDisclaimer:
        "هذه ملاحظات منقولة كما وردت في المصدر المطبوع، وليست سياسة مؤكدة حاليًا من المطعم.",
      footerSlogan: "طعم له أصل",
      footerStatus: "نسخة معاينة داخلية — غير منشورة",
      egp: "جنيه",
      printedNotesHeading: "ملاحظات مطبوعة على المنيو",
      reviewNotesHeading: "نقاط تحتاج تأكيد المطعم",
      unconfirmedPortion: "الأحجام غير مؤكدة",
      needsConfirm: "يحتاج تأكيد",
    },
    en: {
      draftBanner:
        "Draft menu transcribed from the printed copy — pending restaurant confirmation of prices and availability.",
      notesTitle: "Notes",
      notesDisclaimer:
        "These notes are carried over from the printed source as written, not a policy currently confirmed by the restaurant.",
      footerSlogan: "A taste with roots",
      footerStatus: "Internal preview copy — not published",
      egp: "EGP",
      printedNotesHeading: "Printed on the menu",
      reviewNotesHeading: "Needs restaurant confirmation",
      unconfirmedPortion: "sizes unconfirmed",
      needsConfirm: "needs confirmation",
    },
  };

  // Grill items whose printed prices are NOT the standard 1/2·1/3·1/4 kg columns.
  var GRILL_NON_WEIGHT = ["Grilled chicken", "Grilled lamb knuckle", "Menofy special meal"];

  // Printed notes are transcribed in Arabic only in the source JSON; review notes
  // (Claude's transcription caveats) are in English only. English/Arabic pairs
  // below are translations added for bilingual display — the source language is
  // authoritative; these translations have not been separately verified.
  var PRINTED_NOTES_EN = [
    "Prices include VAT.",
    "12% is added for dine-in.",
    "Any salad, takeaway: 27 EGP.",
  ];
  var REVIEW_NOTES_AR = [
    "يجب أن يؤكد المطعم الأسعار الحالية ومدى التوفر.",
    "فرخة مشوية: السعران المطبوعان ١٨٤ و٣٦٨ جنيهًا؛ مسميات الحجم غير مؤكدة، ولذلك لم تُدرَج ضمن أعمدة الوزن القياسية.",
    "طاجن فريك باللحمة: السعر ٣٥٣ جنيهًا قراءة مبدئية وتحتاج تأكيدًا.",
    "بيريل / فيروز: النص العربي المطبوع يختلف عن النص الإنجليزي المطبوع، ويحتاج تأكيدًا من المطعم.",
    "ريش بتلو: لا يوجد سعر ثالث مطبوع؛ لم يُفترض.",
  ];

  var state = { lang: "ar" };

  function t(key) {
    return UI[state.lang][key];
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function priceCell(v) {
    if (v === null || v === undefined) return el("span", "price-cell dash", "—");
    return el("span", "price-cell", String(v));
  }

  function buildItemNameNode(item) {
    var wrap = el("div", "item-name");
    wrap.appendChild(el("span", "n-ar", item.ar));
    wrap.appendChild(el("span", "n-en", item.en));
    return wrap;
  }

  function buildGrid3Row(item) {
    var row = el("div", "item-row grid3");
    row.appendChild(buildItemNameNode(item));
    var p = item.printedPrices;
    row.appendChild(priceCell(p[0]));
    row.appendChild(priceCell(p[1]));
    row.appendChild(priceCell(p.length > 2 ? p[2] : null));
    return row;
  }

  function buildPlainRow(item, opts) {
    opts = opts || {};
    var row = el("div", "item-row plain");
    row.appendChild(buildItemNameNode(item));
    var priceWrap = el("span", "price-simple");
    var priceText = item.printedPrices.join(" / ");
    priceWrap.textContent = priceText;
    var egp = el("span", "egp", t("egp"));
    priceWrap.appendChild(egp);
    if (opts.flag) {
      var flag = el("span", "flag", opts.flag);
      priceWrap.appendChild(flag);
    }
    row.appendChild(priceWrap);
    return row;
  }

  function buildSection(group) {
    var section = el("section", "cat-section");
    section.id = "cat-" + group.id;

    var heading = el("div", "cat-heading");
    heading.appendChild(el("span", "cat-ar", group.ar));
    heading.appendChild(el("span", "cat-en", group.en));
    section.appendChild(heading);
    section.appendChild(el("div", "cat-rule"));

    var isGrills = group.id === "grills";
    var hasWeightHead = false;

    group.items.forEach(function (item) {
      var priceCount = item.printedPrices.length;
      var isNonWeightGrill = isGrills && GRILL_NON_WEIGHT.indexOf(item.en) !== -1;

      if (isGrills && priceCount >= 2 && !isNonWeightGrill) {
        if (!hasWeightHead) {
          var head = el("div", "weight-head");
          head.appendChild(el("span", null, ""));
          MENU_DATA.grillColumnOrder.forEach(function (col) {
            var label = state.lang === "ar" ? col.ar : col.kg + " kg";
            head.appendChild(el("span", null, label));
          });
          section.appendChild(head);
          hasWeightHead = true;
        }
        section.appendChild(buildGrid3Row(item));
      } else {
        var flag = null;
        if (item.en === "Grilled chicken") flag = t("unconfirmedPortion");
        else if (item.reviewNote) flag = t("needsConfirm");
        var row = buildPlainRow(item, { flag: flag });
        if (item.reviewNote) row.title = item.reviewNote;
        section.appendChild(row);
      }
    });

    return section;
  }

  function renderMenu() {
    var container = document.getElementById("menuSections");
    container.innerHTML = "";
    MENU_DATA.groups.forEach(function (group) {
      container.appendChild(buildSection(group));
    });
  }

  function renderCatNav() {
    var nav = document.getElementById("catNav");
    nav.innerHTML = "";
    MENU_DATA.groups.forEach(function (group, idx) {
      var btn = el("button", "cat-tab" + (idx === 0 ? " active" : ""));
      btn.type = "button";
      btn.dataset.target = "cat-" + group.id;
      var arSpan = el("span", null, group.ar);
      var enSpan = el("span", null, group.en);
      arSpan.style.display = "";
      btn.appendChild(arSpan);
      btn.appendChild(document.createTextNode(" "));
      btn.appendChild(enSpan);
      // Show only the active-language label via CSS-driven [dir] rules is awkward
      // per-tab, so toggle directly here based on current language.
      arSpan.className = "tab-ar";
      enSpan.className = "tab-en";
      btn.addEventListener("click", function () {
        var target = document.getElementById(btn.dataset.target);
        if (target) {
          var headerH = document.querySelector(".menu-header").offsetHeight;
          var top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 8;
          window.scrollTo({ top: top, behavior: "smooth" });
        }
      });
      nav.appendChild(btn);
    });
    applyTabLanguage();
  }

  function applyTabLanguage() {
    var showAr = state.lang === "ar";
    document.querySelectorAll(".tab-ar").forEach(function (s) {
      s.style.display = showAr ? "" : "none";
    });
    document.querySelectorAll(".tab-en").forEach(function (s) {
      s.style.display = showAr ? "none" : "";
    });
  }

  function renderNotes() {
    var list = document.getElementById("printedNotesList");
    list.innerHTML = "";

    var printedHeading = el("li", "notes-heading", "<strong>" + t("printedNotesHeading") + "</strong>");
    printedHeading.style.color = "var(--ink)";
    list.appendChild(printedHeading);

    var printedSrc = state.lang === "ar" ? MENU_DATA.printedNotes : PRINTED_NOTES_EN;
    printedSrc.forEach(function (n) {
      list.appendChild(el("li", null, n));
    });

    var reviewHeading = el("li", "notes-heading", "<strong>" + t("reviewNotesHeading") + "</strong>");
    reviewHeading.style.marginTop = "10px";
    list.appendChild(reviewHeading);

    var reviewSrc = state.lang === "ar" ? REVIEW_NOTES_AR : MENU_DATA.reviewNotes;
    reviewSrc.forEach(function (n) {
      list.appendChild(el("li", null, n));
    });
  }

  function applyStaticText() {
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      var key = node.getAttribute("data-i18n");
      node.textContent = t(key);
    });
    var current = document.querySelector("[data-lang-current]");
    if (current) current.textContent = state.lang === "ar" ? "EN" : "AR";
  }

  function setLang(lang) {
    state.lang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    applyStaticText();
    applyTabLanguage();
    renderNotes();
    // grill weight-head labels differ by language — re-render menu sections
    renderMenu();
    initActiveTabOnScroll();
    try {
      localStorage.setItem("km-menu-lang", lang);
    } catch (e) {
      /* private mode / storage blocked — fall back silently, default stays ar */
    }
  }

  function initLangToggle() {
    var btn = document.getElementById("langToggle");
    btn.addEventListener("click", function () {
      setLang(state.lang === "ar" ? "en" : "ar");
    });
  }

  function initTopButton() {
    var btn = document.getElementById("topBtn");
    window.addEventListener("scroll", function () {
      btn.classList.toggle("show", window.scrollY > 480);
    });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var scrollObserver = null;

  function initActiveTabOnScroll() {
    var sections = Array.prototype.slice.call(document.querySelectorAll(".cat-section"));
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".cat-tab"));
    if (scrollObserver) {
      scrollObserver.disconnect();
      scrollObserver = null;
    }
    if (!sections.length || !("IntersectionObserver" in window)) return;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            tabs.forEach(function (tab) {
              tab.classList.toggle("active", tab.dataset.target === id);
            });
          }
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      observer.observe(s);
    });
    scrollObserver = observer;
  }

  function boot() {
    var saved = null;
    try {
      saved = localStorage.getItem("km-menu-lang");
    } catch (e) {
      /* ignore */
    }
    state.lang = saved === "en" ? "en" : "ar";
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";

    renderCatNav();
    renderMenu();
    renderNotes();
    applyStaticText();
    initLangToggle();
    initTopButton();
    initActiveTabOnScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
