# Kamel El Menofy — Digital Menu

Live: **https://elmenofy-menu.pages.dev**

Plain static HTML/CSS/JS. No build step, no dependencies, no framework.
Cloudflare Pages deploys this repo automatically on every push to `main`
(framework preset: None, build command: empty, output directory: `/`).

## Repo layout is flat
Every file sits at the repo root — `index.html` references `menu.css`, `menu.js`,
`menu-data.js`, `logo.png` and the photos with no folder prefix. Don't reintroduce
`css/`, `js/` or `images/` folders without updating `index.html` to match.

## What this is
A standalone digital menu for sharing on Facebook and Messenger, kept separate
from the main website (whose own menu is untouched).

- **Source of truth:** `menu-draft/printed-menu-transcription.json` in the
  handoff pack — 130 items, 12 categories, transcribed from the printed menu.
  Not the older Talabat/marketplace catalogue used inside the main website.
- **Bilingual:** Arabic-first (RTL) with a full English (LTR) toggle. The choice
  is remembered per device, falling back to Arabic if storage is unavailable.
- **All prices in EGP.** Standard grill items use the confirmed ½ kg / ⅓ kg / ¼ kg
  column order.

## Design
Editorial rather than transactional — the opposite of the photo-grid/PDF pattern
most Egyptian restaurant menus use online.

- **Type:** Amiri (classical Naskh) for Arabic headings, Tajawal for Arabic body,
  Cormorant Garamond for English headings, system sans for English body.
  Loaded from Google Fonts with `display=swap`.
- **Palette** matches the approved website: cream `#f2e4cc`, ivory `#f4ead7`,
  ink `#231913`, red `#941b20`, gold `#d3aa4d`. Red is reserved for the logo
  badge alone — gold carries rules and labels, ink carries prices.
- **Photography:** cover plus two full-bleed section breaks. Each photo honestly
  depicts the section it introduces (`photo-skillet.jpg` before Grill specials,
  `photo-tagine.jpg` before Casseroles). We only have a handful of approved
  photos, so there are deliberately no per-dish thumbnails.

## Unconfirmed items — flagged in the menu itself
Shown as a quiet note under the dish name. The detailed reviewer list was removed
from the Notes section at the client's request (it read as internal QA language on
a customer-facing page); the per-item notes and the draft line under the cover are
what keep the page honest.

- **Grilled chicken** (فرخة مشوية) — printed 184 / 368 EGP. Portion labels are
  NOT confirmed, so it is deliberately kept out of the ½/⅓/¼ kg table.
- **Freekeh casserole with meat** (طاجن فريك باللحمة) — price read provisionally
  as 353 EGP.
- **Birell / Fayrouz** (بيريل — فيروز) — printed Arabic and English names disagree.
- **Veal chops** (ريش بتلو) — only two printed prices exist; the ¼ kg column shows
  a dash rather than an invented number.
- Printed policy notes (VAT included, +12% dine-in, takeaway salad 27 EGP) appear
  in the Notes section, transcribed as printed.
- Nothing from the old cover photo's hotline/branch text is used anywhere.

Note that `Grilled lamb knuckle` and `Menofy special meal` are also excluded from
the weight table, but they are simply single-price dishes — they must NOT be
flagged as uncertain. See `GRILL_NON_WEIGHT` vs the flag logic in `menu.js`.

## Editing
`menu-data.js` is generated from the source JSON by `gen_data.py` — regenerate it
rather than hand-editing. Once the restaurant confirms prices, update the source
JSON, re-run the generator, and remove the draft line in `menu.js` (`draftLine`)
plus the per-item flags that no longer apply.

## Local preview
Open `index.html` directly in a browser, or serve the folder with
`python3 -m http.server 8080`. Everything uses relative paths; only the webfonts
need a connection.
