# WPELeeds (`wpeleeds.org`) - Web Team GitHub Deployment & Handover Guide

**Prepared by:** Dr Marco-Felipe King (Director of WPE) & WPE Web/Copywriting Team  
**Date:** 14 November 2026  
**Source Folder:** `WPELeeds/` (`/Users/cenmk/Library/CloudStorage/OneDrive-UniversityofLeeds/Documents/Admin/WPE/WPELeeds`)  
**Target:** Clean `wpeleeds.org` GitHub Pages Repository (`/Users/cenmk/Documents/GitHub/WPELeeds`)  

---

## 1. Latest Release Updates (14 November 2026)

This release resolves all hero/card/carousel UI issues, adds Leeds-based Water-WISER CDT doctoral researchers and portraits, names and attributes the EPSRC **CECAM** chamber (`EP/W006375/1`) under **Prof. Cath Noakes OBE**, replaces the subjective dot-rating facilities matrix with a 100% verified facilities and instrumentation summary, and updates **Dr Paul Hutchings**'s postgraduate leadership role:

1. **Highlight Hero Height, Pill Clearance & Scoped Chamber Photo (`css/research-highlight.css`, `css/style.css`, `research/*.html`, `projects/*.html`):**
   - Changed `.research-hero` from fixed `height: 60vh` to `height: auto; min-height: 520px; padding: 9.5rem 2rem 4.5rem;` (`min-height: 440px; padding: 11rem 1.25rem 4rem;` on mobile `<=768px`) so neither the top green `IMPACT CASE STUDY` badge nor the bottom theme badge (`Sanitation, Wastewater & Faecal Sludge Management`) is clipped on `research/sanitation-impact.html` or any highlight page.
   - Added theme-specific hero modifiers (`.research-hero--sanitation`, `.research-hero--bioresources`, `.research-hero--circular`, `.research-hero--water` and `.page-header--*`) so `capabilities_chamber.jpg` appears strictly on Indoor Air and Facilities pages (`indoor-air.html`, `facilities.html`, `airflow.html`, `covid19-impact.html`, `hecoira.html`), while Sanitation, BioResources, Circular Buildings, and Water pages use their own verified photography.
2. **`index.html` Sanitation Theme Card & Hero `"Scroll to explore"` Overlap (`index.html`, `css/style.css`):**
   - Fixed the empty dark-grey card on `index.html`: removed inline `color: inherit;` from `<a class="group-card">` and styled all 5 `.group-card` links in the canonical WPE 5-theme palette (`#77AAD4`, `#6F8AC6`, `#8AC9C1`, `#9F90C5`, `#53525a`) with `#ffffff` text, icons, and badges.
   - Fixed `.btn-secondary` contrast on light backgrounds (`var(--secondary-blue)`) while preserving white `.btn-secondary` buttons inside dark hero/contact banners.
   - Updated `.hero` to `height: auto; min-height: 86vh; padding: 8.5rem 0 7rem;` so `.hero-scroll-indicator` (`Scroll to explore`) clears the `Meet Our Team` pill cleanly at all viewport sizes.
3. **`research-groups.html` Key Projects Carousel (`research-groups.html`, `css/research-groups.css`, `js/research-groups.js`):**
   - Wrapped `.projects-slider` in `.projects-slider-viewport { overflow: hidden; }` and rewrote `initProjectSliders()` in `js/research-groups.js` to calculate exact card width + CSS gap (`32px`), dynamically build dot indicators (`maxSlide + 1`), and support desktop/tablet/mobile resize, keyboard, and touch swipe navigation.
   - Expanded `#indoor-air` Key Projects to 5 linked project cards (`CECAM`, `Modelling Airflow`, `Healthy Buildings Network & Class-ACT`, `HESTIA & JUSTHEAT`, `HECOIRA`).
4. **Water-WISER CDT Leeds-Based PhD Students & Portraits (`people.html`, `images/people/square/*.jpg`, `data/collaboration.*`):**
   - Audited all 53 Water-WISER CDT profiles (`waterwisercdt.ac.uk`) against University of Leeds registration, supervisor records, and White Rose eTheses Online (`etheses.whiterose.ac.uk`), excluding Loughborough and Cranfield students.
   - Corrected `Jack Dalton`'s profile (`cnjed@leeds.ac.uk`, `data-group="sanitation"`) to his verified Water-WISER PhD on sanitation greenhouse gas emissions and bioaerosols.
   - Added 13 current Leeds-based Water-WISER PhD candidates (`data-role="phd"`): `Leonie Hyde-Smith`, `Grace Phiri`, `Jonathan Wilcox`, `Karl Jones`, `Jamie Myers`, `Virginia Roaf`, `Lais Dos Santos`, `Spurthi Kolipaka`, `Ben Smeaton-Russell`, `Mary Wambugu`, `Vince Moran`, `James Wallace`, and `Madison Wright`.
   - Added 8 graduated Leeds-based Water-WISER PhDs (`data-role="past-phd"`): `Dr Georgia Hales`, `Dr Katie Allen`, `Dr Hannah Robinson`, `Dr Angela Bayona-Valderrama`, `Dr Mahbub Ul Alam`, `Dr Mariam Zaqout`, `Dr Claire Rosato-Scott`, and `Dr Mofwe Kapulu`.
   - Added square `600x600` portraits (`<80 KB` each) for **Dr Zhe Zhan** (`Zhan_Zhe.jpg`), **Prof. Andy Sleigh** (`Sleigh_Andy.jpg`), and all 21 Water-WISER researchers, and regenerated `data/collaboration.json` and `data/collaboration.js`.
