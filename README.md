# SAILS Advisory · sailsadvisory.com

Single-page marketing site for SAILS Advisory. Pure HTML/CSS/JS, no build step.

## Local preview

Any static server works. Easiest options:

```bash
# Python
python3 -m http.server 8000

# Or Node
npx serve .
```

Open `http://localhost:8000`.

## Deploy to Netlify

**Option 1 · Drag and drop**
1. Go to https://app.netlify.com/drop
2. Drag the entire `sails-advisory` folder onto the page.
3. Set the custom domain to `sailsadvisory.com` in Site settings → Domain management.

**Option 2 · Git**
1. Push this folder to a GitHub repo.
2. In Netlify, **Add new site → Import an existing project** → connect the repo.
3. No build command needed. Publish directory: `.`

## Netlify Forms

The contact form uses Netlify's built-in form handling, no backend required. Submissions appear under **Forms** in the Netlify dashboard. To get email notifications, add your address under **Forms → Form notifications**.

## To-do for Matt before launch

One file drop. Everything else is wired:

1. **Drop the sell sheet** at `assets/sails-sell-sheet.pdf`. The `Download the Sell Sheet` button already points there.

(Logo PNG is in place. Calendly link `https://calendar.app.google/x2MYasUSFXEeow459` is wired into all four `Book a Call` / `Book a Discovery Call` buttons.)

## File map

```
/
├── index.html             ← single-page main site
├── style.css              ← all styles (main site + blog)
├── script.js              ← nav toggle, scroll reveal, form AJAX
├── netlify.toml           ← deploy config + security headers
├── favicon.svg            ← navy/blue sailboat
├── robots.txt             ← AI crawler allowlist
├── llms.txt               ← structured site summary for AI engines
├── sitemap.xml            ← includes blog URLs
├── blog/
│   ├── index.html                              ← blog listing page
│   ├── why-two-reps-hit-quota.html             ← Sales Operations
│   ├── meddic-velocity-sales.html              ← Frameworks
│   ├── when-to-stop-selling-as-founder.html    ← Founder-Led Sales
│   └── first-ae-hire-velocity-saas.html        ← Hiring
├── assets/
│   ├── sails-logo.png         (full lockup with tagline)
│   ├── sails-mark.svg         (clean wordmark, used in hero)
│   ├── sails-sell-sheet.pdf   (Matt drops in)
│   ├── hero-sail.png          (cinematic 3D hero background)
│   ├── invest-bg.png          (cinematic 3D Investment background)
│   ├── icon-assess.svg        (Assess card icon)
│   ├── icon-build.svg         (Build card icon)
│   ├── icon-coach.svg         (Coach card icon)
│   ├── illo-problem.svg       (Problem section illustration)
│   └── illo-invest.svg        (backup; no longer used in main page)
└── README.md
```

## Adding new blog posts

To add a post, copy one of the existing post HTML files in `blog/` as a template, then:
1. Update the `<title>`, meta description, canonical, OG/Twitter tags
2. Update the `BlogPosting` and `BreadcrumbList` JSON-LD blocks (headline, description, datePublished, dateModified, slug, wordCount, articleSection, keywords)
3. Replace the article body and post header content
4. Add a card to `blog/index.html` post grid AND to the index page's `Blog` JSON-LD `blogPost` array
5. Add a `<url>` entry to `sitemap.xml`
6. Add a bullet to `llms.txt` under `## Blog`
