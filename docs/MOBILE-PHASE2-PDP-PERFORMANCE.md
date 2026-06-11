# Mobile Phase 2 — Product Page Performance (Design Doc)

Status: **Draft for review** · Owner: theme · Branch: `claude/optimistic-cori-1356g`
Builds on: Phase 1 (product-page consolidation — single responsive `main-product`).

---

## 1. Purpose

Phase 1 removed the duplicate desktop/mobile architecture. Phase 2 optimizes
the now-single responsive PDP for **mobile load performance** — primarily
**LCP** (largest contentful paint), **CLS** (layout shift), and bytes
transferred — since the PDP is the page mobile users hit most.

Non-goals: visual redesign (Phase 3), site-wide perf unrelated to the PDP,
and anything that touches `main` (stays on the branch until approved).

---

## 2. Baseline (measured) & how to measure

Audit of a live `product.amazon` page (mobile UA), pre-publish:

| Metric | Value | Note |
|---|---|---|
| HTML transferred | ~218 KB | Phase 1 cuts this once published (dup sections gone) |
| Render-blocking CSS `<link>` | 25 | only 2 use the `media=print` async pattern |
| `<script>` tags | 58 | 37 inline, 16 defer, 4 async |
| Inline `<style>` blocks | 10 (~53 KB) | large inline CSS payload |
| `<img>` with `srcset` | 1 / 12 | mobile over-downloads images |
| `<img>` lazy-loaded | 0 / 12 | thumbnails/below-fold load eagerly |
| `<img>` with width+height | 3 / 12 | layout-shift (CLS) risk |
| `preload` hints | 0 | LCP product image not prioritized |

`theme.liquid` is already reasonably tuned (font `preload` + `font-display:
swap`, CDN `preconnect`, a few `media=print` async CSS). The remaining wins
are concentrated in **`main-product`** and **CSS/JS delivery**.

> **Measurement caveat:** real before/after Lighthouse numbers need the branch
> to be reachable — either published, or a preview URL run through Lighthouse /
> PageSpeed Insights. We can't headless-measure the unpublished branch from
> here, so each change below is justified by web-perf best practice and should
> be validated with PSI on the preview (or post-publish).

---

## 3. Workstreams (prioritized)

### WS1 — Responsive product image (LCP + CLS + bytes) · HIGH impact · LOW–MED risk
`main-product.liquid:720` emits the main image as a single `width: 800` `src`
with no `srcset`/`sizes`, no `width`/`height`, no `fetchpriority`.
- Add `srcset` (e.g. 400/600/800/1000/1200/1500) + `sizes` so phones fetch a
  small image instead of 800px/full-res.
- Add intrinsic `width`/`height` (from `featured_media`) + CSS `height:auto` to
  reserve space → kills CLS.
- Add `fetchpriority="high"` (it's the LCP element).
- **Gotcha:** thumbnail switching sets `mainImage.src` directly
  (`main-product.liquid:1274`); `srcset` overrides `src`. The swap JS must also
  set/clear `srcset` (and `sizes`) or switch to updating both. Lightbox
  (`data-full-src`) stays full-res.

### WS2 — Preload the LCP image · MED impact · LOW risk
Emit `<link rel="preload" as="image" imagesrcset=… imagesizes=…>` for
`product.featured_media` from the section head, so the hero image starts
downloading before CSS/JS parse. Pair with WS1's `srcset`.

### WS3 — Lazy-load + size the secondary images · MED impact · LOW risk
Thumbnails (`:729/:731`), variant swatch images (`:934`), logo/reviews/rating
images: add `loading="lazy"`, `width`/`height`, and `decoding="async"`. These
are below the fold / non-LCP, safe to defer.

### WS4 — CSS delivery · HIGH impact · MED–HIGH risk (FOUC)
`main-product` loads 10 CSS files; the page pulls 25 render-blocking sheets.
- Audit which of the 10 are actually used by the rendered PDP; drop unused.
- Move non-critical component CSS to the `media=print`/`onload` async pattern
  already used elsewhere, keeping only above-the-fold CSS blocking.
- Risk: flash-of-unstyled-content if a blocking sheet is deferred wrongly →
  needs careful per-file QA across breakpoints.

### WS5 — Inline `<style>`/`<script>` consolidation · MED impact · MED risk
`main-product` has 3 inline `<style>` and 6 inline `<script>` blocks (page-wide:
~53 KB inline CSS, 37 inline scripts). Consolidate the section's inline CSS into
its `section-main-product.css`/`{% style %}` and defer non-critical inline JS.
Reduces parse/blocking and HTML weight.

### WS6 — JS execution · MED impact · MED risk
Confirm all `main-product` scripts are `defer`/non-blocking; ensure the single
consolidated variant/cart controller (from Phase 1 direction) isn't doing
redundant work. Verify no render-blocking inline JS in `<head>`.

---

## 4. Sequencing (incremental, reversible — like Phase 1)

1. **WS1 + WS2 + WS3** (image bundle) — highest ROI, lowest risk, self-contained
   in `main-product`. One commit per workstream.
2. Validate on preview via PageSpeed Insights (mobile) before proceeding.
3. **WS5** then **WS4** (inline consolidation, then CSS deferral) — riskier,
   QA across the breakpoint matrix (360/390/414/768/820/1024/1280).
4. **WS6** cleanup.
5. Each step its own commit on the branch; nothing published until approved.

---

## 5. Open decisions

1. **Scope to start:** do the image bundle (WS1–WS3) now, or plan all six first?
2. **CSS deferral appetite (WS4):** aggressive (defer most component CSS, retest)
   vs conservative (only drop provably-unused sheets)? FOUC risk vs payload win.
3. **Validation:** can you run PSI/Lighthouse on the preview URL (or publish to a
   staging/unpublished theme) so we get real LCP/CLS numbers between steps?
