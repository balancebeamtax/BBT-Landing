# Claude Packet: Balance Beam Extension Cleanup Revenue Launch

Use this packet to create the Notion operating page, finalize the Balance Beam content hub/blog implementation, connect the social media assets, and push the campaign live.

## Primary objective

Balance Beam Bookkeeping and Tax needs leads and consultation bookings as soon as possible to generate revenue and fund the business.

The campaign should not be built as a passive blog project. The blog content supports SEO, trust, retargeting, and social authority. The primary conversion path should move high-intent visitors to the landing page:

`/extension-cleanup-review`

Primary CTA:

`Request an Extension Cleanup Review`

Core message:

`An extension gives you more time to file. It does not clean up the books.`

## Brand rules

Write for Balance Beam Bookkeeping and Tax in a calm, professional, plain-English tone.

Use:

- Clear bookkeeping and tax-preparation language.
- Specific terms like Schedule C, S corporation, partnership, QuickBooks cleanup, tax-ready books, reconciliation, and catch-up bookkeeping.
- A helpful tone that explains what to do next.

Avoid:

- Fear-based IRS language.
- Refund promises.
- Tax “hacks,” “secrets,” “loopholes,” or aggressive urgency.
- Fake scarcity.
- Claims that sound like individualized tax advice.

Use this disclaimer where needed:

`This is general information, not advice for your specific situation. If you want to talk through how this applies to your business, reach out.`

## Campaign architecture

### Main conversion page

URL:

`/extension-cleanup-review`

Purpose:

Convert high-intent visitors into scheduled consultations.

Traffic sources:

- Instagram Story links
- Instagram Reel caption links
- Facebook image posts
- Facebook ads
- Retargeting ads
- Blog CTAs
- Blog hub CTAs
- Email CTAs
- LinkedIn CTAs

### Blog hub page

URL:

`/blog/extension-cleanup`

Attached working HTML reviewed:

`index-1.html`

Purpose:

Serve as the SEO/content hub that clusters the five supporting articles and sends high-intent readers to `/extension-cleanup-review`.

### Supporting blog articles

Use these five articles:

1. `/blog/quickbooks-cleanup-before-tax-filing`
2. `/blog/tax-ready-bookkeeping-before-filing`
3. `/blog/catch-up-bookkeeping-extended-tax-deadline`
4. `/blog/filed-tax-extension-books-not-ready`
5. `/blog/schedule-c-s-corp-partnership-extension-deadlines-2026`

Each article should:

- Link to `/blog/extension-cleanup`
- Link to `/extension-cleanup-review`
- Use its Open Graph image for Facebook/link previews
- Use feed/story image variants for organic and paid social
- Include UTM links for social posts and ads

## Blog hub page audit

The attached hub page is directionally strong and should be used as the base for the live `/blog/extension-cleanup` page.

### What is working

- H1 is clear: `Get your books tax-ready before the 2026 extended filing deadlines.`
- The page clusters all five articles.
- There are multiple CTAs to `/extension-cleanup-review`.
- The page has no horizontal overflow at 375px, 768px, or 1366px.
- The page includes a clear “Choose the article that matches your situation” section.
- It supports both September 15 and October 15 deadline paths.

### What must be improved before go-live

1. Add Open Graph metadata:
   - `og:title`
   - `og:description`
   - `og:image`
   - `og:image:width`
   - `og:image:height`
   - `og:url`
   - `twitter:card`

2. Add a stronger above-the-fold revenue CTA:
   - Keep the educational CTA.
   - Add urgency-aware copy above the first scroll:
     `If your preparer is waiting on cleaner books, start with a cleanup review.`

3. Add a social sharing section near the article cards:
   - Prompt readers to share the guide with another business owner working under an extension.
   - Keep the CTA secondary to the booking CTA.

4. Add a compact “Need help now?” sticky or inline CTA on mobile:
   - Text: `Need help before the deadline?`
   - Button: `Request Review`
   - URL: `/extension-cleanup-review`

5. Ensure every article card has two paths:
   - Read article
   - Request review if this is your situation

## Best-practice funnel recommendation

Use one main conversion funnel for immediate cash:

`Social post/ad → /extension-cleanup-review → short intake → schedule appointment`

Use blog content as supporting authority:

`SEO/blog/social education → article → /extension-cleanup-review`

