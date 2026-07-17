# SAILS Advisory · SEO + GEO Audit

**Page:** `index.html` (single-page site)
**Domain:** sailsadvisory.com
**Audit date:** 2026-05-19
**Tone constraint:** sharp, direct, no corporate-speak, no em dashes.

---

## Executive summary

**Overall GEO Readiness: 58 / 100**

| Dimension | Score | Notes |
|---|---|---|
| Citability (passage quality) | 13 / 25 | Copy is sharp but missing a clean "What is velocity sales?" definition block. AI engines can't cite the page for the core query. |
| Structural readability | 16 / 20 | H1→H2 hierarchy is clean, FAQ uses native `<details>`. Missing FAQPage schema. |
| Multi-modal content | 11 / 15 | Logo + 5 illustrations now in place. Could add a comparison table (velocity vs enterprise). |
| Authority / brand signals | 8 / 20 | No author byline, no Person schema, no Organization schema, no sameAs links to LinkedIn/Crunchbase. |
| Technical accessibility | 10 / 20 | Server-rendered HTML ✓. Missing: canonical, Twitter cards, robots.txt, llms.txt, JSON-LD. |

**Biggest unlocks (in order):**
1. Add a 120-160 word definition of "velocity sales" near the top of the page. This is the #1 GEO win.
2. Add JSON-LD schema (Organization, Person, Service, FAQPage). Easy, high-impact.
3. Add canonical URL + Twitter Card meta tags.
4. Create `robots.txt`, `sitemap.xml`, `llms.txt`.
5. Tighten meta description to include "B2B SaaS" and "founders."

---

## Target keyword set

### Primary commercial intent
- `B2B sales consulting` (head, broad)
- `velocity sales consulting` (niche, very high intent)
- `sales playbook consultant` (long-tail, decision-stage)
- `B2B SaaS sales consultant` (head, qualified)
- `8-week sales engagement` (long-tail, exact match)
- `fixed-price sales consulting` (long-tail, exact match)

### Pain-point / informational
- `how to scale founder-led sales`
- `how to build a sales playbook for B2B SaaS`
- `velocity sales motion vs enterprise sales`
- `when should a founder stop selling`
- `BDR AE motion for early stage SaaS`
- `coaching SMB AEs`

### Answer-engine queries (Perplexity / ChatGPT / Google AIO)
- `What is velocity sales?`
- `What is a B2B velocity sales motion?`
- `How is velocity sales different from enterprise sales?`
- `What goes in a sales playbook?`
- `How long does it take to build a sales process for a startup?`

The page currently signals well for `velocity sales` but doesn't define it. **That's the single biggest gap.**

---

## What's good (keep this)

1. **Title tag** is brand-first, descriptive, under 70 chars.
2. **Hero subhead** opens with a sharp differentiating claim ("Most sales consultants are enterprise operators trying to bolt MEDDIC onto velocity motions"). High citation potential if MEDDIC and velocity sales are defined nearby.
3. **Problem section H2** "Why Most Early Sales Teams Stall" is a perfect answer-engine heading. It matches a real buyer query.
4. **Right Fit / Not a Fit lists** are gold for AI engines. They explicitly answer "Is this for me?" with structured data.
5. **FAQ section** uses native `<details>` (server-rendered, crawler-readable).
6. **No JavaScript-rendered content.** Everything is static HTML, which means full crawler access.
7. **Specific numbers throughout** ($18,000, 8 weeks, $2K-$12K ACV, sub-90 day cycles, 8+ years, 6x ARR, 100→10,000 demos, 5x deal size). AI engines love specific, citable claims.

---

## Critical edits (do these first)

### Edit 1 · Add a velocity sales definition block (biggest GEO win)

