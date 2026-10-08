# WPE Leeds — Site Backlog

Last reviewed **8 October 2026**, after the audit and content pass that removed fabricated
material, aligned the site with the official WPE copy, and added the theme and project pages.
Tick items off as they're completed. Items marked **(blocked)** need a decision before anyone
can act on them.

---

## P0 — Decisions needed

Small answers that unblock work already half-done.

- [ ] **Cake meetings: room and sign-up link.** `cake-meetings.html` says "Room to be confirmed"
      and "link to follow". Both are marked with TODO comments in the markup.
- [ ] **Job titles for ten people added in October.** Hiwar, Tarn, Rees, Shahzad, Sylvester,
      Grisaffi, Velenturf, Zhan, Cook, Cottom all have an empty title line and are filed under
      "Academics" by default. Each card carries an HTML comment saying so.
- [ ] **Is `wpe-pgr@leeds.ac.uk` dead too?** `wpe-group@` has been replaced with
      `m.f.king@leeds.ac.uk` in 22 places; `wpe-pgr@` is still used on cake-meetings and in the
      newsletter.
- [ ] **Three more people?** Paul Eke and Karen Stevens (retired) are in the photo roster but not
      on the site; Subarna Sivashanmugam has profile material in the official folder.
- [ ] **Louise Fletcher's theme.** The official copy names her under both Indoor Air and
      BioResources; a card takes one tag. Currently BioResources.
- [ ] **Theme pages are drafts.** `indoor-air.html`, `water.html`, `sanitation.html` and
      `bioresources.html` are converted from the capability drafts marked v1/v2. Approve or revise
      before they are promoted anywhere.
- [ ] **Two unlinked posts:** `news-blog/posts/earth_day.html` ("WPE Earth Day Visual") and
      `news-blog/posts/snake.html` ("¡Snake Matemático!"). Link, leave or delete. The second looks
      like it belongs to a different project.
- [ ] **Two home-page news items.** "WPE department secures 1.2M grant for a new biological
      chamber" (March 2023) reuses the same figure as a fabricated item that was deleted — verify
      or remove. "PhD Student Award" (March 2026) points at a spotlight that doesn't exist.

---

## P1 — Wrong or missing on a live page

### Facilities
- [ ] 8 missing lab photographs: `images/facilities/microbiology-lab-main.jpg`,
      `microbiology-equipment-1..3.jpg`, `soil-lab-main.jpg`, `soil-equipment-1..3.jpg`.
- [ ] Three lab sections exist in the navigation with no content written: **Soil Analysis**,
      **Resource Recovery**, **Microplastics**.
- [ ] Instrument models listed for the air quality lab (TSI OPS 3330, TSI APS 3321, Coriolis µ)
      are not in the official capability copy. Confirm they are real and current.

### Links that 404
- [ ] `publications.html` — linked from the home page, never written. Either write it or drop the
      link. (A publications list is the obvious use for the Symplectic export.)
- [ ] `photo-competition/archive/2024-gallery.html`
- [ ] `documents/wpe-photo-competition-guidelines-2025.pdf`

### Missing images
- [ ] `images/competition/hero-collage.jpg`, `images/competition/2024-grand-winner.jpg`
- [ ] `images/research/collab-urban.jpg`, `sanitation-lab.jpg`, `water-lab.jpg`
- [ ] Placeholder API images still in `research/airflow.html` (2), `research/biocool.html` (2) and
      `newsletter/24_04_25_newsletter.html` (1).

---

## P2 — Noticeable to a visitor

- [ ] **42 of 43 "View Profile" links go nowhere** (`href="#"`). Either point them at a Leeds
      staff page per person, or remove the button until individual pages exist. Cynthia's is the
      only one wired, to her spotlight.
- [ ] **63 social icons link to `#`** on person cards. Connect or remove.
- [ ] **`about.html` still says "20 academics and >50 PhD students".** The official figures are
      **33 academics and more than 50 doctoral researchers**, across **four themes**. The home page
      has already been corrected; about.html has not.
- [ ] Home page: three cake-meeting teaser cards have "Learn More" going to `#` — should go to
      `cake-meetings.html`.
- [ ] `contact.html`: "Postgraduate Research" link in the FAQ goes to `#`.
- [ ] **Four people still show the placeholder portrait:** Kris Moodley, Andy Sleigh,
      Johan Pasos-Panqueva, David Elliott. Zhan, Cook and Cottom also use it, pending the
      permission question below.
