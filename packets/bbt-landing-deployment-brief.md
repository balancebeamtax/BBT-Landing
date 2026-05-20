# BBT-Landing Deployment Brief — `/extension-cleanup-review`

**Audience:** Owner / implementer responsible for putting `https://balancebeamtax.com/extension-cleanup-review` live.
**Date prepared:** 2026-05-20
**Source repo audited:** `balancebeamtax/BBT-Landing` (this repository)
**Deadlines this page must beat:**
- **2026-09-15** — Form 1065 (partnership) and Form 1120-S (S-corp) extended federal filing deadline.
- **2026-10-15** — Form 1040 / Schedule C extended federal filing deadline.
(Source: `landing-pages/extension-cleanup-review.md` lines 96–112.)

---

## 1. TL;DR

`BBT-Landing` is a **content-only Git repository**. It contains finished landing-page copy, blog articles, social graphics, and campaign packets — but **no application code, no build system, and no deployment pipeline**. Pushing to `main` here does **not** publish anything to `balancebeamtax.com`.

To make `/extension-cleanup-review` live before the Sept 15 / Oct 15 deadlines, the copy in this repo has to be carried into whatever actually serves `balancebeamtax.com` (CMS, site builder, or a new static deployment). Production host for the live site is **not yet confirmed** — that confirmation is the single biggest blocker.

Fastest verified path: a **static `index.html` page** generated from `landing-pages/extension-cleanup-review.xml`, deployed via **Vercel** (already connected in the Perplexity environment per `packets/claude-implementation-answers.md` line 63), with the form pointing at a hosted form provider (Tally / Formspree / HubSpot) until the production CMS path is confirmed.

---

## 2. Current repository setup (evidence-based)

Top-level layout (from `ls -la` of repo root):

```
README.md
blog/
  extension-cleanup/                    # hub page + distribution playbook (markdown)
  extension-cleanup-review/             # 5 SEO support articles (markdown)
landing-pages/
  extension-cleanup-review.md           # production page copy
  extension-cleanup-review.xml          # structured source (Relume-ready, design tokens included)
packets/
  claude-extension-cleanup-revenue-launch-packet.md
  claude-implementation-answers.md
prompts/
  claude-notion-extension-cleanup-content-ops.md
public/
  images/extension-cleanup/             # 15 social graphics (og/feed/story × 5 articles)
scripts/
  generate-extension-cleanup-social-graphics.py
```

No `package.json`, no lockfile, no framework config, no `.github/` directory, no CI workflows, no `Dockerfile`, no `vercel.json`, no `netlify.toml`, no `_config.yml`. Confirmed by:

```
find . -maxdepth 3 -type f \( -name "*.json" -o -name "*.toml" -o -name "*.yml" \
   -o -name "*.yaml" -o -name "Dockerfile*" -o -name "vercel.json" \
   -o -name "netlify.toml" -o -name "_config.yml" \)
# (no results)
ls -la .github
# (does not exist)
```

The README itself describes the repo as *"Landing page copy and funnel assets"* and notes the XML is *"Designed to be consumed by tools like Relume to generate the page"* (`README.md` lines 3 and 8). It treats this repo as a **source-of-truth for content**, not a deployable app.

---

## 3. Detected tech stack (or lack thereof)

| Layer | Detected | Evidence |
|---|---|---|
| Frontend framework | **None** | No `package.json`, no React/Next/Astro/Gatsby/Vite/Svelte config |
| Static-site generator | **None** | No Jekyll `_config.yml`, no Hugo config, no Eleventy config |
| CSS framework | **None compiled** — only design tokens declared in `extension-cleanup-review.xml` (`<designSystem>` block, lines 27–73) |
| Backend | **None** | No server code, no API directory |
| Build tooling | **None** | No build/lint/test scripts |
| Content format | Markdown + custom XML | `landing-pages/extension-cleanup-review.{md,xml}` |
| Asset pipeline | Python script for social graphics | `scripts/generate-extension-cleanup-social-graphics.py` (one-shot, not a build step) |
| CMS integration | **None in code** | XML is *Relume-ready*, but no Relume sync is wired up |

Effective stack: **plain Git + Markdown/XML content + static PNG assets.**

---

## 4. Build configuration

**There is none.** No build commands exist in this repo. The only executable is `scripts/generate-extension-cleanup-social-graphics.py`, which produces images that are already committed to `public/images/extension-cleanup/`. It does not produce a deployable site.

---

## 5. Deployment pipeline (or lack thereof)

**No deployment pipeline is present in this repository.** Specifically:

- No `.github/workflows/` directory.
- No Vercel / Netlify / Cloudflare Pages config file checked in.
- No deploy hooks documented in `README.md`.
- No `CNAME` or `vercel.json` indicating `balancebeamtax.com` is bound to this repo.

