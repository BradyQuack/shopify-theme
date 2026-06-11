# Mobile Phase 1 — Product Page Consolidation (Design Doc)

Status: **Draft for review** · Owner: theme · Branch: `claude/optimistic-cori-1356g`
Related: Phase 0 hotfix `f63995a` (closed the 750–989px dead zone as a stopgap)

---

## 1. Purpose

Replace the duplicated desktop/mobile product-page architecture with a **single
responsive product section**. This permanently fixes the breakpoint gap,
removes duplicate in-page content, roughly halves product-page payload (the
pages mobile users hit most), and ends double-maintenance.

This document is design only — no code changes beyond the already-shipped
Phase 0 hotfix. Implementation begins after the open decisions in §13 are made.

---

## 2. Current architecture

Product pages render **two parallel layouts**, toggled by CSS `display`:

| Section | Lines | Role | Visible at | Block system |
|---|---|---|---|---|
| `main-product.liquid` ("Amazon – Product Desktop") | 2,163 | Full desktop PDP | ≥990px | Yes (18 block types) |
| `mobile-product-section1.liquid` ("Mobile Section 1") | 824 | Mobile media gallery + title/badge/reviews/social proof | ≤989px* | logo_and_reviews, title, badge, social_proof |
| `mobile-product-section2.liquid` ("Mobile Section 2") | 1,228 | Mobile buy box: price, variants, qty, add-to-cart, buy-now | ≤989px* | none (fixed) |
| `mobile-product-section3.liquid` ("Mobile Section 3") | 901 | Review carousel (swipe) | **all widths** | review |

\* after the Phase 0 hotfix (`f63995a`); previously ≤749px, which caused the dead zone.

`main-product` block types: `@app, title, text, rating, badge, sales_count,
price, variant_picker, description, inventory, quantity_selector, buy_buttons,
divider, sku, share, custom_liquid, collapsible_tab, shipping_info`.

### Templates
| Template | Sections used |
|---|---|
| `product.amazon.json` | main-product + mobile 1/2/3 |
| `product.amazon-pumps.json` | main-product + mobile 1/2/3 |
| `product.amazon-pump-parts.json` | main-product + mobile 1/2/3 |
| `product.rfq.json` | main-product + mobile 1/2/3 |
| `product.json` (default) | **main-product only** |

### Duplication map (rendered twice per page)
Title · media gallery · price · variant picker · quantity · add-to-cart ·
buy-now · rating/reviews · badges. Plus **two independent JS implementations**
of variant selection, price updates, and `fetch('/cart/add.js')` (one in
`main-product`, one in `mobile-product-section2`).

---

## 3. Problems

1. **Dead zone (was live, now stopgapped).** Desktop hid ≤989px, mobile hid
   ≥750px → 750–989px showed no buy box. Phase 0 patched the breakpoints; this
   project removes the split that made the bug possible.
2. **Default template is mobile-broken.** `product.json` has only
   `main-product` (desktop-only), so any product on the default template
   renders **no product detail on phones/tablets** — only related products.
3. **~2× payload.** Both layouts ship in every product HTML (~218 KB live,
   24 external CSS files, 10 inline `<style>` blocks). Worst impact is on
   mobile — the exact audience this hurts (LCP, TBT, data).
4. **Duplicate content & 2× H1 (SEO).** Same product content twice; Phase
   earlier demoted the mobile H1 as a stopgap, but the duplication remains.
5. **Double maintenance / divergence.** Every change must be made twice; the
   two variant/price/cart JS controllers can (and did) drift out of sync.

---

## 4. Goals / non-goals

**Goals**
- One responsive product section; exactly one layout renders at any width.
- One media gallery, one variant/price/cart JS controller.
- Feature parity with today's desktop + mobile experiences (see §7 checklist).
- Net payload reduction on product pages.
- Preserve merchant-configurable blocks/settings where feasible.