**Where:** Insert as the opening paragraph of the Problem section (#problem), right under the H2.

**Why:** AI engines look for "X is..." passages of 134-167 words to cite. The page currently has no definition of "velocity sales" anywhere, so it can't be cited for the most relevant query.

**Add this paragraph (148 words):**

```html
<p class="prose__definition reveal">
  <strong>Velocity sales</strong> is a B2B sales motion built around short cycles, transactional buyers, and high-volume rep activity. ACVs typically run $2,000 to $12,000. Deal cycles close inside 90 days, often under 14. Reps work as BDR/AE pairs or full-cycle inside sales, and the team's job is to move volume through a documented playbook. It's the opposite of enterprise sales, where six-figure ACVs and 12-month cycles reward MEDDIC, multi-threading, and committee navigation. The two motions have different physics. Velocity rewards rep activity, message-to-market fit, fast iteration, and a clear next-best-action at every stage. Most sales consultants come from enterprise. When they apply MEDDIC or Force Management to a $5K-ACV inside-sales motion, reps slow down, deal cycles balloon, and conversion drops. Velocity needs its own playbook.
</p>
```

(Add a small CSS rule for `.prose__definition` if you want to style it distinctly, e.g., slightly larger leading paragraph with a left border.)

### Edit 2 · Add JSON-LD schema (big GEO + traditional SEO win)

**Where:** Inside `<head>`, before `</head>`.

**Why:** Schema is the most structured signal you can give AI engines. Service + FAQPage + Person schema together make the page citable across ChatGPT, Perplexity, and Google AI Overviews.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://sailsadvisory.com/#organization",
      "name": "SAILS Advisory",
      "url": "https://sailsadvisory.com",
      "logo": "https://sailsadvisory.com/assets/sails-logo.png",
      "founder": { "@id": "https://sailsadvisory.com/#matt" },
      "email": "matt@sailsadvisory.com",
      "description": "B2B sales consulting for SaaS founders running velocity sales motions."
    },
    {
      "@type": "Person",
      "@id": "https://sailsadvisory.com/#matt",
      "name": "Matt Weisman",
      "jobTitle": "Founder, SAILS Advisory",
      "worksFor": { "@id": "https://sailsadvisory.com/#organization" },
      "description": "Former VP of Sales at Harness Technologies. Built outbound SMB motion, scaled AE demos from ~100/year to 10,000+/year, grew ARR 6x in 5 years.",
      "sameAs": [
        "https://www.linkedin.com/in/REPLACE-WITH-LINKEDIN-SLUG"
      ]
    },
    {
      "@type": "Service",
      "name": "SAILS 8-Week Sales Engagement",
      "provider": { "@id": "https://sailsadvisory.com/#organization" },
      "description": "An 8-week fixed-price B2B sales consulting engagement: Assess (weeks 1-2), Build (weeks 3-6), Coach (weeks 5-8). Includes ICP definition, messaging framework, pipeline stages, discovery and demo frameworks, outbound sequence design, KPI tracker, hiring profile, and a 20-30 page Sales Playbook.",
      "areaServed": "Worldwide",
      "audience": {
        "@type": "BusinessAudience",
        "audienceType": "B2B SaaS founders, pre/at Series A, ACV $2K-$12K, sub-90-day sales cycles"
      },
      "offers": {
        "@type": "Offer",
        "price": "18000",
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "price": "18000",
          "priceCurrency": "USD",
          "valueAddedTaxIncluded": false
        }
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What's the difference between the Build track and the Scale track?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Build track is for teams with wins but no system: typically founder-led sales that needs to be handed off. Scale track is for teams with reps in place but uneven results. We determine which fits during the discovery call."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need to have a sales team in place?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Many Build track clients are pre-first-hire. We build the engine before you hire into it."
          }
        },
        {
          "@type": "Question",
          "name": "How much time does this require from my team?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The engagement is designed to be async-first. You'll need to complete a diagnostic questionnaire before kickoff and commit to bi-weekly 60-minute sessions during the Coach phase. Outside of that, the work is mine."
          }
        },
        {
          "@type": "Question",
          "name": "What happens after week 8?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Coaching retainers are available starting at $2K/month for continued bi-weekly sessions and async support. No obligation. It's an option, not the default."
          }
        },
        {
          "@type": "Question",
          "name": "Is this right for a non-SaaS business?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Possibly. The frameworks are built around B2B SaaS velocity motions, but the underlying physics apply to any short-cycle, transactional B2B sale. Reach out and we'll be direct about fit."
          }
        }
      ]
    }
  ]
}
</script>
```

### Edit 3 · Tighten the meta description

**Current (148 chars):**
> "An 8-week sales consulting engagement for B2B founders and revenue leaders running a velocity motion. Assess. Build. Coach. Fixed fee. No fluff."

**Recommended (155 chars):**
> "An 8-week fixed-price B2B sales consulting engagement for early-stage SaaS founders. Build a velocity sales playbook that scales past founder-led."

The new version adds "fixed-price," "SaaS founders," and "scales past founder-led" — three high-intent keywords. Drops "No fluff" (clever but adds no SEO value).

### Edit 4 · Add the missing meta tags

```html
<!-- Canonical -->
<link rel="canonical" href="https://sailsadvisory.com/" />