- [ ] **Ten photographs are upscaled from very small originals** and look soft at 600px. Worst:
      John Forth (150×183), Doug Stewart (150×200), Duncan Borman and Louise Fletcher (154×205),
      Sally Shahzad (160×192). Ask those people for a decent photograph.
- [ ] **Photo permissions.** `sources.csv` flags six photographs "check permission before
      publishing". Tarn and Grisaffi are approved and live; Velenturf now uses her own official
      portrait. Cook, Cottom and Zhan are in the repo but unused — clear them before use.

---

## P3 — Content

- [ ] **Delete `js/network.js`.** It is no longer loaded by any page, but it still contains the
      fabricated people and invented publication counts. It is tracked in git, so removing it is
      recoverable. The theme-level diagram that replaced it is generated by
      `network/build_collaboration.py`.
- [ ] **Only 25 of the 42 people in a theme appear in the collaboration diagram**, because the
      rest have no matched output in the 2018–2025 extract. Sanitation & WASH is represented by
      just two people, which understates it. Rerun the generator when the extract is refreshed.
- [ ] **Theme pages are text-only.** `indoor-air.html`, `water.html`, `sanitation.html`,
      `bioresources.html` would each take two or three real images. The chamber, Cynthia's Uganda
      set and Zhe's CFD figures are already in the repo.
- [ ] **Generic card descriptions** remain for: Barrington, Babatunde, Heitor, Sleigh, Forth,
      Borman, Stewart, Trigg, Moodley, Asachi, Bettadapura Subramanyam, Chen, Pasos-Panqueva.
- [ ] **Verify the doctoral and alumni roster.** Three names on the site are confirmed in
      `WPE_roster.csv`: Bushra Hasan, Jemma Phillips and Xiaoxuan Qin (all three now credited on the
      ECR branding post). Still unconfirmed anywhere: **Jack Dalton**, **Gettie Shiinda**,
      **Anushi Khandare**. **Tatiana Zúñiga** is probably the roster's *Zuniga Burgos, Laura*
      (supervisor Camargo-Valero) — check which name she uses. Also: the site lists 4 PhD
      researchers against "more than 50" in the official copy.
- [ ] **Bushra Hasan has no card on `people.html`** although she is in the roster (supervisor
      Marco-Felipe King, so Indoor Air) and is now pictured on the ECR branding post. A square
      portrait is ready at `images/people/square/Hasan_Bushra.jpg`.
- [ ] **`people.html` calls her "Dr. Jemma Phillips"** and files her as `past-phd`; the roster lists
      her as a PhD student. Confirm whether she has graduated before the title stays.
- [ ] **One card is incoherent** and currently commented out on `people.html`: heading
      "Dr Caroline Montoyo Pachongo", alt text "Dr Benjamin", image `benjamin.jpg`, filed under
      Sanitation with an indoor-air description. Probably Carolina Montoya-Pachongo.
- [ ] **Image provenance.** `images/research/hecoira.png` and `Circular_Economy_diagram.png` look
      like stock imagery of unknown licence and are now on new pages.

### Spotlights and posts — semi-manual, from staff notes

Working pattern, confirmed October 2026: **ask the researcher for notes and images first, then
compile.** Two worked examples to copy:
`spotlights/cynthia/index.html` and `news-blog/posts/flooded-latrines.html`.

- [ ] Anne Velenturf — wind turbine blade circularity (TransFIRe, EoLO-HUBs, IEA Wind Task 45)
- [ ] Mark Tarn — single-particle bioaerosol detection on lab-on-a-chip devices
- [ ] A facilities piece on the aerobiology chamber and far-UVC
- [ ] A news item announcing the cake meeting series restart
- [ ] **Real quotes for the ECR branding post.** Three quote blocks were removed from it: one
      unattributed "WPE ECR Team" quote and two put in the mouths of Jack Dalton and Gettie
      Shiinda, none of them traceable to anything. Ask the five team members for a sentence each.
- [ ] **The hand-drawn concept sketches** for the branding project exist (Marco has them). They
      belong in the post between "The brief" and "The logo"; the section is written to take them.
- [ ] `spotlights/doug-booker/` exists as an empty folder — air quality and environmental justice

---

## P4 — Infrastructure and process

### Weekly media monitoring (agreed direction)

Worth automating because it is **monitoring, not writing**: the output is links for a human to
triage, so there is nothing for an agent to invent.