**Non-goals (this phase)**
- Visual redesign beyond what consolidation requires (UX polish is Phase 3).
- Touching `main` / publishing (stays on the feature branch until approved).
- Performance work unrelated to the PDP (Phase 2).

---

## 5. Options considered

**Option A — Build one responsive section (recommended).**
Create a single responsive product section that renders one DOM tree styled by
CSS breakpoints. Retire `mobile-product-section1/2/3`; migrate templates to the
unified section. Highest payoff (solves every problem in §3), highest effort.

**Option B — Keep the split, just deduplicate.**
Make the sections strictly mutually exclusive and remove redundant JS. Lower
effort, but still ships duplicate markup and keeps double-maintenance — does not
solve #3/#4/#5. Rejected as a half-measure.

**Option C — Rebuild on stock Dawn `main-product`.**
Adopt Dawn's proven responsive PDP wholesale. Cleanest engineering, but discards
the bespoke "Amazon-style" design and the custom blocks (sales_count,
social_proof, shipping_info, RFQ-for-$1, etc.) the store relies on. Rejected
unless you want a visual reset.

**Decision: Option A**, implemented by **evolving `main-product` into the
responsive section** (it already owns the richest block system and the
structured data), folding in the mobile gallery and buy-box behaviors, then
retiring `mobile-product-section1/2` (section 3 stays as a separate responsive
section). See §13 for the full set of resolved decisions.

---

## 6. Target architecture

- **One section** (`main-product`, made responsive) renders the full PDP.
  Remove the `.desktop-only-section` ≥990px gate; replace fixed desktop layout
  with a responsive grid (single column ≤749px, two-column media/info ≥750px).
- **One media gallery** — responsive (stacked/swipe on mobile, thumbnails+main
  on desktop). Reuse Dawn's `product-media-gallery`/`product-media` snippets
  where possible rather than two bespoke galleries.
- **One JS controller** for variant selection → price/availability/media
  updates → add-to-cart/buy-now. Standardize on the existing `product-form.js`
  + a single variant module; delete `mobile-product-section2`'s parallel JS.
- **Reviews carousel** (`mobile-product-section3`) → either fold into the
  unified section as a responsive block, or keep as a standalone **responsive**
  section reused by all templates (decision §13). Today it already shows at all
  widths, so it's the least entangled piece.

Result: one layout at every breakpoint, no gap/overlap, ~half the product HTML.

---

## 7. Feature-parity checklist (acceptance criteria)

Every item must work in the unified section at mobile **and** desktop widths:

- [ ] Media gallery: multiple images, zoom/lightbox, video/model media, swipe on mobile
- [ ] Title, vendor, SKU, badges, sales_count, social_proof, rating
- [ ] Price incl. compare-at / discount badge, dynamic update on variant change
- [ ] Variant picker (button + swatch) updates price, availability, media, URL `?variant=`
- [ ] Quantity selector + quantity rules
- [ ] Add to Cart (AJAX) + cart drawer/notification
- [ ] Buy Now (incl. the Phase-0 bfcache reset behavior)
- [ ] RFQ / "Request a Quote" path for $1 products
- [ ] Description, collapsible tabs, shipping_info, custom_liquid blocks
- [ ] Share
- [ ] Review carousel
- [ ] Product JSON-LD emitted exactly **once**
- [ ] Exactly **one** `<h1>`

---

## 8. Media gallery strategy

`main-product` has a desktop gallery + lightbox; `mobile-product-section1` has a
separate mobile gallery. Target: a single responsive gallery. Preferred path is
Dawn's `product-media-gallery.liquid` / `product-media.liquid` (already in
`snippets/`) which is responsive out of the box, falling back to a consolidated
bespoke gallery if the Amazon-style thumbnails must be preserved exactly.

---

## 9. JavaScript consolidation

Today: two variant/price/cart implementations that can diverge.
Target: one controller. Reuse `assets/product-form.js` (already loaded by
`main-product`) and a single variant-change module that updates price,
availability, media, and the `?variant=` URL. Remove the inline price/variant/
cart JS embedded in `mobile-product-section2`. Net: less JS, one source of truth,
no drift.