Do not build five separate funnels yet. That adds delay and tracking complexity. Use one optimized conversion page and segment traffic with UTMs.

## When to send traffic to the landing page vs blog

### Send directly to `/extension-cleanup-review`

Use this for high-intent or urgent posts:

- “Filed an extension because your books were not ready?”
- “September 15 is coming for partnerships and S corporations.”
- “October 15 is coming for Schedule C filers.”
- “Your tax preparer needs cleaner books.”
- “QuickBooks is not ready for tax preparation.”

### Send to the blog article first

Use this for education-first posts:

- Checklist posts
- Explainer posts
- LinkedIn thought-leadership posts
- Facebook organic link posts where the article preview is the content
- Email newsletter links

### Retargeting flow

If someone visits a blog article or `/blog/extension-cleanup` but does not book:

Retarget them to `/extension-cleanup-review`, not back to another blog article.

## Assets already in repo

### Hub and playbook

- `blog/extension-cleanup/index.md`
- `blog/extension-cleanup/social-distribution-playbook.md`

### Blog articles

- `blog/extension-cleanup-review/quickbooks-cleanup-before-tax-filing.md`
- `blog/extension-cleanup-review/tax-ready-bookkeeping-before-filing.md`
- `blog/extension-cleanup-review/catch-up-bookkeeping-extended-tax-deadline.md`
- `blog/extension-cleanup-review/filed-tax-extension-books-not-ready.md`
- `blog/extension-cleanup-review/schedule-c-s-corp-partnership-extension-deadlines-2026.md`

### Social graphics

For each article there are three image formats:

- `og.png`: 1200 x 630 for Facebook/link previews
- `feed.png`: 1080 x 1350 for Instagram/Facebook feed posts
- `story.png`: 1440 x 2560 for Stories/Reels

Image paths:

- `/images/extension-cleanup/quickbooks-cleanup-before-tax-filing-og.png`
- `/images/extension-cleanup/quickbooks-cleanup-before-tax-filing-feed.png`
- `/images/extension-cleanup/quickbooks-cleanup-before-tax-filing-story.png`
- `/images/extension-cleanup/tax-ready-bookkeeping-before-filing-og.png`
- `/images/extension-cleanup/tax-ready-bookkeeping-before-filing-feed.png`
- `/images/extension-cleanup/tax-ready-bookkeeping-before-filing-story.png`
- `/images/extension-cleanup/catch-up-bookkeeping-extended-tax-deadline-og.png`
- `/images/extension-cleanup/catch-up-bookkeeping-extended-tax-deadline-feed.png`
- `/images/extension-cleanup/catch-up-bookkeeping-extended-tax-deadline-story.png`
- `/images/extension-cleanup/filed-tax-extension-books-not-ready-og.png`
- `/images/extension-cleanup/filed-tax-extension-books-not-ready-feed.png`
- `/images/extension-cleanup/filed-tax-extension-books-not-ready-story.png`
- `/images/extension-cleanup/schedule-c-s-corp-partnership-extension-deadlines-2026-og.png`
- `/images/extension-cleanup/schedule-c-s-corp-partnership-extension-deadlines-2026-feed.png`
- `/images/extension-cleanup/schedule-c-s-corp-partnership-extension-deadlines-2026-story.png`

## Open Graph metadata requirements

Every blog page should include:

```html
<meta property="og:title" content="[Article title]">
<meta property="og:description" content="[Article meta description]">
<meta property="og:type" content="article">
<meta property="og:url" content="https://balancebeamtax.com/blog/[slug]">
<meta property="og:image" content="https://balancebeamtax.com/images/extension-cleanup/[slug]-og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
```

Every page should include a canonical URL.

## UTM structure

Use this campaign name:

`extension_cleanup_2026`

Use these URL patterns:

### Facebook organic image post

`/extension-cleanup-review?utm_source=facebook&utm_medium=organic_social&utm_campaign=extension_cleanup_2026&utm_content=[content_angle]`

### Instagram organic story

`/extension-cleanup-review?utm_source=instagram&utm_medium=organic_social&utm_campaign=extension_cleanup_2026&utm_content=[content_angle]`

### Meta paid ad

`/extension-cleanup-review?utm_source=meta&utm_medium=paid_social&utm_campaign=extension_cleanup_2026&utm_content=[content_angle]`