5. **CECAM Chamber (`EP/W006375/1`), Prof. Cath Noakes OBE & Verified Facilities Summary (`facilities.html`, `css/facilities.css`, `indoor-air.html`, `bioresources.html`, `methods.html`, `contact.html`):**
   - Named **CECAM: Chamber for Environmental Control of Airborne Microorganisms** (`5 x 3.2 x 2.5 m` Class II chamber, Room B.02, funded by EPSRC Strategic Equipment Grant `EP/W006375/1`) and set **Prof. Cath Noakes OBE** (`C.J.Noakes@leeds.ac.uk`) as Primary Contact across `facilities.html`, `indoor-air.html`, and `contact.html`.
   - Audited every equipment entry against `05_WPE_Capabilities_Main_Page_final.md`, `10_WPE_BioResources_and_Circular_Economy_final.md`, `11_Research_Facilities_final.md`, and `Lab Equipment/Chamber and micro equipment list.xlsx` (replacing unverified `AMPTS II`, `TSI 3330/3321`, and `Bertin Coriolis` with the verified **BioReactor Simulator III [BRS III]**, **Agilent 990 Micro GC**, **in-house waste respirometers**, **Geotech GA5000 & G200**, **Andersen 6-stage impactor**, **AMPAS**, **Plair Rapid-E+**, **Burkard C90M**, **Cantium MicroBio M02**, **Ushio Care222**, **Bio-Rad CFX Opus 96 qPCR**, **Hach AP3900 Robotic Analyser**, and joint Leeds-Makerere **AMPTS III**).
   - Replaced the subjective `●●● / ●● / ●` dot-rating `Technical Capabilities Matrix` on `facilities.html` with a 5-column factual **Verified Facilities & Instrumentation Summary** table.
6. **Dr Paul Hutchings Role Update (`people.html`, `sanitation.html`, `contact.html`):**
   - Updated `Dr Paul Hutchings` to `Associate Professor in Water, Sanitation and Health; Deputy Director of Postgraduate Research Studies`.
7. **Image Weight & Copy Verification:**
   - Compressed `images/research/rc_slab_construction.jpg` (`3.35 MB -> 356 KB`) and `xiaohui_catchment_ml.jpg` (`569 KB -> 175 KB`); all site images are now `< 500 KB`.
   - Verified `0` em dashes (`—` or `&mdash;`), `0` broken links on active pages, and consistent `Prof.` / `Dr` titles across all HTML pages.

---

## 2. Modified & Added Files to Push to GitHub

- **HTML Pages:** `index.html`, `research-groups.html`, `people.html`, `facilities.html`, `indoor-air.html`, `sanitation.html`, `water.html`, `bioresources.html`, `methods.html`, `contact.html`, `research/sanitation-impact.html`, `research/biocool.html`, `research/covid19-impact.html`, `research/hecoira.html`, `projects/circular-buildings.html`, `projects/microplastics.html`, `projects/urban-health.html`
- **Stylesheets & Scripts:** `css/style.css`, `css/research-highlight.css`, `css/research-groups.css`, `css/facilities.css`, `js/research-groups.js`
- **Generated Data:** `data/collaboration.json`, `data/collaboration.js`
- **New/Optimised Images:** `images/people/square/Zhan_Zhe.jpg`, `images/people/square/Sleigh_Andy.jpg`, 21 Water-WISER portraits in `images/people/square/`, `images/research/rc_slab_construction.jpg`, `images/research/xiaohui_catchment_ml.jpg`, `images/facilities/xiaohui_catchment_ml.jpg`
- **Documentation:** `WEB_TEAM_HANDOVER.md`

---

## 3. Sync & Git Push Commands

Both `/Users/cenmk/Library/CloudStorage/OneDrive-UniversityofLeeds/Documents/Admin/WPE/WPELeeds` and `/Users/cenmk/Documents/GitHub/WPELeeds` are synchronised via `rsync` (without `--delete`, preserving `CNAME`, `LICENSE`, `README.md`, and `.git/` in `/Users/cenmk/Documents/GitHub/WPELeeds`). To commit and push from `/Users/cenmk/Documents/GitHub/WPELeeds`:

```bash
cd /Users/cenmk/Documents/GitHub/WPELeeds
git status
git add -A
git commit -m "Fix hero/cards/carousel, add Leeds Water-WISER PhDs & portraits, add CECAM & verified facilities matrix"
git push origin main
```