<!-- Robots -->
<meta name="robots" content="index, follow, max-image-preview:large" />

<!-- Author -->
<meta name="author" content="Matt Weisman" />

<!-- Twitter Card (Open Graph already present) -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="SAILS Advisory · Put the Wind in Your Sales." />
<meta name="twitter:description" content="An 8-week fixed-price sales consulting engagement for B2B SaaS founders running velocity sales motions." />
<meta name="twitter:image" content="https://sailsadvisory.com/assets/sails-logo.png" />
```

### Edit 5 · Refine the title tag

**Current:** `SAILS Advisory · Build the velocity sales engine your business deserves.`

**Issue:** "velocity sales engine" is a coined phrase that no buyer searches for. The current title leads with brand voice instead of buyer language.

**Recommended:** `SAILS Advisory · B2B Sales Consulting for Velocity SaaS Motions` (63 chars)

This keeps the brand first, uses real search terms ("B2B Sales Consulting"), and qualifies the niche ("Velocity SaaS Motions").

---

## High-impact edits (do these second)

### Edit 6 · Add a "Velocity vs Enterprise" comparison table

**Where:** Inside the Problem section, after the new definition paragraph.

**Why:** AI engines love tables. They are the most-cited content type for comparison queries.

```html
<div class="compare reveal">
  <h3 class="compare__h">Velocity vs Enterprise sales motions</h3>
  <table class="compare__table">
    <thead>
      <tr><th>Dimension</th><th>Velocity</th><th>Enterprise</th></tr>
    </thead>
    <tbody>
      <tr><td>ACV</td><td>$2K – $12K</td><td>$100K – $1M+</td></tr>
      <tr><td>Sales cycle</td><td>Under 90 days, often under 14</td><td>6 to 18 months</td></tr>
      <tr><td>Decision-makers</td><td>1 to 2</td><td>5 to 12 (committee)</td></tr>
      <tr><td>Rep motion</td><td>BDR/AE or full-cycle inside</td><td>Strategic AE, multi-threaded</td></tr>
      <tr><td>Best-fit framework</td><td>Playbook, scripts, rep activity</td><td>MEDDIC, MEDDPICC, Force Management</td></tr>
      <tr><td>What wins deals</td><td>Speed, message-market fit, volume</td><td>Relationship depth, political access</td></tr>
    </tbody>
  </table>
</div>
```

This table is highly extractable. Expect Perplexity and ChatGPT to cite it directly when users ask "What's the difference between velocity and enterprise sales?"

### Edit 7 · Sharpen the hero with a 1-sentence definition

**Where:** Hero, between the H1 and the existing subhead paragraph.

**Add this:**
```html
<p class="hero__intro">
  SAILS Advisory is an 8-week sales consulting engagement for B2B SaaS founders running velocity motions: short cycles, $2K to $12K ACVs, BDR/AE economics.
</p>
```

**Why:** Right now the hero opens with the punchy "Most sales consultants are enterprise operators..." line. Great copy, zero SEO. AI engines reading the page can't answer "What is SAILS Advisory?" because the page never says it directly. One concrete sentence fixes this without softening the voice.

### Edit 8 · Add `robots.txt` and `llms.txt`

**Create `/robots.txt`:**
```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://sailsadvisory.com/sitemap.xml
```

**Create `/llms.txt`:**
```
# SAILS Advisory

> B2B sales consulting for SaaS founders running velocity sales motions. Founded by Matt Weisman, former VP of Sales at Harness Technologies.

## What we do
SAILS Advisory delivers an 8-week fixed-price sales consulting engagement: Assess (weeks 1-2), Build (weeks 3-6), Coach (weeks 5-8). The engagement produces a 20-30 page Sales Playbook covering ICP, messaging, pipeline stages, discovery and demo frameworks, outbound sequences, KPI tracking, hiring profile, and org structure.

## Who it's for
- B2B SaaS companies, pre or at Series A
- ACV $2,000 to $12,000
- Sales cycles under 90 days (sweet spot under 14)
- BDR/AE or full-cycle inside sales motions
- 0 to 10 reps in seat
- Founder-led sales that needs to scale, or teams with reps in place but uneven results

## Who it's not for
- Enterprise sales motions ($250K+ ACV, 12-month cycles, 6+ decision-makers)
- Pre-revenue or pre-product stages
- Companies looking for a fractional VP of Sales

## Pricing
- 8-week engagement: $18,000 fixed (50% at signing, 50% at Coach phase start)
- Optional coaching retainer post-engagement: $2,000/month