- [ ] Start with the cheap baselines before building anything: Google Alerts per staff name, the
      University press office list, and the Altmetric attention scores already in the Symplectic
      export.
- [ ] Then a weekly job that searches news for staff names, and returns **outlet, date, headline,
      URL and the matched name only** — no drafting, no summarising into publishable prose.
- [ ] It must dedupe against previous weeks and handle common-name false positives (several of
      our surnames are common; the mapping work found 5.7% false attributions from surname-only
      matching).
- [ ] Output into a review list, not onto the site. Publication stays a human decision.

### Brand assets

- [ ] **Consider a `/brand` page.** The full pack lives in OneDrive at
      `Admin/WPE/WPE Brand Assets/`: guideline PDF, four logo variants x four colourways x four
      file formats, two patterns, two email-banner templates, a PowerPoint template, and the fonts.
      Nothing on the site points at it, so colleagues improvise. A single page with the logo files,
      the palette and a download link would stop that. Ten files from the pack are now in
      `images/news-blog/ecr-branding/`.
- [ ] **`images/people/bushra.png` is a 2 MB landscape PNG.** The square 600px crop is committed;
      the original should move to `images/people/originals/` with the rest.

### Repo housekeeping
- [ ] **`.DS_Store` is already tracked**, so the new `.gitignore` rule does nothing for it:
      needs `git rm --cached` to actually leave the repo.
- [ ] Orphan files in the root, publicly reachable but unlinked — decide keep, move or delete:
      `old_index.html`, `preguntas_inspeccionales.html`, `ukri_bar_chart.html`,
      `ukri_heatmap.html`, `coauthor_network.html`, `leeds_network.html`, `report.html`.
- [ ] Keep a credits/provenance record for published photographs. `sources.csv` currently lives
      outside the repo with the raw extracts.
- [ ] `mapping_tool/` has been moved out of this repo. The method-map template port and the
      gate-1 reconstruction script went with it.

---

## Done — October 2026 pass

Recorded so nobody redoes it.

- Removed fabricated content: an invented seminar speaker, four invented commenters and bylines,
  six fabricated news items (including a £1.2M grant and a Cape Town partnership), and a
  collaboration network built from invented people and counts.
- Corrected headline figures against the official copy: 33 academics, 50+ doctoral researchers,
  500+ in water@leeds, 2 EPSRC CDTs. Removed unverifiable facilities claims (£4.2M, 850 m², 24/7).
- Aligned the site to the official **four themes plus data-driven methods**; retired the
  "Public Health" group and re-tagged seven people.
- New pages: `methods.html`, four theme pages, `research/hecoira.html`,
  `projects/microplastics.html`, `projects/circular-buildings.html`, `projects/urban-health.html`,
  Cynthia's spotlight and Zhe's post.
- Photographs: 600px square set wired to 28 cards, placeholder for the rest, `originals/` ignored.
- Fixed: `include.js` removed everywhere and the live `<include>` footer inlined; blog post
  stylesheets that 404'd from `/news-blog/posts/`; in-article figures cropped to 200px by the
  listing CSS; cake meetings rebuilt from the October memo; dead `wpe-group@` address.
- Broken links went from 37 to 3, missing images from 43 to 16, unresolved CSS/JS to 0.
- **Rebuilt the ECR branding post against the real brand guideline.** The team grid now names the
  five doctoral researchers who did the work (Dalton, Hasan, Phillips, Qin, Shiinda). Ten assets
  from the group's own brand pack were added: the four logo variants, both patterns, and the
  business-card and embossed-letterhead mock-ups, with the business card as the thumbnail on both
  listing pages and the letterhead as the featured image. Corrected against the guideline: the five
  colours have names (Summer Blue, Orbit, Wisteria, Riverbed, Earth Stone) and are not per-group
  labels; the type system is Heading/Display/Body with a licensing note. Removed: an invented
  three-concept story ("Flow", "Elements", "Impact"), invented implementation and roadmap claims,
  three untraceable quotes, a dead comment form and a stray `</section>`.
- **Replaced the fabricated collaboration network** with a theme-level diagram on `people.html`,
  generated from the Symplectic evidence by `network/build_collaboration.py` into
  `data/collaboration.js` and rendered by `js/collaboration.js`. Counts co-authorship between the
  four themes, names nobody, states its own provenance on the page, and comes with a data table
  rather than relying on the picture. Dropped the D3 CDN dependency, which nothing else used.
