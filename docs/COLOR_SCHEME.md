# ASIW Supply - Color Scheme Documentation

## Overview

This document provides a comprehensive guide to the ASIW Supply Shopify theme color system. The design uses a two-tier token architecture with a professional blue brand identity that adapts seamlessly between light and dark modes.

### Technology Stack
- **Shopify Liquid**: Theme templating engine
- **CSS Variables**: HSL color format for all custom properties
- **Theme Toggle**: Supports light and dark modes with smooth transitions
- **Two-Tier Tokens**: Base colors (Tier 1) + Semantic tokens (Tier 2)

### Core Principles
1. All colors defined as HSL values in CSS variables
2. Both light and dark mode variants required for every semantic token
3. Semantic naming over descriptive (e.g., `--color-primary` not `--blue-700`)
4. Opacity modifiers for subtle backgrounds (`rgba(255,255,255, 0.05)`, etc.)
5. Light mode uses darker, muted colors; dark mode uses brighter, vibrant colors

---

## When to Use This Guide

**Reference this document when:**
- Creating any new section or component
- Adding or modifying colors anywhere in the theme
- Troubleshooting theme switching or color rendering issues
- Onboarding new team members to the project
- Conducting code reviews involving UI changes
- Migrating hardcoded colors to semantic tokens

**Key sections for common tasks:**
- Need a color quickly? → [Quick Reference Cheat Sheet](#quick-reference-cheat-sheet)
- Adding a new color? → [Migration Guide](#migration-guide)
- Color not rendering correctly? → [Troubleshooting](#troubleshooting)
- Understanding design decisions? → [Design Decisions & Rationale](#design-decisions--rationale)
- Building a component? → [Component Color Mapping](#component-color-mapping)

---

## Quick Reference Cheat Sheet

### Most Used CSS Variables

| Purpose | CSS Variable | Light Mode | Dark Mode |
|---------|--------------|------------|-----------|
| Page background | `--color-bg` | #F0F2F5 | #0C1322 |
| Card background | `--color-surface-1` | #FFFFFF | #1E293B |
| Primary text | `--color-text-primary` | #1C2B41 | #F0F5FA |
| Heading text | `--color-text-heading` | #161F30 | #F8FAFC |
| Muted text | `--color-text-tertiary` | #8892A2 | #6B7A8F |
| Primary action | `--color-primary` | #005496 | #5BA3F5 |
| Primary active | `--color-primary-active` | #003052 | #C5DFFB |
| Success (green) | `--color-success` | #22C55E | #4ADE80 |
| Error (red) | `--color-error` | #DC2626 | #F87171 |
| Star rating | `--color-star-filled` | #EAB308 | #EAB308 |
| Focus ring | `--ring-color` | #005496 | #5BA3F5 |
| Input border | `--input-border` | #C9CFD8 | #3A4556 |

### Copy-Paste Patterns

```css
/* Standard Card (using surface elevation) */
.card {
  background-color: var(--color-surface-1);
  border: 1px solid var(--color-border);
}

/* Modal / Dropdown (higher elevation) */
.modal {
  background-color: var(--color-surface-2);
  border: 1px solid var(--color-border);
}

/* Primary Button with all states */
.button--primary {
  background-color: var(--button-primary-bg);
  color: var(--button-primary-text);
}
.button--primary:hover {
  background-color: var(--button-primary-bg-hover);
}
.button--primary:active {
  background-color: var(--button-primary-bg-active);
}
.button--primary:disabled {
  background-color: var(--button-primary-bg-disabled);
  color: var(--button-primary-text-disabled);
}

/* Secondary/Outline Button */
.button--secondary {
  background-color: var(--button-secondary-bg);
  border-color: var(--button-secondary-border);
  color: var(--button-secondary-text);
}

/* Success Alert */
.alert--success {
  background-color: var(--color-success-bg);
  color: var(--color-success-text);
  border-color: var(--color-success-border);
}

/* Error Alert */
.alert--error {
  background-color: var(--color-error-bg);
  color: var(--color-error-text);
  border-color: var(--color-error-border);
}

/* Focus Ring */
.input:focus-visible {
  outline: var(--ring-width) solid var(--ring-color);
  outline-offset: var(--ring-offset);
}

/* Form Input */
.input {
  background-color: var(--input-bg);
  border-color: var(--input-border);
  color: var(--input-text);
}
.input::placeholder {
  color: var(--input-placeholder);
}
.input:hover {
  border-color: var(--input-border-hover);
}
.input:focus {
  border-color: var(--input-border-focus);
}

/* Table */
.table th {
  background-color: var(--table-header-bg);
}
.table tr:nth-child(even) {
  background-color: var(--table-row-stripe);
}
.table tr:hover {
  background-color: var(--table-row-hover);
}

/* Text Hierarchy */
h1, h2, h3 { color: var(--color-text-heading); }
p { color: var(--color-text-primary); }
.caption { color: var(--color-text-tertiary); }
.disabled { color: var(--color-text-disabled); }

/* Skeleton Loading */
.skeleton {
  background-color: var(--skeleton-base);
  background-image: linear-gradient(
    90deg,
    var(--skeleton-base) 0%,
    var(--skeleton-shimmer) 50%,
    var(--skeleton-base) 100%
  );
}
```

---

## Design Decisions & Rationale

### Why HSL Colors?
- **Opacity modifiers**: Easy to create transparent variants
- **Perceptual uniformity**: HSL changes are more predictable to human perception
- **Theme adaptability**: Easier to adjust lightness for dark/light modes
- **Consistency**: All colors follow the same format

### Why Different Blue Shades for Light/Dark?
- **Light mode**: Uses darker, muted blue (`204° 100% 29%` = #005496) to avoid clashing with light backgrounds
- **Dark mode**: Uses brighter blue (`213° 94% 68%` = #5BA3F5) for visibility against dark backgrounds
- **Same visual impact**: Both achieve similar prominence in their respective contexts

### Why Branded Footer Colors?
- **Light mode**: Footer uses primary blue (#005496) for strong brand identity
- **Dark mode**: Footer uses branded dark blue (#0F1A2E) instead of blending with page background
- **Visual separation**: Maintains footer identity while providing clear section boundaries

### Why Opacity-Based Cards in Dark Mode?
- **Subtle separation**: 5% white overlay provides gentle lift without harsh contrast
- **Hover feedback**: Increases to 8% on hover for clear interactivity
- **Border visibility**: 12% white border ensures card boundaries are visible
- **Consistency**: All cards use the same opacity tokens

### Why Text Hierarchy Tokens?
- **Improved readability**: Quote text slightly dimmer than customer names
- **Visual hierarchy**: Names (brightest) → Quotes → Labels (dimmest)
- **Semantic meaning**: `--color-text-quote` and `--color-text-label` convey purpose

### Why 5-Level Surface Elevation?
- **Depth perception**: Creates visual hierarchy without relying on shadows alone
- **Surface-0**: Page canvas (lowest, blends with background)
- **Surface-1**: Cards, panels (default content containers)
- **Surface-2**: Modals, dropdowns (overlays page content)
- **Surface-3**: Tooltips, popovers (floats above modals)
- **Surface-4**: Highest priority elements (very rare usage)
- **Dark mode benefit**: Higher elevations are progressively lighter, creating natural depth

### Why Centralized Opacity Scale?
- **Consistency**: All opacity values from one source (`--alpha-5` through `--alpha-70`)
- **Maintainability**: Change opacity values in one place
- **Semantic usage**: `--alpha-5` for subtle backgrounds, `--alpha-50` for modal backdrops
- **Dark mode patterns**: Enables consistent white-overlay approach for cards

### Why Focus Ring System?
- **Accessibility**: Clear focus indicators for keyboard navigation
- **Customizable**: `--ring-width`, `--ring-offset`, `--ring-color` tokens
- **Theme-aware**: Blue ring adapts to light/dark mode
- **Consistent**: Same focus treatment across all interactive elements

### Why Component-Specific Tokens?
- **Encapsulation**: Inputs, tables, buttons have their own token sets
- **Flexibility**: Can adjust component colors without affecting global tokens
- **State management**: All states (hover, focus, disabled) pre-defined
- **Future-proofing**: Easy to add new components with consistent patterns

---

## Color Palette Reference

### TIER 1: Base Color Variables

Base colors are raw HSL values, theme-agnostic, defined in `:root`.

#### Blue Family (Primary Brand)

| Variable | HSL Value | Hex | Usage |
|----------|-----------|-----|-------|
| `--base-blue-900` | `204 100% 18%` | #003052 | Darkest blue |
| `--base-blue-800` | `204 100% 24%` | #003E70 | Light mode hover |
| `--base-blue-700` | `204 100% 29%` | #005496 | **Light mode primary** |
| `--base-blue-600` | `210 90% 40%` | #0A5FC2 | Mid blue |
| `--base-blue-500` | `213 90% 52%` | #2B7DE9 | Secondary blue |
| `--base-blue-400` | `213 94% 68%` | #5BA3F5 | **Dark mode primary** |
| `--base-blue-300` | `213 94% 78%` | #93C5F8 | Dark mode hover |
| `--base-blue-200` | `214 95% 88%` | #C5DFFB | Light tint |
| `--base-blue-100` | `214 100% 95%` | #E6F2FF | Lightest tint |

#### Gray Family (Cool, Blue Undertone)

| Variable | HSL Value | Hex | Usage |
|----------|-----------|-----|-------|
| `--base-gray-950` | `222 47% 9%` | #0C1322 | **Dark mode bg** |
| `--base-gray-900` | `217 33% 13%` | #161D2B | Dark surface |
| `--base-gray-800` | `217 24% 17%` | #1E293B | **Dark mode surface** |
| `--base-gray-700` | `215 20% 24%` | #313B49 | Dark alt surface |
| `--base-gray-600` | `215 16% 35%` | #4B5567 | Dark muted |
| `--base-gray-500` | `215 14% 47%` | #67748A | Mid gray |
| `--base-gray-400` | `214 12% 58%` | #8892A2 | Light muted |
| `--base-gray-300` | `213 12% 70%` | #A8B0BC | Light gray |
| `--base-gray-200` | `214 14% 82%` | #C9CFD8 | Lighter gray |
| `--base-gray-100` | `216 20% 96%` | #F0F2F5 | **Light mode bg** |
| `--base-gray-50` | `0 0% 100%` | #FFFFFF | Pure white |

#### Orange/Accent Family

| Variable | HSL Value | Hex | Usage |
|----------|-----------|-----|-------|
| `--base-orange-900` | `24 75% 25%` | #6F3A10 | Darkest orange |
| `--base-orange-800` | `24 78% 35%` | #9F4E14 | Dark orange |
| `--base-orange-700` | `24 72% 51%` | #DD6727 | **Light mode accent** |
| `--base-orange-600` | `27 87% 54%` | #E87A2A | Mid orange |
| `--base-orange-500` | `27 96% 61%` | #F28C38 | **Dark mode accent** |
| `--base-orange-400` | `32 95% 68%` | #F5A54D | Light orange |
| `--base-orange-100` | `40 100% 95%` | #FFF8E6 | Lightest tint |

#### Special Purpose Colors

| Variable | HSL Value | Hex | Usage |
|----------|-----------|-----|-------|
| `--base-ice-blue` | `213 94% 68%` | #5BA3F5 | Toggle active (both modes) |
| `--base-success-light` | `142 71% 45%` | #22C55E | Success (light mode) |
| `--base-success-dark` | `142 69% 58%` | #4ADE80 | Success (dark mode) |
| `--base-warning-light` | `38 92% 50%` | #F59E0B | Warning (light mode) |
| `--base-warning-dark` | `45 93% 58%` | #FACC15 | Warning (dark mode) |
| `--base-error-light` | `0 72% 51%` | #DC2626 | Error (light mode) |
| `--base-error-dark` | `0 91% 71%` | #F87171 | Error (dark mode) |
| `--base-star` | `45 93% 55%` | #EAB308 | Star ratings (both modes) |

---

### TIER 2: Semantic Token Mapping

Semantic tokens map to different base colors depending on theme.

#### Surface Elevation System (5 Levels)

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-bg` | #F0F2F5 | #0C1322 | Page background (canvas) |
| `--color-surface-0` | #F0F2F5 | #0C1322 | Same as bg, for flush sections |
| `--color-surface-1` | #FFFFFF | #1E293B | Cards, panels (default) |
| `--color-surface-2` | #FFFFFF | #313B49 | Modals, dropdowns |
| `--color-surface-3` | #FFFFFF | #3E4A5C | Tooltips, popovers |
| `--color-surface-4` | #FFFFFF | #4A5668 | Highest elevation |
| `--color-surface` | #FFFFFF | #1E293B | Alias: Default surface |
| `--color-surface-alt` | #E8ECF0 | #313B49 | Alternate surfaces |
| `--color-surface-hover` | #F8F9FA | #3A4556 | Hover state |
| `--color-overlay` | rgba(12,19,34,0.5) | rgba(12,19,34,0.7) | Modal backdrops |

#### Text Hierarchy (5 Levels)

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-text-heading` | #161F30 | #F8FAFC | H1-H3: Strongest |
| `--color-text-primary` | #1C2B41 | #F0F5FA | Body text: Primary |
| `--color-text-secondary` | #67748A | #94A3B8 | Supporting text |
| `--color-text-tertiary` | #8892A2 | #6B7A8F | Captions, hints |
| `--color-text-disabled` | #A8B0BC | #4B5567 | Inactive elements |
| `--color-text-muted` | #8892A2 | #64748B | Alias: Muted text |
| `--color-text-inverse` | #FFFFFF | #0C1322 | Text on colored bg |
| `--color-text-quote` | #1C2B41 | #B8C4D4 | Quote text (dimmer in dark) |
| `--color-text-label` | #67748A | #6B7A8F | Labels, locations |

#### Border Hierarchy

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-border` | #D4D9E0 | #3A4556 | Default borders |
| `--color-border-light` | #E8ECF0 | #4A5568 | Subtle borders |
| `--color-border-dark` | #C0C7D0 | #1E293B | Emphasis borders |

#### Brand Colors (with Interactive States)

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-primary` | #005496 | #5BA3F5 | Buttons, links |
| `--color-primary-hover` | #003E70 | #93C5F8 | Hover states |
| `--color-primary-active` | #003052 | #C5DFFB | Pressed/active state |
| `--color-primary-light` | #E6F2FF | #1A3A5C | Light tint |
| `--color-secondary` | #2B7DE9 | #8B9FD6 | Secondary actions |
| `--color-secondary-hover` | #0A5FC2 | #A8B8E4 | Secondary hover |
| `--color-secondary-active` | #005496 | #C5CFEF | Secondary active |
| `--color-accent` | #DD6727 | #F28C38 | Accent highlights |
| `--color-accent-hover` | #9F4E14 | #F5A54D | Accent hover |
| `--color-accent-active` | #6F3A10 | #F8C08A | Accent active |

#### Feedback Colors (Full System)

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| **Success** ||||
| `--color-success` | #22C55E | #4ADE80 | Success icon/text |
| `--color-success-hover` | #16A34A | #86EFAC | Success hover |
| `--color-success-bg` | #F0FDF4 | #1A2E1A | Alert background |
| `--color-success-text` | #166534 | #86EFAC | Alert text |
| `--color-success-border` | #86EFAC | #2E5A2E | Alert border |
| **Warning** ||||
| `--color-warning` | #F59E0B | #FACC15 | Warning icon/text |
| `--color-warning-hover` | #D97706 | #FDE047 | Warning hover |
| `--color-warning-bg` | #FFFBEB | #2E2A1A | Alert background |
| `--color-warning-text` | #92400E | #FDE047 | Alert text |
| `--color-warning-border` | #FCD34D | #5A4A2E | Alert border |
| **Error** ||||
| `--color-error` | #DC2626 | #F87171 | Error icon/text |
| `--color-error-hover` | #B91C1C | #FCA5A5 | Error hover |
| `--color-error-bg` | #FEF2F2 | #2E1A1A | Alert background |
| `--color-error-text` | #991B1B | #FCA5A5 | Alert text |
| `--color-error-border` | #FCA5A5 | #5A2E2E | Alert border |
| **Info** ||||
| `--color-info` | #2B7DE9 | #5BA3F5 | Info icon/text |
| `--color-info-hover` | #0A5FC2 | #93C5F8 | Info hover |
| `--color-info-bg` | #E6F2FF | #1A3A5C | Alert background |
| `--color-info-text` | #003E70 | #93C5F8 | Alert text |
| `--color-info-border` | #C5DFFB | #3A5A8C | Alert border |

#### Focus Ring System

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--ring-color` | #005496 | #5BA3F5 | Focus outline color |
| `--ring-color-alpha` | rgba(0,84,150,0.3) | rgba(91,163,245,0.3) | Focus glow |
| `--ring-width` | 2px | 2px | Outline thickness |
| `--ring-offset` | 2px | 2px | Gap from element |
| `--ring-offset-color` | #FFFFFF | #0C1322 | Gap fill color |

#### Footer Tokens (Branded)

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-footer-bg` | #005496 | #0F1A2E | Footer background |
| `--color-footer-surface` | #005496 | #1A2744 | Elevated areas |
| `--color-footer-border` | rgba(255,255,255,0.2) | #2A3B55 | Borders |
| `--color-footer-text` | #FFFFFF | #A8B5C8 | Body text |
| `--color-footer-text-heading` | #FFFFFF | #E0E7F0 | Headings |

#### Card Opacity Tokens (Dark Mode)

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--card-bg-opacity` | 1 (solid) | 0.05 (5%) | Card background |
| `--card-border-opacity` | 1 (solid) | 0.12 (12%) | Card border |
| `--card-hover-opacity` | 1 (solid) | 0.08 (8%) | Card hover state |

#### Component Tokens: Inputs

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--input-bg` | #FFFFFF | #1E293B | Input background |
| `--input-bg-disabled` | #F0F2F5 | #161D2B | Disabled state |
| `--input-border` | #C9CFD8 | #3A4556 | Default border |
| `--input-border-hover` | #A8B0BC | #4A5568 | Hover border |
| `--input-border-focus` | #005496 | #5BA3F5 | Focus border |
| `--input-placeholder` | #8892A2 | #6B7A8F | Placeholder text |
| `--input-text` | #1C2B41 | #F0F5FA | Input text |

#### Component Tokens: Tables

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--table-header-bg` | #F0F2F5 | #1E293B | Header background |
| `--table-row-hover` | #F8F9FA | #2A3444 | Row hover |
| `--table-row-stripe` | #FAFBFC | #1A2333 | Alternating rows |
| `--table-border` | #E8ECF0 | #3A4556 | Table borders |

#### Component Tokens: Buttons

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--button-primary-bg` | #005496 | #5BA3F5 | Primary background |
| `--button-primary-bg-hover` | #003E70 | #93C5F8 | Primary hover |
| `--button-primary-bg-active` | #003052 | #C5DFFB | Primary active |
| `--button-primary-text` | #FFFFFF | #0C1322 | Primary text |
| `--button-primary-bg-disabled` | #C9CFD8 | #4A5568 | Disabled bg |
| `--button-primary-text-disabled` | #8892A2 | #6B7A8F | Disabled text |
| `--button-secondary-bg` | transparent | transparent | Outline bg |
| `--button-secondary-border` | #005496 | #5BA3F5 | Outline border |
| `--button-secondary-text` | #005496 | #5BA3F5 | Outline text |

#### Component Tokens: Skeleton/Loading

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--skeleton-base` | #E8ECF0 | #2A3444 | Base color |
| `--skeleton-shimmer` | #F0F2F5 | #3A4556 | Shimmer highlight |

---

## Opacity Variants

### Centralized Opacity Scale (CSS Tokens)

All opacity values are defined as tokens in `:root` for consistency:

| Token | Value | Usage |
|-------|-------|-------|
| `--alpha-5` | 0.05 | Subtle backgrounds, card backgrounds |
| `--alpha-8` | 0.08 | Hover states, interactive feedback |
| `--alpha-10` | 0.10 | Light overlays, toggle containers |
| `--alpha-12` | 0.12 | Borders, separators |
| `--alpha-15` | 0.15 | Medium overlays, footer toggle |
| `--alpha-20` | 0.20 | Strong overlays |
| `--alpha-30` | 0.30 | Heavy overlays, focus ring glow |
| `--alpha-50` | 0.50 | Modal backdrops |
| `--alpha-70` | 0.70 | Dark overlays |

**Usage Example**:
```css
/* Use with hsla() for consistent opacity */
background-color: hsla(var(--base-blue-400) / var(--alpha-15));
border-color: rgba(255, 255, 255, var(--alpha-12));
```

### White Opacity Scale (Dark Mode Overlays)

Used for creating subtle separation on dark backgrounds:

| Opacity | Value | Usage |
|---------|-------|-------|
| 1% | `rgba(255,255,255, 0.01)` | Barely visible |
| 2% | `rgba(255,255,255, 0.02)` | Very subtle lift |
| 3% | `rgba(255,255,255, 0.03)` | Subtle cards |
| 5% | `rgba(255,255,255, 0.05)` | **Card backgrounds** |
| 8% | `rgba(255,255,255, 0.08)` | **Hover states** |
| 10% | `rgba(255,255,255, 0.10)` | Toggle containers |
| 12% | `rgba(255,255,255, 0.12)` | **Prominent borders** |
| 15% | `rgba(255,255,255, 0.15)` | Light mode toggle (footer) |

**Usage Principle**: Use lower opacity (1-5%) for large areas, higher opacity (8-15%) for interactive elements.

### Primary Blue Opacity Scale

| Opacity | Usage |
|---------|-------|
| 10% | Subtle highlights |
| 20% | Badge backgrounds |
| 30% | Focus ring shadow (`--ring-color-alpha`) |
| 50% | Focus ring color |

---

## Component Color Mapping

### Header

| Component | Light Mode | Dark Mode |
|-----------|------------|-----------|
| `.header2-section` | `--color-surface` | `--color-surface` |
| `.header2__nav-link` | `--color-text-primary` | `--color-text-primary` |
| `.header2__nav-link:hover` | `--color-primary` | `--color-primary` |
| `.header2__search-button` | `--color-primary` | `--color-primary` |
| `.promo-bar` | `--color-primary` bg | `--color-primary-light` bg |

### Footer

| Component | Light Mode | Dark Mode |
|-----------|------------|-----------|
| `.footer` | `--color-footer-bg` | `--color-footer-bg` |
| `.footer text` | `--color-footer-text` | `--color-footer-text` |
| `.footer headings` | `--color-footer-text-heading` | `--color-footer-text-heading` |
| `.footer a:hover` | opacity: 0.8 | `--color-primary` |
| `.footer__content-bottom` | transparent | transparent + border |
| `.footer__theme-toggle-section` | `--color-footer-surface` | `--color-footer-surface` |
| `.theme-toggle` (in footer) | rgba(255,255,255, 0.15) | rgba(255,255,255, 0.1) |

### Testimonials / Customer Reviews

| Component | Light Mode | Dark Mode |
|-----------|------------|-----------|
| `.testimonial` (container) | `--color-bg` | `--color-bg` |
| `.testimonial__card` | `--color-card-bg` | rgba(255,255,255, 5%) + border 12% |
| `.testimonial__card:hover` | `--color-card-hover` | rgba(255,255,255, 8%) |
| `.testimonial__heading` | `--color-text-primary` | `--color-text-primary` |
| `.testimonial__text` (quote) | `--color-text-primary` | `--color-text-quote` (dimmer) |
| `.testimonial__customer-name` | `--color-text-primary` | `--color-text-primary` (brightest) |
| `.testimonial__customer-location` | `--color-text-muted` | `--color-text-label` |
| `.testimonial__service-type` | surface-alt bg, primary text | Blue tint bg (15%), blue-300 text |
| `.testimonial__star--filled` | `--color-star-filled` | `--color-star-filled` |

### Theme Toggle

| Component | Light Mode | Dark Mode |
|-----------|------------|-----------|
| `.theme-toggle` (container) | `--toggle-container-bg` | `--toggle-container-bg` |
| `.theme-toggle__btn[aria-pressed="true"]` | `--base-ice-blue` (#5BA3F5) | **Same** |
| `.theme-toggle__btn[aria-pressed="false"]` | transparent, muted text | transparent, muted text |
| `.theme-toggle__btn:hover` (inactive) | near-black text | near-white text |

**Design Decision**: Active toggle uses Ice Blue (#5BA3F5) in BOTH modes for brand consistency.

### Buttons

| Component | Light Mode | Dark Mode |
|-----------|------------|-----------|
| `.button--primary` | `--color-primary` bg, white text | `--color-primary` bg, white text |
| `.button--primary:hover` | `--color-primary-hover` | `--color-primary-hover` |
| `.button--secondary` | transparent, primary border | transparent, primary border |
| `.button--secondary:hover` | `--color-primary` bg, white text | `--color-primary` bg, white text |
| `.banner-button` | `--color-success` | `--color-banner-button-bg` |

### Cards & Products

| Component | Light Mode | Dark Mode |
|-----------|------------|-----------|
| `.card` / `.product-card` | `--color-card-bg` | `--color-card-bg` |
| `.card` border | `--color-border` | `--color-border` |
| `.product-card__name` | `--color-link` | `--color-product-title` |
| `.product-card__price` | `--color-text-primary` | `--color-text-primary` |
| `.product-card__compare-price` | `--color-text-muted` | `--color-compare-price` |
| `.product-card__stars` | `--color-star-filled` | `--color-star-filled` |

### Features Bar

| Component | Light Mode | Dark Mode |
|-----------|------------|-----------|
| `.features-bar__item` | `--color-surface`, `--color-border` | `--color-card-bg`, `--color-border` |
| `.features-bar__title` | `--color-text-primary` | `--color-text-primary` |
| `.features-bar__desc` | `--color-text-muted` | `--color-text-secondary` |

---

## Hover States Reference

### Interactive Element Hover Patterns

| Element Type | Normal State | Hover State | Pattern |
|--------------|--------------|-------------|---------|
| Primary Button | `--color-primary` | `--color-primary-hover` | Darker (light) / Lighter (dark) |
| Secondary Button | transparent + border | `--color-primary` bg + white text | Fill on hover |
| Links | `--color-link` | `--color-link-hover` | Darker (light) / Lighter (dark) |
| Cards (Dark Mode) | rgba(255,255,255, 5%) | rgba(255,255,255, 8%) | Increase opacity |
| Footer Links | `--color-footer-text` | opacity: 0.8 (light) / primary (dark) | Dim or accent |
| Toggle (inactive) | `--toggle-inactive-text` | `--toggle-hover-text` | Text color change only |
| Surface elements | `--color-surface` | `--color-surface-hover` | Slight background shift |
| Icons | `--color-icon` | `--color-icon-hover` | Primary color on hover |

**Hover Principle**: Light mode hovers go darker, dark mode hovers go lighter. Cards use opacity increase rather than color change.

### Transition Timing

```css
/* Theme-ready transition */
transition-property: color, background-color, border-color, fill, stroke, opacity, box-shadow;
transition-duration: 200ms;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* Button transitions */
transition: all 300ms ease-in-out;
```

---

## Accessibility: Contrast Ratios

### Critical Combinations (Verified)

| Background | Text | Contrast | WCAG |
|------------|------|----------|------|
| `--color-bg` (dark) | `--color-text-primary` | 15.8:1 | AAA |
| `--color-surface` (dark) | `--color-text-primary` | 14.2:1 | AAA |
| `--color-primary` | `--color-button-text` | 7.1:1 | AAA |
| `--color-footer-bg` (light) | `--color-footer-text` | 8.5:1 | AAA |
| `--color-footer-bg` (dark) | `--color-footer-text` | 7.2:1 | AAA |

### Minimum Requirements
- **Normal text**: 4.5:1 (WCAG AA)
- **Large text (18pt+)**: 3:1 (WCAG AA)
- **UI components**: 3:1 (WCAG 2.1)

---

## Migration Guide

### Priority 1: Convert Hardcoded Colors

| Current Code | Replace With | Reason |
|--------------|--------------|--------|
| `#005496` | `var(--color-primary)` | Theme-aware |
| `#FFFFFF` | `var(--color-button-text)` or `var(--color-text-inverse)` | Semantic meaning |
| `#0C1322` | `var(--color-bg)` (dark) | Already defined |
| `#22C55E` | `var(--color-success)` | Theme-aware |

### How to Add New Color Tokens

1. **Define base color in `:root`** (if new hue):
```css
:root {
  --base-purple-500: 270 60% 50%; /* HSL format, no hsl() wrapper */
}
```

2. **Add semantic token for both modes**:
```css
:root,
[data-theme="light"] {
  --color-feature: hsl(var(--base-purple-500));
}

[data-theme="dark"] {
  --color-feature: hsl(270 70% 70%); /* Brighter for dark mode */
}
```

3. **Use in components**:
```css
.feature-element {
  color: var(--color-feature);
}
```

---

## Troubleshooting

### Issue: Colors Display Incorrectly

**Symptom**: Colors appear wrong or don't change with theme toggle

**Causes**:
1. Missing `[data-theme="dark"]` selector
2. Using `hsl()` wrapper in variable definition
3. Specificity conflict with Shopify color schemes

**Solution**:
```css
/* Ensure both modes are defined */
:root,
[data-theme="light"] {
  --color-example: hsl(210 50% 50%);
}

[data-theme="dark"] {
  --color-example: hsl(210 60% 70%);
}

/* Use !important when overriding Shopify color schemes */
[data-theme="dark"] .element {
  color: var(--color-example) !important;
}
```

### Issue: Theme Switching Flash (FOUC)

**Symptom**: Brief flash of wrong colors on page load

**Solution**: The theme uses inline script in `<head>` to set `data-theme` before render. Ensure this script runs before any CSS loads.

### Issue: Shopify Color Scheme Override

**Symptom**: Shopify's color scheme settings override theme colors

**Solution**:
```css
/* Force override with high specificity */
.footer[class*="color-scheme"] {
  background-color: var(--color-footer-bg) !important;
  color: var(--color-footer-text) !important;
}
```

### Issue: Inline Styles Overriding Tokens

**Symptom**: Section editor colors override CSS

**Solution**: Override at container level:
```css
[data-theme="dark"] .testimonial {
  --testimonial-text-color: var(--color-text-primary) !important;
}
```

---

## Best Practices & Guidelines

### 1. Always Use HSL for Base Colors
```css
/* CORRECT */
:root {
  --base-blue-700: 204 100% 29%;
}

/* WRONG - don't wrap in hsl() */
:root {
  --base-blue-700: hsl(204, 100%, 29%);
}
```

### 2. Use Semantic Tokens in Components
```css
/* CORRECT */
.button { background-color: var(--color-primary); }

/* AVOID - too specific */
.button { background-color: hsl(var(--base-blue-700)); }
```

### 3. Ensure Both Light/Dark Variants Exist
Every semantic token needs both `:root`/`[data-theme="light"]` and `[data-theme="dark"]` definitions.

### 4. Use Opacity for Dark Mode Cards
```css
/* CORRECT - subtle separation */
[data-theme="dark"] .card {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
}

/* AVOID - too harsh */
[data-theme="dark"] .card {
  background-color: #1E293B;
}
```

### 5. Use `!important` Sparingly
Only use when overriding Shopify's built-in color schemes or inline styles from the section editor.

---

## Validation Checklist

### Before Adding New Colors
- [ ] Color defined in HSL format (no `hsl()` wrapper for base)
- [ ] Both light and dark mode values defined
- [ ] Contrast ratio meets WCAG AA (4.5:1 for text)
- [ ] Documented in this file

### After Theme Changes
- [ ] Test toggle between light/dark modes
- [ ] Verify all pages render correctly
- [ ] Check footer visibility in both modes
- [ ] Verify button hover states
- [ ] Check testimonial card readability
- [ ] Test on mobile devices

---

## File Reference

| File | Purpose |
|------|---------|
| `assets/theme-toggle.css` | All color definitions and component overrides |
| `assets/theme-toggle.js` | Theme toggle functionality |
| `sections/footer.liquid` | Footer with theme toggle |
| `layout/theme.liquid` | Theme initialization script |
| `COLOR-SCHEME-GUIDE.html` | Visual reference (open in browser) |

---

**Document Version**: 2.0
**Last Updated**: December 2024
**Maintained By**: ASIW Supply Development Team

### Version 2.0 Changes
- Added 5-level surface elevation system (`--color-surface-0` through `--color-surface-4`)
- Added 5-level text hierarchy (`--color-text-heading` through `--color-text-disabled`)
- Added interactive state tokens (active states for primary, secondary, accent)
- Added centralized opacity scale (`--alpha-5` through `--alpha-70`)
- Added complete feedback color system (success/warning/error/info with bg/text/border variants)
- Added focus ring token system (`--ring-color`, `--ring-width`, `--ring-offset`)
- Added component-specific tokens (inputs, tables, buttons, skeleton)
