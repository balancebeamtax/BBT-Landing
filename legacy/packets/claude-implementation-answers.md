# Claude Implementation Answers: Extension Cleanup Campaign

This document answers the implementation questions raised before broader execution of the Balance Beam Bookkeeping and Tax Extension Cleanup campaign.

## Short version

The campaign assets exist in `balancebeamtax/BBT-Landing`, but that repo is currently a content/static asset repository, not a confirmed production website application. The production conversion URL currently returns 404, so the highest-priority blocker is making `/extension-cleanup-review` live with a working form and scheduling path.

## BBT-Landing repo access

Repository:

`https://github.com/balancebeamtax/BBT-Landing`

GitHub owner/repo:

`balancebeamtax/BBT-Landing`

Visibility:

`PUBLIC`

Default branch:

`main`

Current known latest commit:

`ba49f1f Add Claude revenue launch packet for extension cleanup`

Current local branch state when checked:

`main...origin/main`

Important note:

The remote in this environment uses a Perplexity git proxy:

`https://git-agent-proxy.perplexity.ai/balancebeamtax/BBT-Landing.git`

On Claude's machine, use the normal GitHub URL unless the same proxy environment is available.

## Tech stack

No deployable app stack was detected in `BBT-Landing`.

No `package.json`, `next.config`, `astro.config`, `vite.config`, `netlify.toml`, `vercel.json`, Hugo config, Jekyll config, or similar site framework config was found.

Treat `BBT-Landing` as:

- Content repository
- Campaign asset repository
- Markdown and XML source repository
- Social image asset repository
- Claude/Notion prompt repository

Do not assume that pushing to `BBT-Landing` deploys the live website.

## Deployment workflow

Deployment workflow is not confirmed.

Vercel is connected in the Perplexity environment, but `BBT-Landing` does not currently include Vercel project configuration or a detected app framework.

Before “make live,” confirm one of these:

1. The actual production repo for `balancebeamtax.com`.
2. The CMS or website builder used for `balancebeamtax.com`.
3. Whether the Balance Beam site is deployed through Vercel, another host, or manually.
4. Whether `BBT-Landing` should become a static site repo or remain a source asset repo.

Do not treat `BBT-Landing` as the production deployment pipeline until that is confirmed.

## Landing page status

Production URL checked:

`https://balancebeamtax.com/extension-cleanup-review`

Status:

`404 Not Found`

Conclusion:

The live conversion page does not currently render at the production URL. This is the top revenue blocker.

Highest-priority implementation dependency:

Build and publish `/extension-cleanup-review` on the production `balancebeamtax.com` site before sending social or paid traffic.

Existing source assets for the landing page in `BBT-Landing`:

- `landing-pages/extension-cleanup-review.md`
- `landing-pages/extension-cleanup-review.xml`

Existing improved HTML from the Perplexity workspace, if needed:

- `/home/user/workspace/extension-cleanup-review-ux-improved.html`

That HTML has been tested for mobile responsiveness and includes conversion tracking event hooks, but it is not confirmed as deployed to `balancebeamtax.com`.

## Five article markdown files

The five article files are present in the repo.

Paths:

- `blog/extension-cleanup-review/quickbooks-cleanup-before-tax-filing.md`
- `blog/extension-cleanup-review/tax-ready-bookkeeping-before-filing.md`
- `blog/extension-cleanup-review/catch-up-bookkeeping-extended-tax-deadline.md`
- `blog/extension-cleanup-review/filed-tax-extension-books-not-ready.md`
- `blog/extension-cleanup-review/schedule-c-s-corp-partnership-extension-deadlines-2026.md`

Current approximate word counts:

- `quickbooks-cleanup-before-tax-filing.md`: 1,015 words
- `tax-ready-bookkeeping-before-filing.md`: 929 words
- `catch-up-bookkeeping-extended-tax-deadline.md`: 879 words
- `filed-tax-extension-books-not-ready.md`: 875 words
- `schedule-c-s-corp-partnership-extension-deadlines-2026.md`: 909 words

Assessment:

These are not stubs. They are production-style drafts with frontmatter, internal CTAs, IRS citations, and article body content. However, they are closer to concise SEO support articles than 1,500 to 3,000-word long-form articles.

Recommendation:

They can be published as initial SEO/support articles after subject-matter review. If the goal is deeper CPA-firm-grade authority, expand each to roughly 1,500 to 2,000 words before go-live by adding examples, entity-specific nuances, QuickBooks cleanup detail, and FAQs.

Accuracy notes:

The articles cite IRS sources for:

- Extension is generally more time to file, not more time to pay.
- Individual extension deadline generally October 15.
- Calendar-year partnerships and S corporations with timely extensions listed for September 15, 2026.

Authoritative source URLs used:

- `https://www.irs.gov/filing/get-an-extension-to-file-your-tax-return`
- `https://www.irs.gov/businesses/small-businesses-self-employed/third-quarter-tax-calendar`

