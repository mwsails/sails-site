# CLAUDE.md · SAILS Site

Handoff context for anyone (human or Claude) working on this codebase. Read this before changing anything.

## What this is

Marketing site for **SAILS** (sailsadvisory.com), an AI go-to-market platform for B2B SaaS. Target buyer: B2B SaaS founders and sales leaders running **velocity sales motions** (ACV $2K-$24K, cycles under 90 days, BDR/AE or full-cycle inside sales, 0-10 reps). Three AI agents, a **CRO** (diagnosis), a **VP of Sales** (teaching), and an **Enablement Lead** (building), run the platform's continuous **Assess, Build, Coach** loop across two tracks · **Build** (founder-led, no system yet) and **Scale** (reps in seat, uneven results). The underlying framework ran at scale as a fixed-price consulting engagement before it was ever software; that history is proof, referenced only in past tense (see hard rule 8).

As of August 2026 SAILS is pre-launch: no public pricing, primary site CTA is "Run the Fit Diagnostic," secondary is "Join the Waitlist." The actual product is a separate repo (`sails-platform`, not this one) · this repo is the marketing site only.

Pure static HTML/CSS/JS. No frameworks, no build step. Deployed on Netlify.

## Hard rules (do not break these)

1. **No em dashes or en dashes anywhere in site copy.** Use periods, colons, commas, or middots (·). This is a standing brand rule from Matt. Scan before shipping.
2. **Palette (SAILS Brand Guide v4 · "Deep Water to Open Sky"):** Deep Navy `#0D1B4B` (primary), Royal Blue `#2B60BE` (action/CTAs), Beacon Cyan `#35C8E8` (AI-layer surfaces only · never decorative, never used for anything non-AI; this marketing site has no AI-layer UI, so in practice cyan should not appear here), Sky `#5A8EE0` (support/secondary), Mist `#A8C0EA` (muted tint), Paper `#F7F5EF` (ground · replaces the old light gray), Signal Red `#B3261E` (errors only), Ember `#E4572E` (wins/positive deltas only · never appears together with Signal Red). Usage ratios: 60% paper/white space, 30% deep navy gradient, 8% royal blue (CTAs/rules only), 2% mist (tags/rules). Five named gradients exist as CSS custom properties in `style.css`: `--grad-deep-water` (navy→royal), `--grad-following-wind` (royal→sky), `--grad-beacon` (royal→cyan, AI-only), `--grad-sunset` (ember→amber, wins only), `--grad-paper` (white→mist). Never invent a sixth gradient or stack two in one component. Always reference the CSS custom properties, never raw hex.
3. **Fonts:** Playfair Display (serif, headings, bold 700 for display sizes, semibold 600 for card headings under 28px) + Public Sans (sans, body/UI · regular 400 for paragraphs, semibold 600 for labels/buttons/eyebrows). Loaded from Google Fonts. Never use a third typeface.
4. **The tagline treatment:** "Put the **Win**d in Your Sales." · "Win" is accent blue (`.accent`), the trailing "d" is white (`.hero__d` / `.footer__d`). It's deliberate wordplay; keep it intact in hero and all footers.
5. **Pricing is NOT public, full stop.** The pricing model isn't set yet. Never publish a dollar figure for what SAILS costs; "Pricing Coming Soon" is the only allowed pricing-adjacent copy. The homepage's "What SAILS Replaces" comparison table (guessing / a consultant $15-25K / a VP hire $200K+) shows *alternatives'* costs, not SAILS's own · that's a comparison anchor, not an exception to this rule. (Internal context: the legacy engagement's founding rate exists in the SOW, which is gitignored and must never be deployed.)
6. **Voice:** sharp, direct, opinionated, no corporate-speak. Matt is an operator, not a consultant-speak person. Short sentences. Specific numbers.
7. **About section anonymity:** Matt still works at his current employer. His experience is described as "a high-growth B2B SaaS company" · never name the company in site copy. (llms.txt and schema follow the same rule.)
8. **The consulting engagement is always past tense.** "SAILS built and ran this at scale as a fixed-price consulting engagement before it was ever software" is proof, not the offer. Never write copy that sells the engagement itself, describes it as ongoing, or names a fractional VP of Sales anywhere but a "not a fit" disqualifier list (never in hero, nav, or pricing).

## Site map

```
/                     Single-page main site: hero, waitlist form, reframe (velocity
                      sales + comparison table), how-it-works (three agent voices,
                      Assess/Build/Coach, Build/Scale tracks), who-it's-for, proof
                      (about), what-SAILS-replaces (comparison table), FAQ, contact
/diagnostic/          10-question fit qualifier (Netlify form: fit-diagnostic),
                      the site's primary CTA. Success screen: mailto CTA + full
                      PDF questionnaire. Re-skinned only, no scoring logic yet
                      (see Known TODOs)
/resources/           14 resources with category filter tabs (All/Templates/Guides/
                      Playbooks/Calculators). 10 gated downloads + 4 calculator links
/tools/reverse-funnel/        Interactive calculator (ungated)
/tools/pipeline-coverage/     Interactive calculator (ungated)
/tools/lead-response-cost/    Interactive calculator (ungated)
/tools/ae-break-even/         Interactive calculator (ungated)
/blog/                Index + 24 posts. Topics: frameworks, comparisons, hiring,
                      playbooks, metrics, coaching, objections, stage guides
```

## Key integrations