### LinkedIn organic post

`/extension-cleanup-review?utm_source=linkedin&utm_medium=organic_social&utm_campaign=extension_cleanup_2026&utm_content=[content_angle]`

### Blog CTA

`/extension-cleanup-review?utm_source=blog&utm_medium=internal&utm_campaign=extension_cleanup_2026&utm_content=[article_slug]`

## Social media content library

Use the following posts as the first campaign wave.

### Direct-response Facebook image post

Image:

`/images/extension-cleanup/filed-tax-extension-books-not-ready-feed.png`

Caption:

Filed an extension because your books were not ready?

The filing deadline is still coming. The next step is not waiting until September or October. It is finding out what needs to be cleaned up before the return can be prepared.

Balance Beam helps small business owners review the bookkeeping issues that delay tax preparation.

Request an Extension Cleanup Review:

`/extension-cleanup-review?utm_source=facebook&utm_medium=organic_social&utm_campaign=extension_cleanup_2026&utm_content=books_not_ready`

### Facebook blog link post

Article:

`/blog/filed-tax-extension-books-not-ready`

Open Graph image:

`/images/extension-cleanup/filed-tax-extension-books-not-ready-og.png`

Caption:

An extension gives more time to file. It does not clean up the books.

If your tax return was extended because the bookkeeping was behind, this guide explains what to do next and how to identify what is blocking tax preparation.

Read the guide:

`/blog/filed-tax-extension-books-not-ready`

If you already know the books are blocking the return, request a cleanup review:

`/extension-cleanup-review?utm_source=facebook&utm_medium=organic_social&utm_campaign=extension_cleanup_2026&utm_content=blog_books_not_ready`

### Instagram feed post

Image:

`/images/extension-cleanup/filed-tax-extension-books-not-ready-feed.png`

Caption:

Filed an extension because the books were not ready?

The extension gave you more time to file. It did not reconcile accounts, clean up QuickBooks, or prepare reports for your tax return.

If your 2026 extended deadline is coming and the books are still not ready, start with a cleanup review.

CTA:

Tap the link in bio or use the Story link to request an Extension Cleanup Review.

Link:

`/extension-cleanup-review?utm_source=instagram&utm_medium=organic_social&utm_campaign=extension_cleanup_2026&utm_content=books_not_ready_feed`

### Instagram Story

Image:

`/images/extension-cleanup/filed-tax-extension-books-not-ready-story.png`

Story text overlay:

Slide 1:

`Filed an extension because the books were not ready?`

Slide 2:

`The extension gives more time to file. It does not clean up the books.`

Slide 3:

`Request an Extension Cleanup Review`

Link sticker:

`/extension-cleanup-review?utm_source=instagram&utm_medium=organic_social&utm_campaign=extension_cleanup_2026&utm_content=books_not_ready_story`

### Instagram Reel script

Video length:

20 to 30 seconds

Hook:

If you filed a tax extension because your books were not ready, this is your next step.

Script:

An extension gives you more time to file the tax return. It does not clean up the books.

If your QuickBooks file is unreconciled, transactions are unclear, or your preparer is waiting on better reports, the deadline is still coming.

Start with a cleanup review. Find out what needs to be fixed before the return can be prepared.

Caption:

Filed an extension because the books were not ready? Start with a cleanup review before the extended deadline gets too close.

CTA:

Request an Extension Cleanup Review through the link in bio.

Link:

`/extension-cleanup-review?utm_source=instagram&utm_medium=organic_social&utm_campaign=extension_cleanup_2026&utm_content=reel_books_not_ready`

### LinkedIn post

Post:

An extension solves the filing deadline. It does not solve the bookkeeping problem.

For many small business owners, the return is not delayed because the tax form is unusual. It is delayed because the books are not ready.

Common blockers:

- Accounts have not been reconciled.
- QuickBooks has too many uncategorized transactions.
- Owner draws, distributions, or reimbursements are unclear.
- The profit and loss report cannot be trusted yet.
- The preparer is waiting on cleaner reports.

If your business filed an extension because the books were not ready, use the time now to identify what needs cleanup before the return is prepared.

Balance Beam is offering an Extension Cleanup Review for business owners working toward the September 15 or October 15, 2026 extended deadlines.

CTA:

`/extension-cleanup-review?utm_source=linkedin&utm_medium=organic_social&utm_campaign=extension_cleanup_2026&utm_content=extension_cleanup_explainer`

### Facebook ad angle 1

Creative:

`/images/extension-cleanup/filed-tax-extension-books-not-ready-feed.png`

Primary text:

Filed an extension because your books were not ready? Balance Beam helps small business owners identify what needs cleanup before tax preparation can move forward.

Headline:

Books Still Not Ready?

Description:

Request an Extension Cleanup Review.

Destination:

`/extension-cleanup-review?utm_source=meta&utm_medium=paid_social&utm_campaign=extension_cleanup_2026&utm_content=books_not_ready`

### Facebook ad angle 2

Creative:

`/images/extension-cleanup/schedule-c-s-corp-partnership-extension-deadlines-2026-feed.png`

Primary text:

September 15 and October 15 are filing deadlines, not cleanup deadlines. If your books are not ready, start with a review before your preparer is waiting on final reports.

Headline:

Know Your 2026 Deadline

Description:

Schedule C, S Corp, and partnership owners.

Destination:

`/extension-cleanup-review?utm_source=meta&utm_medium=paid_social&utm_campaign=extension_cleanup_2026&utm_content=deadline_comparison`

### Facebook ad angle 3

Creative:

`/images/extension-cleanup/quickbooks-cleanup-before-tax-filing-feed.png`

Primary text:

QuickBooks reports are only useful if the file is reconciled and reviewed. If your return is waiting on cleaner books, request a cleanup review.

Headline:

QuickBooks Cleanup Before Filing

Description:

Find out what needs to be fixed.

Destination:

`/extension-cleanup-review?utm_source=meta&utm_medium=paid_social&utm_campaign=extension_cleanup_2026&utm_content=quickbooks_cleanup`

## Article-specific social mapping

| Article | Best organic social use | Best paid social use | Primary destination for paid |
|---|---|---|---|
| QuickBooks Cleanup Before Tax Filing | Checklist post | QuickBooks cleanup pain point | `/extension-cleanup-review` |
| Tax-Ready Bookkeeping Before Filing | Educational authority post | Retargeting trust angle | `/extension-cleanup-review` |
| Catch-Up Bookkeeping Before an Extended Tax Deadline | Process post | Behind-on-books urgency | `/extension-cleanup-review` |
| Filed a Tax Extension Because Books Were Not Ready | Direct-response post | Primary ad angle | `/extension-cleanup-review` |
| Schedule C vs S Corp vs Partnership Deadlines | Segmentation post | Deadline awareness angle | `/extension-cleanup-review` |

## Notion page structure to create

Create a Notion page titled:

`Extension Cleanup Revenue Campaign`

Sections:

1. Campaign overview
2. Primary revenue objective
3. Funnel architecture
4. Live URL map
5. Blog hub audit
6. SEO cluster map
7. Social media asset map
8. Social post library
9. Paid social test plan
10. Publishing calendar
11. Tracking and UTM plan
12. Go-live checklist
13. Daily execution checklist
14. Owner follow-up workflow

## Publishing calendar

Publish everything as soon as practical. The dates below are the operating sequence.

| Sequence | Asset | URL | Priority | Notes |
|---:|---|---|---|---|
| 1 | Landing page | `/extension-cleanup-review` | Highest | Must be live before social pushes. |
| 2 | Blog hub | `/blog/extension-cleanup` | High | Cluster navigation and authority page. |
| 3 | Books not ready article | `/blog/filed-tax-extension-books-not-ready` | High | Strongest pain match. |
| 4 | Deadline comparison article | `/blog/schedule-c-s-corp-partnership-extension-deadlines-2026` | High | Segments September 15 vs October 15. |
| 5 | QuickBooks cleanup article | `/blog/quickbooks-cleanup-before-tax-filing` | High | High-intent bookkeeping query. |
| 6 | Tax-ready bookkeeping article | `/blog/tax-ready-bookkeeping-before-filing` | Medium | Trust-building educational content. |
| 7 | Catch-up bookkeeping article | `/blog/catch-up-bookkeeping-extended-tax-deadline` | Medium | Good for mid-summer urgency. |

## Tracking requirements

Implement events:

- `extension_cleanup_cta_click`
- `extension_cleanup_form_start`
- `extension_cleanup_form_complete`
- `extension_cleanup_schedule_intent`
- `extension_cleanup_appointment_scheduled`
- `blog_to_landing_click`
- `social_to_landing_click`

Track these source dimensions:

- source
- medium
- campaign
- content
- landing page
- article slug
- appointment booked
- appointment completed
- engagement sold
- gross receipts generated

## Go-live checklist

Before launch:

- Confirm `/extension-cleanup-review` is live.
- Confirm short intake form submits correctly.
- Confirm post-submit path goes to scheduling.
- Confirm all five blog URLs are live.
- Confirm `/blog/extension-cleanup` is live.
- Confirm every article links to `/extension-cleanup-review`.
- Confirm every article links back to `/blog/extension-cleanup`.
- Confirm Open Graph images load publicly.
- Run Facebook Sharing Debugger on the hub and all five blog URLs.
- Confirm mobile layout at 375px, 414px, and 768px.
- Confirm UTM links preserve tracking parameters.
- Confirm GA4/GTM or analytics receives form-start and form-complete events.
- Confirm appointment scheduler records source if possible.

## Daily execution checklist for money now

Do this every business day during launch:

1. Post one direct-response social post.
2. Post one educational story or short LinkedIn post.
3. Check landing page form submissions.
4. Follow up with every lead the same day.
5. Track consultation bookings.
6. Track no-shows.
7. Track closed cleanup engagements.
8. Repost the strongest-performing angle.

## Claude task prompt

Copy and paste the following prompt into Claude.

---

You are helping Balance Beam Bookkeeping and Tax launch the Extension Cleanup Review revenue campaign.

Your job:

1. Create a Notion page titled `Extension Cleanup Revenue Campaign`.
2. Use the packet below as the source of truth.
3. Organize the Notion page into campaign overview, funnel architecture, URL map, content calendar, social media asset map, social post library, paid social test plan, tracking plan, and go-live checklist.
4. Update the `BBT-Landing` GitHub repo so the `/blog/extension-cleanup` hub page and five SEO articles are production-ready.
5. Ensure every article has Open Graph metadata and image paths.
6. Ensure every article links to `/extension-cleanup-review`.
7. Ensure every article links to `/blog/extension-cleanup`.
8. Ensure the hub page links to all five articles and to `/extension-cleanup-review`.
9. Make the website live or prepare the production PR/deployment according to the repo’s deployment workflow.
10. Do not put this in the Balance Beam portal GitHub account.

Important business objective:

The objective is to generate consultation bookings and revenue as soon as possible. Do not overbuild. Prioritize live pages, clear CTAs, working tracking, and same-day lead follow-up.

Use this campaign structure:

- Main conversion page: `/extension-cleanup-review`
- Blog hub: `/blog/extension-cleanup`
- Five supporting articles:
  - `/blog/quickbooks-cleanup-before-tax-filing`
  - `/blog/tax-ready-bookkeeping-before-filing`
  - `/blog/catch-up-bookkeeping-extended-tax-deadline`
  - `/blog/filed-tax-extension-books-not-ready`
  - `/blog/schedule-c-s-corp-partnership-extension-deadlines-2026`

Core message:

`An extension gives you more time to file. It does not clean up the books.`

Primary CTA:

`Request an Extension Cleanup Review`

Primary CTA URL:

`/extension-cleanup-review`

Social strategy:

- High-intent Facebook, Instagram, and paid social clicks should go directly to `/extension-cleanup-review`.
- Educational Facebook and LinkedIn posts may link to the blog article first.
- Retarget blog readers to `/extension-cleanup-review`.
- Use one main conversion landing page with UTMs rather than creating separate funnels for each article.

Brand voice:

Professional, calm, direct, and plain-English. Avoid fear-based tax marketing, refund promises, hacks, loopholes, fake urgency, or individualized advice.

Notion page must include:

- Campaign overview
- Primary revenue objective
- Funnel architecture
- Live URL map
- SEO cluster map
- Editorial calendar
- Social asset map
- Social post copy
- Paid ad copy
- UTM structure
- Tracking events
- Daily execution checklist
- Go-live checklist
- Follow-up workflow for leads

When finished, report:

- Notion page URL
- GitHub commit or PR URL
- Production URL or deployment status
- Any remaining blockers

---

End of Claude prompt.
