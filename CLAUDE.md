# WPE Leeds — Claude Code Guide

## Project overview

Static website for the **Water, Public Health and Environmental Engineering (WPE)** research group at the University of Leeds, School of Civil Engineering. Live at **www.wpeleeds.org**, hosted on GitHub Pages.

The site showcases the group's ~28 academics and >50 PhD researchers, five research sub-groups, publications, grants, news, and facilities.

## Tech stack

- **Pure static site** — HTML, CSS, vanilla JavaScript. No build step, no bundler, no framework.
- **D3.js** (v7, loaded from CDN) for co-authorship network visualisations.
- **Font Awesome** (v6.4, CDN) for icons.
- **Google Fonts** — Nunito.
- **Python scripts** in `network/` query the **Scopus API** to generate publication/grant data and co-authorship networks. These are offline data-pipeline tools, not served to the browser.

## Repository layout

```
/
├── index.html              # Home page (hero, animated stats)
├── about.html              # Group history & timeline
├── research-groups.html    # Five research sub-groups with project sliders
├── people.html             # Filterable people directory + D3 network
├── facilities.html         # Lab equipment
├── cake-meetings.html      # Internal seminar series
├── news-blog.html          # News/blog index
├── contact.html
├── photo-competition.html
├── pacmates.html
│
├── css/                    # Per-page stylesheets + shared style.css
├── js/                     # Per-page vanilla JS modules
├── images/                 # Static images (people, logos, research)
├── data/                   # CSV files — papers_<name>.csv, grants_<name>.csv
├── includes/               # Reusable header.html / footer.html snippets
├── news-blog/posts/        # Individual blog post HTML files
├── spotlights/             # Researcher spotlight pages
├── newsletter/             # Newsletter HTML archives
├── research/               # Individual research project pages
└── network/                # Python data-pipeline scripts (Scopus API)
```

## Research sub-groups

| Group | Key themes |
|-------|-----------|
| Indoor Air | Ventilation, airborne infection, building CFD |
| BioResources | Resource recovery, bioenergy, waste |
| Public Health Engineering | WASH, low-income contexts, disease burden |
| Sanitation | Faecal sludge, toilet tech, behaviour |
| Water / Hydrology | Flood risk, water quality, networks |

## Data pipeline (Python / Scopus)

Scripts live in `network/`. They pull publications and grants via the Scopus API and write CSV files consumed by the browser JS.

- `UKRI_test.py` — classifies publications against UKRI priority areas.
- `coauthor_test.py` / `run_coauthor_analysis.py` — builds co-authorship adjacency data.
- `csv_file_organizer.py` — sorts output CSVs into `data/`.

The Scopus API key is embedded in the Python scripts. Do not commit a new key; treat existing key as sensitive context.

## Key JS patterns

- **Navigation highlight**: each HTML page has an inline `<script>` that reads `window.location.pathname` and adds `class="active"` to the matching nav link. When adding a new page, copy this pattern.
- **Page-specific JS**: each feature has its own file in `js/` (e.g. `js/people.js`, `js/research-groups.js`). Load via `<script src="js/foo.js" defer>` in the `<head>`.
- **Stats counters**: `js/stats.js` uses `IntersectionObserver` + `requestAnimationFrame` to count up `.stat-number[data-count]` elements.
- **People filtering**: filter state is held in plain variables (`currentRoleFilter`, `currentGroupFilter`, `currentSearchQuery`); `applyFilters()` shows/hides `.person-card` elements by `data-role` and `data-group` attributes.
- **D3 network** (`people.html`): force-directed graph loaded lazily after D3 CDN script injects. Researcher data and links are hardcoded arrays inside the script block.

## CSS conventions

- CSS custom properties defined in `:root` in `css/style.css` (`--primary-blue`, `--secondary-blue`, `--purple`, `--teal`, etc.).
- Each page has a companion stylesheet in `css/` (e.g. `css/people.css`). Global styles only go in `css/style.css`.
- No preprocessors. Write plain CSS.

## Adding content

### New blog post
Create `news-blog/posts/<slug>.html` following an existing post as template. Add a corresponding `.post-card` entry in `news-blog.html`.

### New person
Add a `.person-card` block in `people.html` with `data-role` and `data-group` attributes matching the existing filter values. Add CSV files `data/papers_<name>.csv` and `data/grants_<name>.csv` if needed. Add name to `wpe_staff.txt`.

### New research project page
Create `research/<slug>.html`. Link from the relevant group section in `research-groups.html`.

## Deployment

Push to `main` — GitHub Pages builds automatically from the repo root.  
If the site doesn't update: `git commit --allow-empty -m "Trigger rebuild" && git push`

## What to avoid

- Do not introduce a build system or package manager unless explicitly agreed.
- Do not add JavaScript frameworks (React, Vue, etc.) — the site is intentionally zero-dependency on the client side.
- Do not inline styles in HTML; use the existing CSS files.
- Do not commit `.DS_Store` or other macOS artefacts.
- The Scopus API key in `network/UKRI_test.py` is real — do not expose it in new files or logs.
- **Never use `include.js` or `<include src="...">` tags.** GitHub Pages is a static host — server-side includes do not work. This pattern was found broken across multiple pages; the failed includes left embedded `<!DOCTYPE html><head><body>` blocks inside `<body>`, requiring manual cleanup. The `js/include.js` file remains in the repo but should not be referenced in any page's `<head>`.

## Known orphan / dev files (do not link publicly)

Files in the repo root that are internal tools or drafts, not part of the public site:
- `old_index.html` — superseded draft
- `preguntas_inspeccionales.html`, `ukri_bar_chart.html`, `ukri_heatmap.html` — Scopus data exploration
- `coauthor_network.html`, `leeds_network.html`, `report.html` — network pipeline outputs