- **Calendly is retired.** The site no longer has a "Book a Call" CTA anywhere (pre-launch/waitlist model · see hard rule 5). If you find a `calendar.app.google` link anywhere, that's a bug from before the August 2026 repositioning; replace it with the Fit Diagnostic (`/diagnostic/`) or waitlist (`#waitlist` on the homepage).
- **Email:** matt@sailsadvisory.com
- **GA4:** Measurement ID `G-8PN2PNK63C` (property "SAILS Website"). Tag is in the `<head>` of every page. An older abandoned property used G-LN809K6L17 · ignore/never reintroduce it.
- **Google Search Console:** verified via DNS TXT. Sitemap submitted as full URL `https://sailsadvisory.com/sitemap.xml`.
- **DNS:** Nameservers are Netlify (dns1-4.p09.nsone.net). Google Workspace email records (MX smtp.google.com, SPF, DKIM `google._domainkey`) live in **Netlify DNS** · never delete them; email dies.

## Netlify

- Publish directory: `.` (repo root). Config in `netlify.toml` (security headers + asset caching).
- **Forms (13 total), all with honeypot `bot-field`:** `contact`, `waitlist`, `fit-diagnostic`, `kpi-tracker-request`, `first-ae-scorecard-request`, `demo-framework-request`, `outbound-sequence-request`, `comp-plan-builder-request`, `discovery-framework-request`, `playbook-starter-request`, `pipeline-review-agenda-request`, `qualification-rubric-request`, `objection-cards-request`. `waitlist` (homepage, `#waitlist`) shares the `contact` form's pattern (real form in the page body, AJAX handled directly in `script.js`), not the resources-page hidden-form-in-head pattern below.
- Forms pattern: a **hidden static form in `<head>`** registers each form with Netlify's build bot; the visible form submits via fetch (AJAX) so users stay on-page. `resources/resources.js` routes submissions by the form's `data-form-name` attribute and auto-triggers the file download on success.
- Email notifications for submissions are configured in Netlify dashboard (Forms → Notifications → matt@sailsadvisory.com).

## Conventions

- **Cache busting:** stylesheet is referenced as `style.css?v=N` on every page (currently `v=6`); `resources/resources.js?v=N` (currently `v=3`, only referenced on `resources/index.html`). If you change either file, bump the version across ALL pages that reference it (a one-line sed/python sweep · see git history).
- **New blog post checklist:** copy an existing post as template → update title/meta/canonical/OG/Twitter → update `BlogPosting` + `BreadcrumbList` JSON-LD → add card to `blog/index.html` grid AND its `Blog` JSON-LD `blogPost` array → add `<url>` to `sitemap.xml` → add bullet to `llms.txt` → cross-link 3 related posts in the "Keep reading" grid.
- **New gated resource checklist:** file into `assets/` (kebab-case `sails-*.pdf/xlsx`) → hidden Netlify form in resources page `<head>` → visible card with unique SVG illustration + form (`data-form-name`, `data-resource`, `data-download`, `data-category`) → update `llms.txt`.
- **Calculators** are ungated pages under `/tools/` with `WebApplication` schema, live client-side JS, GA4 `calculate` event (debounced), and a "Run the Fit Diagnostic" CTA below results.
- **SEO/GEO:** every page has canonical, OG, Twitter cards, JSON-LD. Root has `robots.txt` (AI crawlers explicitly allowed), `llms.txt` (structured site summary · keep it updated with new content), `sitemap.xml` (31 URLs).

## Regenerating the branded PDFs

Sources live in `.pdf-sources/*.html` (styled HTML, letter-size pages). Render with Chrome headless:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=assets/<output>.pdf \
  file://$(pwd)/.pdf-sources/<source>.html
```

The Excel templates (`sails-kpi-tracker`, `sails-outbound-sequence-builder`, `sails-comp-plan-builder`) were generated with Python `openpyxl` scripts; the comp plan builder uses live cross-sheet formulas. If you need to regenerate, the generation scripts are in the git history of this repo's early commits (or rebuild from the file contents).

## Known TODOs (as of August 2026)

- **`/diagnostic/` has no scoring logic.** It's a 10-field lead-capture form Matt reviews manually, despite being the site's primary CTA and being called a "diagnostic." Real client-side scoring (a Velocity Fit Score) was deliberately deferred as a fast-follow during the August 2026 repositioning, not forgotten · re-skin-only was the explicit call to ship the rebrand without blocking on new scoring logic.
- Add Matt's **LinkedIn URL** to the `Person` schema `sameAs` array on `index.html` (single biggest pending E-E-A-T win). Need the slug from Matt.
- The downloadable **diagnostic questionnaire PDF** (`assets/SAILS - Sales Diagnostic Questionnaire - TEMPLATE.pdf`) still lists 5 legacy service names that don't match the current platform model, and its footer says matt@sails.consulting (wrong domain). The surrounding page copy was updated during the repositioning; the PDF's own content was not. Matt to update the PDF.
- **`.pdf-sources/*.html`** (7 files generating the gated resource PDFs) still say "SAILS Advisory" and reflect old-model pricing/service framing in their actual content. Out of scope for the repositioning (marketing site only), but will visibly clash with the rebranded site. Near-term follow-up.
- No `apple-touch-icon.png` (cosmetic).
- Consider a DMARC record (`_dmarc` TXT, `v=DMARC1; p=none; rua=mailto:matt@sailsadvisory.com`) in Netlify DNS.
- GA4 key events to mark once data flows: `form_submit` (contact + waitlist + fit-diagnostic + gated resources), `file_download`, `calculate`.

## Files intentionally excluded from the repo (.gitignore)

- `SAILS_Proposal_SOW_Template.pdf` · internal SOW with private pricing. Must never deploy.
- `SAILS logo copy.png` · stray duplicate of `assets/sails-logo.png`.
- `.DS_Store`