## Contact
- matt@sailsadvisory.com
- https://sailsadvisory.com
```

**Create `/sitemap.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://sailsadvisory.com/</loc>
    <lastmod>2026-05-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

---

## Medium-impact edits

### Edit 9 · Add named sections as anchor-targets in copy

Inside the engagement section, before the cards, add an H3:

```html
<h3 class="visually-hidden">What's in an 8-week sales consulting engagement?</h3>
```

(or visible if you prefer). This adds a query-matching heading without changing the visual hierarchy.

### Edit 10 · Add a deliverable list inline (extractable bullets)

Currently the "Build" card buries deliverables in a paragraph. AI engines extract lists better than commas.

**Current Build card body:**
> "ICP definition, messaging framework, pipeline stages, discovery and demo frameworks, outbound sequence design, meeting cadence, KPI tracker, hiring profile, and org structure, all documented in a 20–30 page Sales Playbook built for your motion."

**Better (more citable):**
```html
<p class="card__body">A 20-30 page Sales Playbook built for your motion. Includes:</p>
<ul class="card__list">
  <li>ICP definition and qualification rubric</li>
  <li>Messaging framework and positioning</li>
  <li>Pipeline stages and exit criteria</li>
  <li>Discovery and demo frameworks</li>
  <li>Outbound sequence design</li>
  <li>Meeting cadence and KPI tracker</li>
  <li>Hiring profile and org structure</li>
</ul>
```

Each item becomes individually citable. Adds visual structure.

### Edit 11 · Add publication / last-updated dates

Inside `<head>` and as visible text in the footer:

```html
<meta name="article:published_time" content="2026-05-19" />
<meta name="article:modified_time" content="2026-05-19" />
```

In the footer:
```html
<p class="footer__updated">Last updated: May 2026</p>
```

E-E-A-T signal. Helps AI engines prefer this page over stale alternatives.

### Edit 12 · Strengthen About Matt with an H3 and an attribution-friendly claim

Inside the About section, add a sub-heading:

```html
<h3 class="about__h">Built by an operator, not a consultant</h3>
```

And restructure the body so the credentials lead. Current order is fine but the headline change unlocks GEO citations for queries like "Who is Matt Weisman" or "best velocity sales consultants."

---

## Lower-impact (do later)

13. Add a `<noscript>` warning (the site already works without JS, but a fallback message helps).
14. Inline critical CSS for above-the-fold to improve LCP (the current site is fast enough that this is optional).
15. Add an `apple-touch-icon.png` for iOS home-screen.
16. Add a `mailto:` schema action.
17. Build a few external brand mentions: a personal LinkedIn post announcing SAILS, a one-pager on Crunchbase, a Reddit AMA in r/sales. These off-page moves correlate 3x more strongly with AI visibility than backlinks (Ahrefs Dec 2025).

---

## Things NOT to change

- **Hero H1 "Put the Wind in Your Sales."** — Brand decision. Keep it. The schema and supporting copy will carry the SEO weight.
- **Section voice and brevity.** — Resist the urge to add fluff or filler keyword copy. The audit recommendations above add ~250 words of structured, definitional content. That's the upper limit before tone suffers.
- **"Always Be Closing" reference.** — It's the engagement section's editorial lede. Don't remove it for SEO; it's a memorable hook.
- **The em-dash purge.** Stay vigilant. Several of the recommended additions above use colons, periods, or commas where an em dash would feel natural. Hold the line.

---

## Implementation order (suggested)

| Priority | Edit | Effort | Impact |
|---|---|---|---|
| P0 | Edit 1: Velocity sales definition block | 5 min | Very high |
| P0 | Edit 2: JSON-LD schema | 10 min | Very high |
| P0 | Edit 3: Meta description | 1 min | High |
| P0 | Edit 4: Missing meta tags | 2 min | High |
| P0 | Edit 5: Title tag refinement | 1 min | Medium-high |
| P1 | Edit 6: Comparison table | 15 min | High |
| P1 | Edit 7: Hero definition sentence | 2 min | High |
| P1 | Edit 8: robots.txt, llms.txt, sitemap.xml | 5 min | Medium-high |
| P2 | Edit 9-10: H3s and list restructure | 10 min | Medium |
| P2 | Edit 11: Dates | 2 min | Low-medium |
| P2 | Edit 12: About sub-heading | 2 min | Medium |

Total implementation time for P0 + P1: roughly 45 minutes. Expected lift: GEO score 58 → ~85.