`packets/claude-implementation-answers.md` confirms this directly:

> *Line 45:* "No deployable app stack was detected in `BBT-Landing`."
> *Line 57:* "Do not assume that pushing to `BBT-Landing` deploys the live website."
> *Line 61:* "Deployment workflow is not confirmed."
> *Line 63:* "Vercel is connected in the Perplexity environment, but `BBT-Landing` does not currently include Vercel project configuration or a detected app framework."
> *Line 72:* "Do not treat `BBT-Landing` as the production deployment pipeline until that is confirmed."

**Net:** until proven otherwise, `balancebeamtax.com` is served from a system that is **not this repo**.

---

## 6. Current campaign assets present

All of the following are already complete and committed:

- **Landing page copy** — `landing-pages/extension-cleanup-review.md` (full hero, problem, deadlines, benefits, process, objections, mid-CTA, intake form spec with all fields, final CTA, FAQ, disclaimers). ~16 KB of finished, plain-English copy.
- **Structured source for Relume / programmatic generation** — `landing-pages/extension-cleanup-review.xml` (~31 KB) including a complete `<designSystem>` block with typography (Source Serif 4 / Source Sans 3), color tokens (teal `#0F5F5C` for primary CTA, copper `#B87333` reserved for deadline accents, plus background/surface/text/border tokens), and tracking event hooks.
- **Hub page** — `blog/extension-cleanup/index.md` plus a social distribution playbook.
- **5 SEO support articles** — `blog/extension-cleanup-review/` (filed-tax-extension, quickbooks-cleanup, catch-up-bookkeeping, schedule-c/s-corp/partnership deadlines, tax-ready bookkeeping).
- **15 social graphics** — `public/images/extension-cleanup/` (og + feed + story for each of the 5 articles).
- **Launch packet + implementation answers** — `packets/`.
- **Notion content-ops prompt** — `prompts/`.

What is **not** present: the actual rendered HTML/CSS for the live page, a working intake form integration, analytics wiring, the production hosting account, and any reference to where `balancebeamtax.com` is served from.

---

## 7. Blockers (ranked by impact)

1. **Production host for `balancebeamtax.com` is unknown.** Until that is confirmed (CMS? Webflow? WordPress? Squarespace? a different Git repo?), no one can put the page on the real domain. This is the **#1 blocker** and the only one that cannot be solved by writing code in this repo. See `packets/claude-implementation-answers.md` lines 67–72 and 269–270.
2. **Intake form has no backend.** The copy specifies every field, but there is no submit endpoint, no email destination, no CRM/HubSpot integration committed anywhere in this repo. A form provider has to be chosen and wired before the page can convert.
3. **No analytics / conversion tracking.** `packets/claude-implementation-answers.md` line 192: *"Analytics is not confirmed as live on balancebeamtax.com."* Without GA4 / a pixel, paid traffic and social traffic cannot be measured.
4. **No rendered page exists yet.** The XML is structured for Relume; no one has run Relume (or equivalent) to produce HTML. A first render — even hand-coded — is required before any host can serve it.
5. **DNS / domain control unknown.** Pointing `balancebeamtax.com/extension-cleanup-review` to a new host requires registrar access or DNS edit rights, which are not documented in this repo.

---

## 8. Fastest minimum viable build path (ship in 24–48 hours)

Goal: a working `https://balancebeamtax.com/extension-cleanup-review` that captures intakes, even if the rest of the site stays on its current host. This assumes the production host of the root domain is still unknown but the registrar/DNS is accessible.

**Step A — Render the page once, by hand.**
1. Open `landing-pages/extension-cleanup-review.md` (copy) and `landing-pages/extension-cleanup-review.xml` (design tokens) side by side.
2. Build a single static `index.html` + `styles.css` using the tokens in the `<designSystem>` block: Source Serif 4 (headlines, via Google Fonts), Source Sans 3 (body), background `#F7F5EF`, primary CTA `#0F5F5C` (hover `#0A4543`), deadline accent `#B87333`, deadline text `#8A4B1F` on warning background `#FFF4E6`, border `#D9D6CC`. Mobile-first; no JS framework needed.
3. Include the full `<head>`: title tag *"Extension Cleanup Review for Small Business Books | Balance Beam"*, meta description, canonical, Open Graph image (use one of the existing PNGs in `public/images/extension-cleanup/` if appropriate, otherwise generate one), and a `viewport` meta.
4. Drop in the GA4 snippet and any LinkedIn / Meta pixel that BBT actually owns.

