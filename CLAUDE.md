# CLAUDE.md — SAILS Advisory Site

Handoff context for anyone (human or Claude) working on this codebase. Read this before changing anything.

## What this is

Marketing site for **SAILS Advisory** (sailsadvisory.com), Matt Weisman's B2B sales consulting practice. Target buyer: B2B SaaS founders and sales leaders running **velocity sales motions** (ACV $2K-$24K, cycles under 90 days, BDR/AE or full-cycle inside sales, 0-10 reps). One product: an 8-week fixed-price engagement (Assess → Build → Coach) with two tracks — **Build** (founder-led, no system yet) and **Scale** (reps in seat, uneven results).

Pure static HTML/CSS/JS. No frameworks, no build step. Deployed on Netlify.

## Hard rules (do not break these)

1. **No em dashes or en dashes anywhere in site copy.** Use periods, colons, commas, or middots (·). This is a standing brand rule from Matt. Scan before shipping.
2. **Palette is exactly three colors** plus derived tints: navy `#0D1B4B`, accent blue `#2B60BE`, white. Light gray `#F4F5F7` for section breaks. Never introduce new colors.
3. **Fonts:** Playfair Display (serif, headings) + Inter (sans, body). Loaded from Google Fonts.
4. **The tagline treatment:** "Put the **Win**d in Your Sales." — "Win" is accent blue (`.accent`), the trailing "d" is white (`.hero__d` / `.footer__d`). It's deliberate wordplay; keep it intact in hero and all footers.
5. **Pricing is NOT public.** The Investment section says fixed-price, scope-bound, "investment shared during the discovery conversation." Never publish a dollar figure for the engagement. (Internal context: founding rate exists in the SOW, which is gitignored and must never be deployed.)
6. **Voice:** sharp, direct, opinionated, no corporate-speak. Matt is an operator, not a consultant-speak person. Short sentences. Specific numbers.
7. **About section anonymity:** Matt still works at his current employer. His experience is described as "a high-growth B2B SaaS company" — never name the company in site copy. (llms.txt and schema follow the same rule.)

## Site map

```
/                     Single-page main site: hero, problem (velocity sales definition +
                      comparison table), engagement (Build/Scale tracks, A/B/C cards),
                      who-it's-for, about, investment, FAQ, contact form
/diagnostic/          10-question fit qualifier (Netlify form: fit-diagnostic).
                      Success screen links Calendly + full PDF questionnaire
/resources/           14 resources with category filter tabs (All/Templates/Guides/
                      Playbooks/Calculators). 10 gated downloads + 4 calculator links
/tools/reverse-funnel/        Interactive calculator (ungated)
/tools/pipeline-coverage/     Interactive calculator (ungated)
/tools/lead-response-cost/    Interactive calculator (ungated)
/tools/ae-break-even/         Interactive calculator (ungated)
/blog/                Index + 25 posts. Topics: frameworks, comparisons, hiring,
                      playbooks, metrics, coaching, objections, stage guides
```

## Key integrations

- **Calendly (all Book-a-Call CTAs):** https://calendar.app.google/x2MYasUSFXEeow459 — opens new tab
- **Email:** matt@sailsadvisory.com
- **GA4:** Measurement ID `G-8PN2PNK63C` (property "SAILS Website"). Tag is in the `<head>` of every page. An older abandoned property used G-LN809K6L17 — ignore/never reintroduce it.
- **Google Search Console:** verified via DNS TXT. Sitemap submitted as full URL `https://sailsadvisory.com/sitemap.xml`.
- **DNS:** Nameservers are Netlify (dns1-4.p09.nsone.net). Google Workspace email records (MX smtp.google.com, SPF, DKIM `google._domainkey`) live in **Netlify DNS** — never delete them; email dies.

## Netlify

