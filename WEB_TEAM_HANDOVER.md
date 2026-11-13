# WPELeeds (`wpeleeds.org`) - Web Team GitHub Deployment & Handover Guide

**Prepared by:** Dr Marco-Felipe King (Director of WPE) & WPE Web/Copywriting Team  
**Date:** November 2026  
**Source Folder:** `WPELeeds/` (`/Users/cenmk/Documents/Admin/WPE/WPELeeds`)  
**Target:** Clean `wpeleeds.org` GitHub Pages Repository (`/Users/cenmk/Documents/GitHub/WPELeeds`)  

---

## 1. Executive Summary of Changes

This release synchronises `wpeleeds.org` with the approved University of Leeds Official Website copy (`Official Website/06 Approved final copy/01-11`), standardises staff and researcher titles across the entire site (`people.html` and `wpe_staff.txt`), rebuilds the Scopus co-authorship network (`data/collaboration.js` & `data/collaboration.json`), updates the 2026-2027 Cake Meetings schedule (run jointly by academic and ECR staff, with the 3 November 2026 Digital Twins session, the 1 December 2026 WPE Christmas Party, open 2027 slots, and the **10-14 May 2027 WPE All-Hands in Leeds Week**), corrects all laboratory and theme images across `facilities.html`, `water.html`, and `research-groups.html`, fixes the `about.html` milestones layout and verifies all milestone dates against REF2021 and KRISTAL records, standardises our **four core research themes** and **one cross-cutting methods theme** using the 5 official WPE Brand Palette colours, replaces missing staff portraits with a crisp SVG person outline (`images/people/square/_placeholder.svg`), removes all em dashes across all 43 HTML files, and optimises all images for fast GitHub Pages delivery.

---

## 2. Summary of Key Factual & Design Updates

1. **Title Homogenisation Across All Pages:**
   - **Dr Marco-Felipe King:** `Director of WPE; Lecturer in Building Engineering and Infection Transmission; Co-Director, EPSRC CDT in Future Fluid Dynamics` (updated from Associate Professor to Lecturer across all pages).
   - **Prof. Barbara Evans:** `Professor of Public Health Engineering; Deputy Head of School of Civil Engineering; Co-Director, EPSRC WaterWISER CDT`.
   - **Full Professors:** Standardised as `Prof. [First] [Last]` with `Professor of [Subject]...` (replacing mixed `Chair in` / `Professor of` usage).
   - **Associate Professors:** Standardised as `Dr [First] [Last]` (UK English `Dr` without period) with `Associate Professor in [Subject]...` across `Dr Amirul Khan`, `Dr Anne Velenturf`, `Dr Miller Alonso Camargo-Valero`, `Dr Mohsen Besharat`, `Dr Duncan Borman`, `Dr Xiaohui Chen`, `Dr Akintunde Babatunde`, `Dr Paul Hutchings`, and `Dr Sally Shahzad`.
   - **Dr Subarna Sivashanmugam:** Updated to `Research Assistant in Low-Carbon Construction and Circular Economy` (`data-role="postdoc"`, `data-group="bioresources"`), linking to `https://eps.leeds.ac.uk/civil-engineering/staff/17063/dr-subarna-sivashanmugam`, with verified research on Building Information Modelling (BIM), construction waste minimisation, and life cycle assessment (LCA) of reinforced concrete slabs (EPSRC IAA) and belite-calcium sulfoaluminate (BCSA) cement (UKRI FLF), plus a dedicated spotlight page at `news-blog/posts/spotlight-subarna-sivashanmugam.html`.
   - **Dr Bushra Hasan:** Moved to `Past PhDs` (`data-role="past-phd"`, `PhD Graduate`); removed Cake Meetings Co-Organiser from both `Dr Bushra Hasan` and `Anushi Khandare`.
2. **Person Outline Placeholder (`images/people/square/_placeholder.svg`):**
   - Replaced solid grey placeholder blobs with a clean head-and-shoulders line outline of a person for staff/PGRs without a cleared portrait (`Prof. Andy Sleigh`, `Dr David Elliott`, `Dr Zhe Zhan`, `Johan Pasos-Panqueva`), and added circular portrait `<img>` tags to all contact blocks on `facilities.html` and `cake-meetings.html`.