Do not publish final tax-facing content without David's subject-matter review.

## Social image assets

The 15 social image files are present in the repo.

Folder:

`public/images/extension-cleanup/`

Formats:

- Open Graph/link preview images: 1200 x 630
- Feed images: 1080 x 1350
- Story images: 1440 x 2560

Image file count:

`15`

Files:

- `quickbooks-cleanup-before-tax-filing-og.png`
- `quickbooks-cleanup-before-tax-filing-feed.png`
- `quickbooks-cleanup-before-tax-filing-story.png`
- `tax-ready-bookkeeping-before-filing-og.png`
- `tax-ready-bookkeeping-before-filing-feed.png`
- `tax-ready-bookkeeping-before-filing-story.png`
- `catch-up-bookkeeping-extended-tax-deadline-og.png`
- `catch-up-bookkeeping-extended-tax-deadline-feed.png`
- `catch-up-bookkeeping-extended-tax-deadline-story.png`
- `filed-tax-extension-books-not-ready-og.png`
- `filed-tax-extension-books-not-ready-feed.png`
- `filed-tax-extension-books-not-ready-story.png`
- `schedule-c-s-corp-partnership-extension-deadlines-2026-og.png`
- `schedule-c-s-corp-partnership-extension-deadlines-2026-feed.png`
- `schedule-c-s-corp-partnership-extension-deadlines-2026-story.png`

Assessment:

These are designed, uploaded, and committed. They are clean, text-led social graphics matching the Balance Beam extension cleanup campaign style. They are not photography-based Canva/Figma assets, but they are usable for OG previews, feed posts, Stories, and initial ad tests.

Recommendation:

Use these for the first campaign wave. If paid ads gain traction, create polished Figma/Canva variants for the winning angles.

## Analytics setup

Analytics is not confirmed as live on `balancebeamtax.com`.

In the attached/generated HTML reviewed earlier, GTM and GA4 were present only as commented placeholders in one file. The improved landing page HTML includes JavaScript event hooks that push to `dataLayer` and call `gtag` if available, but a production GA4/GTM container has not been confirmed.

Required before serious launch:

- Confirm GA4 property.
- Confirm GTM container or direct `gtag` setup.
- Add base tracking to production pages.
- Configure these events:
  - `extension_cleanup_cta_click`
  - `extension_cleanup_form_start`
  - `extension_cleanup_form_complete`
  - `extension_cleanup_schedule_intent`
  - `extension_cleanup_appointment_scheduled`
  - `blog_to_landing_click`
  - `social_to_landing_click`
- Confirm scheduler captures source/UTM parameters if possible.

Recommendation:

Do not block publishing basic pages on perfect analytics, but do not spend on paid social until form start, form completion, and scheduled appointment tracking are working.

## Voice line: “preparer is waiting on cleaner books”

This line is acceptable within the Balance Beam voice if used calmly and factually.

Approved interpretation:

It describes a real operational situation: a return cannot be prepared from unreliable books.

Use:

`If your preparer is waiting on cleaner books, start with a cleanup review.`

Avoid:

- “Your preparer is running out of time.”
- “The IRS is waiting.”
- “You are in trouble if you do not act now.”
- “Do not risk penalties by waiting.”

The approved line is not aggressive urgency. It is a practical statement of workflow.

## Notion parent location

Default recommendation:

Create the page as a standalone Notion workspace page titled:

`Extension Cleanup Revenue Campaign`

Reason:

No parent page was specified, and standalone creation avoids misfiling. David can move it later.

If a Balance Beam Tax marketing/team hub exists and is obvious in Notion, it may be nested there. Otherwise, create it standalone and provide the URL.

## Implementation priority order

Use this order to generate revenue fastest:

1. Confirm production repo/CMS for `balancebeamtax.com`.
2. Publish `/extension-cleanup-review` with working short intake and scheduler path.
3. Confirm form submission and same-day lead notification.
4. Add core tracking events.
5. Publish `/blog/extension-cleanup` hub page.
6. Publish the five supporting articles.
7. Connect OG images to all blog pages.
8. Run Facebook Sharing Debugger on all URLs.
9. Launch organic social posts.
10. Launch small paid tests only after conversion tracking works.

## What Claude should ask David if still blocked

Ask only these questions if not discoverable:

1. What repo or CMS powers `balancebeamtax.com` production?
2. Is Vercel the production host for `balancebeamtax.com`?
3. What scheduling tool should `/extension-cleanup-review` redirect to after form submission?
4. What GA4/GTM IDs should be used?
5. Should the Notion page be standalone or nested under a specific Balance Beam workspace page?

## Bottom line

Claude can use `BBT-Landing` as the campaign source-of-truth repo, but cannot assume it deploys production. The immediate blocker is that `https://balancebeamtax.com/extension-cleanup-review` currently returns 404. Get the conversion page live first, then publish the hub/articles and run social traffic into the landing page.