**Step B — Wire the intake form to a hosted backend.**
- Easiest: **Tally** or **Formspree** (no code, free tier OK for launch). Embed via a single `<form action="https://formspree.io/f/XXXX" method="POST">` with the field names from `landing-pages/extension-cleanup-review.md` lines 296–407.
- Route submissions to the Balance Beam intake inbox + optionally a Slack/Notion webhook.
- Add the consent copy verbatim from line 405 of the MD.

**Step C — Deploy as a standalone static page (Vercel is already connected).**
1. Add a tiny `site/` (or root-level) directory with `index.html`, `styles.css`, and an `images/` symlink/copy from `public/images/extension-cleanup/`.
2. Add a minimal `vercel.json` (see Section 11) that rewrites `/extension-cleanup-review` to `index.html`.
3. `vercel link` → `vercel --prod`. This gives you a `*.vercel.app` URL immediately.

**Step D — Bind the path on the production domain.**
- **If `balancebeamtax.com` is on Vercel:** add this as a path/route on the existing project (no DNS change).
- **If it is on another host (Webflow/WordPress/etc.):** either (a) create the page there using the same copy/design tokens, OR (b) put a **path-level redirect / rewrite** at the host: `/extension-cleanup-review → https://<vercel-url>/`. Most hosts (WordPress via plugin, Webflow via 301, Cloudflare via Page Rule) support this.
- **If neither is feasible quickly:** point `extension.balancebeamtax.com` (a subdomain you control via DNS) at the Vercel deployment and use that in all campaign links. Update the copy/CTA buttons accordingly.

That is the MVP. It is honest, ugly-on-purpose-simple, and gets a capture form live before the Sept 15 deadline.

---

## 9. Hosting connection options (ranked)

| Option | Time to live | Pros | Cons | When to pick |
|---|---|---|---|---|
| **Vercel static deploy** (1 HTML file) | ~2–4 hrs | Already connected in env (`claude-implementation-answers.md` line 63); free; fast CDN; previews on push | Need to bridge to root domain via DNS or rewrite on existing host | **Recommended MVP.** Pick if production host is still being identified. |
| **Add the page to the existing CMS** (Webflow / WordPress / Squarespace / Wix) | 4–8 hrs once host is confirmed | Lives on `balancebeamtax.com` natively; SEO inherits site authority; no DNS work | Requires the actual CMS login + matching the design system inside that tool | **Recommended production.** Pick once host is confirmed. |
| **Netlify static deploy** | ~2–4 hrs | Same shape as Vercel; built-in forms (no Formspree needed) | Not currently connected in env | Pick if Vercel access turns out to be unavailable. |
| **Cloudflare Pages** | ~3–5 hrs | Free; integrates with Cloudflare DNS if domain is there | More setup if domain isn't already on Cloudflare | Pick if `balancebeamtax.com` DNS is on Cloudflare. |
| **GitHub Pages from this repo** | ~2 hrs | Closest to "just push markdown" | Requires Jekyll or hand-written HTML; custom domain needs CNAME + DNS; not ideal for a conversion page | Last resort. |
| **Carrd / Framer Sites / Notion sites** | ~3 hrs | Fast | Design system fidelity is harder; ties brand to a builder | Skip — design system is too specific. |

---

## 10. Recommended production path for `balancebeamtax.com`

Two-phase plan:

**Phase 1 — Ship MVP via Vercel (this week, by 2026-05-27).**
- Hand-render `index.html` from the XML/MD.
- Deploy to Vercel under a temporary URL (`bbt-extension-cleanup.vercel.app`) or under a confirmed subdomain (`extension.balancebeamtax.com`).
- Form posts to Formspree or Tally; submissions land in the BBT inbox + Slack.
- GA4 + LinkedIn pixel installed.
- Update `packets/claude-extension-cleanup-revenue-launch-packet.md` campaign links to point at the live URL.

**Phase 2 — Move into the production CMS once it is confirmed (target: 2026-06-15, well before Sept 15).**
- Re-build the page inside the actual production CMS (Webflow/WordPress/etc.) using the same design tokens (`extension-cleanup-review.xml` `<designSystem>` block).
- Point `/extension-cleanup-review` to the in-CMS page; set a 301 from the Vercel/subdomain URL to the canonical path.
- Move form submissions into the CRM the rest of BBT uses.
- Wire the hub (`/blog/extension-cleanup/`) and the 5 support articles into the CMS using the markdown in `blog/`.

Phase 1 protects the deadline. Phase 2 makes it permanent.

---

## 11. Exact commands and files needed

**A. Create the static site scaffolding inside this repo** (suggested path: `site/`):