3. **Corrected Facility & Water Theme Images (`facilities.html`, `water.html`, `research-groups.html`):**
   - **`facilities.html#soil` (Geochemistry & Soil Lab):** Removed the Aerobiology Chamber anemometry rig (`lab_instrument_bench.jpg`) and Antarctic expedition photo (`sda_helideck_sampling.jpg`); replaced with verified geochemistry and materials images (`doug_stewart_research.jpg`, `civil_capabilities.jpg`, `bcsa_cement.jpg`).
   - **`facilities.html#microplastics` (Microplastics & Hydraulics Lab):** Removed the St James's Hospital airflow CFD (`wnw_tube_z1.jpg`) and chamber anemometry (`lab_instrument_bench.jpg`); replaced with the B-KER² 6-paddle jar-testing flocculator (`microplastics_jar_testing.jpg`), HACH robot (`hach_robot.jpg`), and catchment hydrology/ML figure (`xiaohui_catchment_ml.jpg`).
   - **`water.html` & `research-groups.html#water`:** Replaced `images/research/water-lab.jpg` (previously a copy of St James's Hospital airflow CFD) with the real B-KER² 6-paddle jar-testing flocculator laboratory photograph (`microplastics_jar_testing.jpg`) and added `images/research/xiaohui_catchment_ml.jpg`.
4. **Four Core Research Themes + One Cross-Cutting Methods Theme:**
   - Standardised naming, badge labels, and card colour accents across `index.html`, `about.html`, `research-groups.html`, `people.html`, `facilities.html`, and the 5 theme pages:
     1. **Indoor Air Quality & Airborne Infection** (`#77AAD4`, Summer Blue)
     2. **Water Supply & Treatment** (`#6F8AC6`, Orbit Blue)
     3. **Sanitation, Wastewater & Faecal Sludge Management** (`#8AC9C1`, Riverbed Teal)
     4. **BioResources & the Circular Economy** (`#9F90C5`, Wisteria Purple)
     - *Cross-Cutting Theme:* **Data-Driven & Computational Methods** (`#53525a`, Earth Stone)
5. **`about.html` Milestones Display & Date Verification:**
   - Fixed the CSS clipping bug on `.timeline-content` / `.timeline-track` (`css/style.css` and `js/timeline.js`) so all milestone cards render in an unclipped responsive grid.
   - Included only dates verified from the REF2021 Impact Case Study PDF and KRISTAL grant database (`2011-2014` SFD & UN SDG 6.2; `2017-2021` EPSRC HECOIRA; `2019-2024` EPSRC WaterWISER CDT & GCRF Water Security Hub; `2020-2022` SAGE EMG, Class-ACT & EPSRC CECAM Chamber; `2022-2024` BBSRC Discovery Fellowship, EoLO-HUBs & HumanIC; `2024-2026` EPSRC Future Fluid Dynamics CDT, HESTIA, BioCool & 2026 Pettenkofer Award).
6. **Cake Meetings (`cake-meetings.html`, `index.html`, `about.html`):**
   - Updated to reflect joint organisation by academic and ECR staff.
   - Verified `Tuesday 3 November 2026` (*Digital Twins & AI in WPE*, hosted by `Dr Marco-Felipe King` and `Dr Amirul Khan`, with talks by `I Wayan Arnaya`, `Khadija`, `Jiaxian`, and `Dr Amirul Khan`).
   - Set `Tuesday 1 December 2026` to **WPE Christmas Party**, and set `January-June 2027` monthly slots to *To be confirmed* / *Open* alongside the `10-14 May 2027` **WPE All-Hands in Leeds Week**.
7. **Zero Em Dashes:**
   - Audited and copyedited all 43 HTML files so 0 em dashes (`—` or `&mdash;`) remain anywhere on the site.

---

## 3. Sync & Git Push Commands

Both `/Users/cenmk/Documents/Admin/WPE/WPELeeds` and `/Users/cenmk/Documents/GitHub/WPELeeds` have been synchronised via `rsync` (preserving `.git/` in `/Users/cenmk/Documents/GitHub/WPELeeds`). To commit and push from `/Users/cenmk/Documents/GitHub/WPELeeds`:

```bash
cd /Users/cenmk/Documents/GitHub/WPELeeds
git status
git add -A
git commit -m "Update WPE titles, themes, facilities images, Cake Meetings schedule, milestones, and copy"
git push origin main
```
