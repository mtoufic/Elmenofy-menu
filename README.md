# Kamel El Menofy — Digital Menu (separate from the main website)

Built 2026-09-07. Plain static HTML/CSS/JS, no build step, no dependencies.

## What this is
A standalone, mobile-friendly digital menu meant to be shared as a link on Facebook
and Messenger later — kept completely separate from the approved main website
(`website/` in the handoff), whose own menu dialog is untouched.

- Source of truth: `menu-draft/printed-menu-transcription.json` (130 items, 12
  categories, transcribed from the printed menu photographs). Not the old
  Talabat/marketplace catalogue used inside the main site.
- Bilingual: Arabic-first (RTL) with a working English (LTR) toggle, top right.
  Toggle state is remembered locally per device (falls back to Arabic if storage
  is unavailable).
- All prices shown in EGP.
- Standard grill items show three columns in the confirmed order: ½ kg, ⅓ kg, ¼ kg.
- Same brand palette/type as the approved website (cream `#f2e4cc`, ivory
  `#f4ead7`, ink `#231913`, red `#941b20`, gold `#d3aa4d`; Georgia/serif for
  English headings, Geeza Pro/Noto Naskh Arabic for Arabic).
- The official red logo (`website/public/brand/official-red.png`) is used unchanged
  (resized for web).

## Flagged, unconfirmed items (visible in the menu itself, not just here)
- **Grilled chicken** (فرخة مشوية): printed 184 / 368 EGP. Portion labels are
  NOT confirmed, so it is deliberately shown as a plain two-price row, not forced
  into the ½/⅓/¼ kg columns. Tagged "sizes unconfirmed" / "الأحجام غير مؤكدة".
- **Freekeh casserole with meat** (طاجن فريك باللحمة): printed price read
  provisionally as 353 EGP. Tagged "needs confirmation" / "يحتاج تأكيد".
- **Birell / Fayrouz** (بيريل — فيروز): printed Arabic and printed English
  disagree on the product name. Tagged "needs confirmation" / "يحتاج تأكيد".
- **Veal chops** (ريش بتلو): only two printed prices exist; the ¼ kg column
  correctly shows a dash rather than a guessed number.
- Printed policy notes (VAT included, +12% dine-in, takeaway salad flat 27 EGP)
  are shown in the Notes section, translated for the English view, with a
  disclaimer that they are transcribed as printed, not confirmed current policy.
- Nothing from the old cover photo's hotline/branch text was used — it is not
  independently confirmed.

## Running the local preview
No server required — just open `index.html` directly in a browser (double-click,
or drag into a browser window). Everything is self-contained relative paths
(`css/`, `js/`, `images/`), so it works from `file://` with no internet connection.

If you'd rather serve it locally: `python3 -m http.server 8080` from inside this
folder, then visit `http://127.0.0.1:8080/`.

## Hosting-ready
This folder *is* the hosting-ready output — it's already flat static files with
relative paths, so it can be uploaded as-is to any static host (e.g. Cloudflare
Pages) when you're ready. Nothing has been deployed, no domain or `pages.dev`
subdomain has been checked or claimed, and no publishing has happened — that
step needs your explicit go-ahead per the handover instructions.

## Regenerating after restaurant confirms prices
Edit `menu-draft/printed-menu-transcription.json` (the copy in the handoff
folder) and re-run the small generator that produced `js/menu-data.js`:

```
python3 gen_data.py
```

(Script lives alongside this handoff; ask Claude to re-run it rather than
hand-editing `js/menu-data.js`, which is auto-generated.)

## What was deliberately NOT done
- No ordering, cart, or booking flow (no fake submissions).
- No contact/hotline info added (not independently confirmed).
- Nothing published, no domain purchased, no Facebook/Messenger posting, no
  account access changed.
