(function () {
  "use strict";

  var UI = {
    ar: {
      coverKicker: "القائمة الكاملة — الأسعار بالجنيه المصري",
      draftLine:
        "قائمة منقولة من المنيو المطبوع، في انتظار تأكيد المطعم للأسعار والتوفر. البنود غير المؤكدة موضّحة أسفل كل صنف وفي الملاحظات.",
      notesTitle: "ملاحظات",
      footStatus: "نسخة معاينة — الأسعار قيد التأكيد",
      egp: "جنيه",
      needsConfirm: "السعر يحتاج تأكيد",
    },
    en: {
      coverKicker: "The full menu — all prices in Egyptian pounds",
      draftLine:
        "Transcribed from the printed menu, pending the restaurant's confirmation of prices and availability. Unconfirmed items are marked below the dish and listed in the notes.",
      notesTitle: "Notes",
      footStatus: "Preview copy — prices pending confirmation",
      egp: "EGP",
      needsConfirm: "price needs confirmation",
    },
  };

  // Grill items excluded from the ½ / ⅓ / ¼ kg table. Of these, only grilled
  // chicken has portion labels the restaurant has not confirmed — the other two
  // are simply single-price dishes, so flagging them would be a false warning.
  var GRILL_NON_WEIGHT = ["Grilled chicken", "Grilled lamb knuckle", "Menofy special meal"];

  // Full-bleed photograph placed before a chapter. Each image honestly depicts
  // the section it introduces — do not move these without checking the photo.
  var PLATES = {
    "grill-specials": { src: "photo-skillet.jpg", alt: { ar: "طاسة كبدة", en: "Liver skillet" } },
    casseroles: { src: "photo-tagine.jpg", alt: { ar: "طاجن في قدر فخار", en: "Casserole in a clay pot" } },
  };

  // Printed notes exist in Arabic only in the source JSON; the English
  // versions below are translations — the printed Arabic is authoritative.
  var PRINTED_NOTES_EN = [
    "Prices include VAT.",
    "12% is added for dine-in.",
    "Any salad, takeaway: 27 EGP.",
  ];

  var AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  var state = { lang: "ar" };
  var scrollObserver = null;

  function t(key) { return UI[state.lang][key]; }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function bilingual(tag, cls, ar, en) {
    var e = el(tag, cls);
    e.appendChild(el("span", "ar", ar));
    e.appendChild(el("span", "en", en));
    return e;
  }

  function chapterNumeral(idx) {
    var n = idx + 1;
    var s = n < 10 ? "0" + n : String(n);
    if (state.lang !== "ar") return s;
    return s.split("").map(function (d) { return AR_DIGITS[Number(d)]; }).join("");
  }

  /* ---------- rows ---------- */

  function nameNode(item, noteText) {
    var wrap = el("div", "name");
    wrap.appendChild(el("span", "ar", item.ar));
    wrap.appendChild(el("span", "en", item.en));
    if (noteText) wrap.appendChild(el("span", "note", noteText));
    return wrap;
  }

  function cell(value) {
    if (value === null || value === undefined) return el("span", "cell none", "—");
    return el("span", "cell", String(value));
  }

  function colsRow(item) {
    var row = el("div", "row cols");
    row.appendChild(nameNode(item));
    var p = item.printedPrices;
    row.appendChild(cell(p[0]));
    row.appendChild(cell(p[1]));
    row.appendChild(cell(p.length > 2 ? p[2] : null));
    return row;
  }

  // Items sold in named portions (e.g. half / whole chicken) get one line per
  // portion, each with its own price. Never rely on two prices and two labels
  // lining up positionally — in RTL that pairing is fragile and hard to read.
  function portionsRow(item) {
    var row = el("div", "row portions");
    row.appendChild(nameNode(item));
    var list = el("div", "portion-list");
    item.portions[state.lang].forEach(function (label, idx) {
      var line = el("div", "portion-line");
      line.appendChild(el("span", "portion-label", label));
      var price = el("span", "price", String(item.printedPrices[idx]));
      price.appendChild(el("span", "cur", t("egp")));
      line.appendChild(price);
      list.appendChild(line);
    });
    row.appendChild(list);
    return row;
  }

  function singleRow(item, noteText) {
    var row = el("div", "row single");
    row.appendChild(nameNode(item, noteText));
    var price = el("span", "price", item.printedPrices.join(" / "));
    price.appendChild(el("span", "cur", t("egp")));
    row.appendChild(price);
    return row;
  }

  /* ---------- chapters ---------- */

  function plateFor(groupId) {
    var spec = PLATES[groupId];
    if (!spec) return null;
    var fig = el("figure", "plate");
    var img = document.createElement("img");
    img.src = spec.src;
    img.alt = spec.alt[state.lang];
    img.loading = "lazy";
    fig.appendChild(img);
    return fig;
  }

  // The note line under a dish name. Portion labels (e.g. half / whole chicken)
  // sit here so they line up with the prices shown on the same row, in order.
  // reviewNote still drives a "needs confirmation" note if any item regains one.
  function itemNote(item) {
    if (item.reviewNote) return t("needsConfirm");
    return null;
  }

  function buildChapter(group, idx) {
    var section = el("section", "chapter");
    section.id = "cat-" + group.id;

    section.appendChild(el("span", "chapter-num", chapterNumeral(idx)));
    section.appendChild(bilingual("h2", "chapter-title", group.ar, group.en));
    section.appendChild(el("div", "chapter-rule"));

    var isGrills = group.id === "grills";
    var headDone = false;

    group.items.forEach(function (item) {
      var nonWeight = isGrills && GRILL_NON_WEIGHT.indexOf(item.en) !== -1;

      if (isGrills && item.printedPrices.length >= 2 && !nonWeight) {
        if (!headDone) {
          var head = el("div", "weight-head");
          head.appendChild(el("span", null, ""));
          MENU_DATA.grillColumnOrder.forEach(function (col) {
            head.appendChild(el("span", null, state.lang === "ar" ? col.ar : col.kg + " kg"));
          });
          section.appendChild(head);
          headDone = true;
        }
        section.appendChild(colsRow(item));
      } else {
        if (item.portions) {
          section.appendChild(portionsRow(item));
        } else {
          section.appendChild(singleRow(item, itemNote(item)));
        }
      }
    });

    return section;
  }

  function renderMenu() {
    var container = document.getElementById("menuSections");
    container.innerHTML = "";
    MENU_DATA.groups.forEach(function (group, idx) {
      var plate = plateFor(group.id);
      if (plate) container.appendChild(plate);
      container.appendChild(buildChapter(group, idx));
    });
  }

  /* ---------- nav ---------- */

  function renderNav() {
    var nav = document.getElementById("catNav");
    nav.innerHTML = "";
    MENU_DATA.groups.forEach(function (group, idx) {
      var btn = el("button", "cat-tab" + (idx === 0 ? " active" : ""));
      btn.type = "button";
      btn.dataset.target = "cat-" + group.id;
      btn.appendChild(el("span", "ar", group.ar));
      btn.appendChild(el("span", "en", group.en));
      btn.addEventListener("click", function () {
        var target = document.getElementById(btn.dataset.target);
        if (!target) return;
        var barH = document.getElementById("bar").offsetHeight;
        var top = target.getBoundingClientRect().top + window.pageYOffset - barH - 10;
        window.scrollTo({ top: top, behavior: "smooth" });
      });
      nav.appendChild(btn);
    });
  }

  function watchChapters() {
    var chapters = [].slice.call(document.querySelectorAll(".chapter"));
    var tabs = [].slice.call(document.querySelectorAll(".cat-tab"));
    if (scrollObserver) { scrollObserver.disconnect(); scrollObserver = null; }
    if (!chapters.length || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          tabs.forEach(function (tab) {
            var on = tab.dataset.target === id;
            tab.classList.toggle("active", on);
            if (on && tab.scrollIntoView) {
              tab.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
            }
          });
        });
      },
      { rootMargin: "-30% 0px -58% 0px", threshold: 0 }
    );
    chapters.forEach(function (c) { observer.observe(c); });
    scrollObserver = observer;
  }

  /* ---------- notes ---------- */

  function renderNotes() {
    var host = document.getElementById("notesList");
    host.innerHTML = "";
    var items = state.lang === "ar" ? MENU_DATA.printedNotes : PRINTED_NOTES_EN;
    var wrap = el("div", "notes-group");
    var ul = document.createElement("ul");
    items.forEach(function (n) { ul.appendChild(el("li", null, n)); });
    wrap.appendChild(ul);
    host.appendChild(wrap);
  }

  /* ---------- language ---------- */

  function applyStaticText() {
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      node.textContent = t(node.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-lang-current]").forEach(function (node) {
      node.textContent = state.lang === "ar" ? "EN" : "AR";
    });
  }

  function setLang(lang) {
    state.lang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    applyStaticText();
    renderNotes();
    renderMenu();
    watchChapters();
    try { localStorage.setItem("km-menu-lang", lang); } catch (e) { /* storage blocked */ }
  }

  /* ---------- boot ---------- */

  function boot() {
    var saved = null;
    try { saved = localStorage.getItem("km-menu-lang"); } catch (e) { /* ignore */ }
    state.lang = saved === "en" ? "en" : "ar";
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";

    renderNav();
    renderMenu();
    renderNotes();
    applyStaticText();
    watchChapters();

    document.querySelectorAll(".lang-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLang(state.lang === "ar" ? "en" : "ar");
      });
    });

  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
