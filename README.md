# SAILS Advisory · sailsadvisory.com

Marketing site for SAILS Advisory. Pure static HTML/CSS/JS, no build step.

**Full project handoff, brand rules, and conventions live in [CLAUDE.md](CLAUDE.md). Read it before changing anything.**

## Workflow

- **Source of truth:** this repo (`mwsails/sails-site`), branch `main`
- **Hosting:** Netlify, linked to this repo. Publish directory `.`, no build command
- **Deploy:** push to `main` → Netlify auto-deploys production in ~30 seconds
- **Review flow:** open a PR → Netlify builds a Deploy Preview URL on the PR → review → merge to ship
- Do NOT use Netlify drag-and-drop deploys anymore; they bypass `.gitignore` and would re-publish excluded internal files

## Local preview

Any static server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Quick facts

- Forms are Netlify Forms (9 registered). Lead notifications go to matt@sailsadvisory.com
- Analytics: GA4 `G-8PN2PNK63C` + Google Search Console (sitemap submitted)
- DNS is Netlify DNS and also carries the Google Workspace email records. Never delete MX/SPF/DKIM records
- Stylesheet is cache-busted (`style.css?v=N`). Bump the version on every page when editing CSS

See [CLAUDE.md](CLAUDE.md) for the new-blog-post checklist, new-resource checklist, PDF regeneration commands, and the outstanding TODO list.