---

## 10. Settings, schema & template (JSON) migration

- The unified section keeps `main-product`'s block schema, **adding** any
  mobile-only blocks worth preserving (`social_proof`, `logo_and_reviews`).
- Product template JSONs are **auto-generated** (Shopify theme editor may
  overwrite). Migration must update each of the 4 amazon/rfq templates plus
  `product.json` to (a) drop the three `mobile-product-section*` entries and
  (b) ensure the unified section carries the needed blocks/settings.
- Preserve current merchant settings by mapping existing block settings into
  the unified schema; document any settings that can't carry over.

---

## 11. Migration plan (incremental, reversible)

1. **Build** the responsive unified section on the branch *without* deleting the
   mobile sections (parallel-run capability for rollback).
2. **Pilot** on one template — `product.amazon.json` — wired to the unified
   section only. QA against §7 + §12 across the breakpoint matrix.
3. **Roll out** to `product.amazon-pumps`, `product.amazon-pump-parts`,
   `product.rfq`, and fix `product.json` (gains a working mobile PDP for free).
4. **Retire** `mobile-product-section1/2/3` once all templates are migrated and
   verified; remove their now-dead CSS/JS.
5. Keep each step as its own commit on the feature branch for easy rollback.

---

## 12. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Visual/behavior regressions across many widths | Breakpoint matrix QA (§ below); parallel-run old sections until verified |
| Editor overwrites template JSON | Make changes in code, document required editor state, re-verify after any editor save |
| Lost merchant settings on schema merge | Explicit settings-mapping table; default-preserving |
| Amazon-style desktop look changes | Decide design direction up front (§13); pilot one template first |
| Cart/variant JS regressions | Single controller reusing battle-tested `product-form.js`; functional test each path |

### QA / breakpoint matrix
Widths: **360, 390, 414, 768, 820, 1024, 1280**. On each: layout integrity, one
H1, variant change updates price/media/availability, add-to-cart, buy-now,
gallery/zoom, reviews carousel, no horizontal scroll, tap targets ≥44px.

---

## 13. Decisions (resolved)

These were confirmed and now drive implementation:

1. **Design direction:** **Fresh responsive design.** A newly-designed
   responsive PDP layout/structure — not a literal scale of the current desktop
   or mobile look — with mobile-first breakpoints (single column ≤749px,
   two-column media/info ≥750px, refined ≥990px).
2. **Build approach:** **Evolve `main-product`.** Refactor the existing section
   in place so we keep its 18-block schema, merchant settings, and the
   single-source product JSON-LD. Mobile-only blocks worth keeping
   (`social_proof`, `logo_and_reviews`) get added to its schema.
3. **Reviews (section 3):** **Keep as a separate section**, made fully
   responsive and reused by all product templates. Lowest entanglement; it
   already renders at all widths.
4. **Gallery:** **Preserve the bespoke Amazon thumbnail gallery**, refactored to
   be responsive (thumbnails + main image on desktop, swipeable single-column on
   mobile) — one gallery instead of the current desktop + mobile pair.

### Resulting implementation shape
- `main-product` becomes the single responsive PDP: remove the
  `.desktop-only-section` ≥990px gate, replace the fixed desktop layout with a
  fresh mobile-first responsive grid, fold in the buy-box and gallery behaviors.
- One consolidated **Amazon-style gallery** (responsive), one variant/price/cart
  JS controller (reuse `product-form.js`; delete `mobile-product-section2` JS).
- `mobile-product-section3` (reviews) is refactored to a standalone responsive
  section and kept; `mobile-product-section1` and `mobile-product-section2` are
  retired after migration.

---

## 14. Effort & sequencing (rough)

- Unified section + responsive CSS + gallery + JS consolidation: **large**.
- Template migration + QA: **medium**.
- Cleanup/retire mobile sections: **small**.
Sequenced behind the open decisions; pilot-first keeps risk contained.
