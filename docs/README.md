# IMP-233 — GitHub Pages build hub

A self-contained static hub for the **Books Rescue Diagnostic** funnel (`balancebeamteam.com`, BBTeam lane).
It mirrors the Notion IMP-233 row and links to the funnel assets. Internal build page — not client-facing.

## Files

| File | Role |
|---|---|
| `index.html` | The build hub (this is what GitHub Pages serves). Self-contained — no build step. |
| `docs/imp/IMP-233-books-rescue-diagnostic.md` | The repo build record (mirror of the Notion row). |
| `books-rescue-diagnostic.html` | Funnel result page — drop in alongside `index.html` for the live-preview link to work. |
| `books-rescue-quiz-v3.html` | Funnel quiz — same. |

## Enable GitHub Pages

Pick **one** of these, then point Pages at it in **Settings → Pages → Build and deployment → Source: Deploy from a branch**:

- **Project-page subfolder (recommended):**
  put these files under `/docs` on `main` and set Pages source to `main` + `/docs`. URL:
  `https://balancebeamtax.github.io/BBT-Landing/`
- **Dedicated branch:** create a `gh-pages` branch with these files at root, set Pages source to `gh-pages` + `/ (root)`.

An empty **`.nojekyll`** file sits next to `index.html` so GitHub serves the HTML as-is (no Jekyll processing).

## Guardrails (BBTeam canonical hard-rules)

- No real GHL webhook URL anywhere in these files — referenced by ID suffix only.
- Agents don't open PRs, merge, or deploy. Opening the PR and enabling Pages are **owner actions**.
- Logical ID **IMP-233** governs; the Notion auto-ID (241) is a monotonic counter, not a fixed offset.