- Publish directory: `.` (repo root). Config in `netlify.toml` (security headers + asset caching).
- **Forms (12 total), all with honeypot `bot-field`:** `contact`, `fit-diagnostic`, `kpi-tracker-request`, `first-ae-scorecard-request`, `demo-framework-request`, `outbound-sequence-request`, `comp-plan-builder-request`, `discovery-framework-request`, `playbook-starter-request`, `pipeline-review-agenda-request`, `qualification-rubric-request`, `objection-cards-request`.
- Forms pattern: a **hidden static form in `<head>`** registers each form with Netlify's build bot; the visible form submits via fetch (AJAX) so users stay on-page. `resources/resources.js` routes submissions by the form's `data-form-name` attribute and auto-triggers the file download on success.
- Email notifications for submissions are configured in Netlify dashboard (Forms → Notifications → matt@sailsadvisory.com).

## Conventions

- **Cache busting:** stylesheet is referenced as `style.css?v=N` on every page (currently `v=5`); `resources/resources.js?v=2`. If you change either file, bump the version across ALL pages (a one-line sed/python sweep — see git history).
- **New blog post checklist:** copy an existing post as template → update title/meta/canonical/OG/Twitter → update `BlogPosting` + `BreadcrumbList` JSON-LD → add card to `blog/index.html` grid AND its `Blog` JSON-LD `blogPost` array → add `<url>` to `sitemap.xml` → add bullet to `llms.txt` → cross-link 3 related posts in the "Keep reading" grid.
- **New gated resource checklist:** file into `assets/` (kebab-case `sails-*.pdf/xlsx`) → hidden Netlify form in resources page `<head>` → visible card with unique SVG illustration + form (`data-form-name`, `data-resource`, `data-download`, `data-category`) → update `llms.txt`.
- **Calculators** are ungated pages under `/tools/` with `WebApplication` schema, live client-side JS, GA4 `calculate` event (debounced), and a Calendly CTA below results.
- **SEO/GEO:** every page has canonical, OG, Twitter cards, JSON-LD. Root has `robots.txt` (AI crawlers explicitly allowed), `llms.txt` (structured site summary — keep it updated with new content), `sitemap.xml` (33 URLs).

## Regenerating the branded PDFs

Sources live in `.pdf-sources/*.html` (styled HTML, letter-size pages). Render with Chrome headless:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=assets/<output>.pdf \
  file://$(pwd)/.pdf-sources/<source>.html
```

The Excel templates (`sails-kpi-tracker`, `sails-outbound-sequence-builder`, `sails-comp-plan-builder`) were generated with Python `openpyxl` scripts; the comp plan builder uses live cross-sheet formulas. If you need to regenerate, the generation scripts are in the git history of this repo's early commits (or rebuild from the file contents).

## Known TODOs (as of June 2026)

- Add Matt's **LinkedIn URL** to the `Person` schema `sameAs` array on `index.html` (single biggest pending E-E-A-T win). Need the slug from Matt.
- The downloadable **diagnostic questionnaire PDF** (`assets/SAILS - Sales Diagnostic Questionnaire - TEMPLATE.pdf`) still lists 5 legacy service names that don't match the current Build/Scale track model, and its footer says matt@sails.consulting (wrong domain). Matt to update the PDF.
- No `apple-touch-icon.png` (cosmetic).
- Consider a DMARC record (`_dmarc` TXT, `v=DMARC1; p=none; rua=mailto:matt@sailsadvisory.com`) in Netlify DNS.
- Candidate future tools: Velocity Fit Score quiz (scored version of the diagnostic), AE Break-Even Calculator.
- GA4 key events to mark once data flows: `form_submit`, `file_download`, outbound `click` (Calendly), `calculate`.

## Files intentionally excluded from the repo (.gitignore)

- `SAILS_Proposal_SOW_Template.pdf` — internal SOW with private pricing. Must never deploy.
- `SAILS logo copy.png` — stray duplicate of `assets/sails-logo.png`.
- `.DS_Store`
