# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.

## S01E03 delivery

This repository preserves the original export and adds a signed review:

- [Review source](src/routes/kb/incidents/4471-review/+page.svx)
- [Rendered review](rendered/kb/incidents/4471-review/index.html), with the actual Svelte components, chart, stylesheet and derived desk reference
- [Rendered KB index](rendered/kb/index.html)
- [Parser issue: 379 reports](https://github.com/kprasad-affordablehousing/mega-s01e03-what-it-shows/issues/2)
- [Form-hint issue: 33 reports](https://github.com/kprasad-affordablehousing/mega-s01e03-what-it-shows/issues/1)
- [Computed analysis and complete report-ID assignments](analysis.json)
- [Reusable GitHub delivery skill](skills/github-course-delivery/SKILL.md)

With Node.js 22.18 or newer, reproduce the delivery:

```text
npm ci
npm run analyze
npm run render
npm test
```

Rendering uses Vite in middleware mode without starting an HTTP server, and
MDsveX/Svelte server-side rendering executes the imported components. Open the
generated HTML files locally to read them; their `/kb` links retain the original
site routes. No production service or model API is called.

The original accepted decision and source records are unchanged. The new review
proposes superseding the old triage rule; it does not pretend that proposal is
already accepted or that either product defect has been fixed.