```
site/
  index.html              # rendered from landing-pages/extension-cleanup-review.{md,xml}
  styles.css              # uses tokens from the XML <designSystem> block
  thanks.html             # form post-submit page
  images/                 # copy or symlink from ../public/images/extension-cleanup/
vercel.json               # repo root
```

**B. Minimal `vercel.json`** (place at repo root):

```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    { "source": "/extension-cleanup-review", "destination": "/site/index.html" },
    { "source": "/extension-cleanup-review/", "destination": "/site/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

**C. Deploy commands** (one-time, from repo root):

```bash
npm i -g vercel              # if not already installed
vercel login
vercel link                  # link to (or create) a Vercel project
vercel --prod                # deploy to production
```

**D. Bind the domain** (in the Vercel project dashboard or via CLI):

```bash
vercel domains add balancebeamtax.com           # only if BBT controls DNS here
# OR
vercel domains add extension.balancebeamtax.com # subdomain fallback
```

If `balancebeamtax.com` lives elsewhere, instead of `vercel domains add`, add a path rewrite on the existing host pointing `/extension-cleanup-review` at the Vercel deployment.

**E. Form provider** (pick one):

- **Formspree:** sign up → create form → copy endpoint into `<form action="https://formspree.io/f/XXXXXXXX" method="POST">`.
- **Tally:** create form matching `landing-pages/extension-cleanup-review.md` field spec → embed via `<iframe>` or popup script.

**F. Analytics**: paste the GA4 snippet into `<head>` of `site/index.html`. Add the LinkedIn Insight Tag and Meta Pixel if/when BBT confirms which accounts they own.

---

## 12. Launch checklist

**Pre-launch (must be true before sending any traffic):**

- [ ] Production host of `balancebeamtax.com` confirmed in writing (which CMS / which repo / who has access).
- [ ] Decision made: Phase 1 (Vercel/subdomain) OR straight to production CMS.
- [ ] `site/index.html` rendered from `landing-pages/extension-cleanup-review.md` and reviewed against the MD copy line-by-line.
- [ ] Design system tokens from `extension-cleanup-review.xml` `<designSystem>` applied (fonts loaded, color tokens correct, copper only used for deadlines).
- [ ] Intake form fields match `landing-pages/extension-cleanup-review.md` lines 296–407 exactly, including consent copy (line 405).
- [ ] Form submit successfully delivers to the BBT inbox (test with a real submission).
- [ ] `thanks.html` (or equivalent confirmation state) loads after submit.
- [ ] Page is mobile-tested on iOS Safari and Android Chrome (this is a small-business owner audience).
- [ ] `<head>` includes title tag, meta description, canonical pointing at the production URL, Open Graph image, viewport.
- [ ] GA4 is firing on page-view and on form-submit (verified in DebugView).
- [ ] Open Graph image renders correctly in the LinkedIn Post Inspector and Facebook Sharing Debugger.
- [ ] Disclaimer copy from `landing-pages/extension-cleanup-review.md` line 469 is present at the bottom of the page.

**At launch:**

- [ ] Page lives at the canonical URL the campaign packet uses (`https://balancebeamtax.com/extension-cleanup-review`) OR all campaign links in `packets/claude-extension-cleanup-revenue-launch-packet.md` are updated to the actual live URL.
- [ ] 301 redirect from any temporary URL to the canonical URL.
- [ ] Hub page (`/extension-cleanup`) and the 5 support articles published OR scheduled (markdown sources in `blog/`).
- [ ] Social graphics in `public/images/extension-cleanup/` uploaded to the post scheduler tied to the right slugs.

**Post-launch (within 48 hours):**

- [ ] First real intake submission received and routed correctly.
- [ ] At least one conversion-tracked event in GA4.
- [ ] Page indexed (submit to Google Search Console; request indexing).
- [ ] Campaign traffic (organic social, then paid) turned on per `packets/claude-extension-cleanup-revenue-launch-packet.md`.

**Before 2026-09-15 (partnership / S-corp deadline):**

- [ ] Phase 2 (production CMS) completed OR Phase 1 confirmed acceptable to leave in place through Oct 15.
- [ ] Intake → CRM pipeline working end-to-end.
- [ ] Capacity plan in place for the surge of intakes expected in late August.

---

## 13. Open questions for the owner

Carried over from `packets/claude-implementation-answers.md` lines 254 and 269–270 — these still need answers:

1. What repo or CMS powers `balancebeamtax.com` production?
2. Is Vercel the production host for `balancebeamtax.com`?
3. Who has DNS / registrar access for `balancebeamtax.com`?
4. Which CRM / inbox should intake submissions land in?
5. Which analytics + ad accounts (GA4, LinkedIn, Meta) does BBT actually own and want wired up?

Until questions 1–3 are answered, treat Section 8 (MVP via Vercel) as the working plan.
