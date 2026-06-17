# WPE Leeds — Site Backlog

Priority actions found during June 2026 site audit. Tick items off as they're completed.

---

## P1 — Broken / Actively Wrong

### Missing staff photos (broken images on people.html)
Photos must be added to `images/people/`:
- [ ] `barbara_evans.jpg`
- [ ] `paul_hutchings.jpg`
- [ ] `katharine_booker.jpg`
- [ ] `andy_sleigh.jpg`
- [ ] `franja_prosenc.jpg`
- [ ] `david_elliott.jpg`
- [ ] `mark_trigg.jpg`
- [ ] `duncan_borman.jpg`
- [ ] `doug_stewart.jpg`
- [ ] `dani_barrington.jpg`
- [ ] `akintunde_babatunde.jpg`
- [ ] `ana_heitor.jpg`
- [ ] `benjamin.jpg`
- [ ] `johan_pasos.jpg`
- [ ] `john_forth.jpg`
- [ ] `kris_moodley.jpg`
- [ ] `louise_fletcher.jpg`
- [ ] `maryam_asachi.jpg`
- [ ] `shashank_bettadapura.jpg`
- [ ] `xiaohui_chen.jpg`

### Missing linked blog post pages (linked from news-blog.html / news-blog/index.html → 404)
- [ ] `news-blog/posts/major-research-grant.html`
- [ ] `news-blog/posts/cape-town-collaboration.html`
- [ ] `news-blog/posts/envhealth-conference.html`
- [ ] `news-blog/posts/maria-lopez-award.html` (now labelled "young researcher award")
- [ ] `news-blog/posts/new-faculty-member.html` (now labelled "Dr. Franja Prosenc")
- [ ] `news-blog/posts/sensing-techniques.html`

Either write the posts or remove the post-card entries from news-blog.html and news-blog/index.html.

### Incomplete lab sections in facilities.html
Three labs have only HTML stub comments — no content:
- [ ] Soil Analysis lab
- [ ] Resource Recovery lab
- [ ] Microplastics lab

---

## P2 — Noticeable to a Visitor

### Dead navigation buttons
- [ ] `index.html` "Learn More" on 3 cake-meeting teaser cards → change to `href="cake-meetings.html"`
- [ ] `cake-meetings.html` "Learn More" on all 6 meeting cards → link to a detail anchor or remove until pages exist
- [ ] `contact.html` "Postgraduate Research" link in FAQ → `href="#"` (link to correct page or remove)

### `include.js` still loaded (harmless but loads a broken script)
Remove `<script src="js/include.js" defer></script>` from these pages:
- [ ] `research-groups.html`
- [ ] `news-blog.html`
- [ ] `cake-meetings.html`
- [ ] `photo-competition.html`
- [ ] `news-blog/posts/ecr-branding-project.html`
- [ ] `news-blog/posts/overshoot_2025.html`
- [ ] `news-blog/index.html`

### Favicon missing on 3 pages
Add `<link rel="icon" href="images/wpe_favico.ico" type="image/x-icon">` to `<head>` of:
- [ ] `about.html`
- [ ] `contact.html`
- [ ] `people.html`

### Placeholder images remaining
- [ ] `research/airflow.html` — 2 partner logos still `/api/placeholder/200/100`
- [ ] `research/biocool.html` — 2 partner logos still `/api/placeholder/200/100`
- [ ] `newsletter/24_04_25_newsletter.html` — WPE logo still `/api/placeholder/200/50`

### Missing news images
- [ ] `images/news-1.jpg`
- [ ] `images/news-3.jpg`

---

## P3 — Content Gaps / Polish

### Staff card descriptions
The following people have stub or generic descriptions on people.html — add real research summaries:
Barrington, Babatunde, Heitor, Sleigh, Forth, Borman, Stewart, Trigg, Moodley, Fletcher, Asachi, Bettadapura, Xiaohui Chen, Pasos, Benjamin

### "View Profile" links
All 36+ person cards link to `href="#"` — either remove the button or change to `mailto:` until individual profile pages exist.

### About page — outdated numbers
- [ ] "20 academics and >50 PhD students" → update to current headcount
- [ ] "4 research groups" → 5 research sub-groups

### Cake meetings calendar
Static HTML calendar shows April 2025 — all dates in the past. Update or replace with a rolling schedule.

### Social media links on person cards
All `href="#"` — connect to real profiles or remove the icon links.

### Missing blog sidebar links (posts link to non-existent pages)
Sidebar "Related Posts" and category links in blog post pages resolve to 404:
- `news-blog/categories/achievements.html` and other category pages
- `news-blog/posts/academic-writing-tips.html`
- `news-blog/posts/ecr-showcase-2024.html`, `ecr-showcase-2025.html`
- `news-blog/posts/phd-communication-workshop.html`
- `news-blog/posts/career-development-resources.html`
- `news-blog/posts/effective-research-visualization.html`
- Several more referenced in ecr-branding-project.html sidebar

Either write the posts or replace sidebar links with links to existing content.

### Photo competition archive
`photo-competition/archive/2024-gallery.html` doesn't exist — remove link until page is created.

### Facilities lab photos
Images referenced in facilities.html that likely don't exist yet:
`images/facilities/microbiology-*.jpg`, `images/facilities/soil-*.jpg`, `images/facilities/air-lab-main.jpg` — add real lab photos.

---

## P4 — Infrastructure / Housekeeping

### Orphan / dev files in repo root (not linked from nav but publicly accessible)
Decide whether to keep, move, or delete:
- [ ] `old_index.html`
- [ ] `preguntas_inspeccionales.html`
- [ ] `ukri_bar_chart.html`, `ukri_heatmap.html`
- [ ] `coauthor_network.html`, `leeds_network.html`
- [ ] `report.html`

### `network.js` — collaboration links
Co-authorship links in `js/network.js` are illustrative placeholders. Replace with real Scopus-derived data when available.

### Index page animated stats
Verify the counters on `index.html` (publications count, grant value, etc.) against current Scopus data.
