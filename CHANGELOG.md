# ASIW Supply Theme Changelog

All notable changes to the ASIW Supply Shopify theme are documented in this file.

## [v01.00.12] - 2025-12-02

### Added
- **Layout properties in section debug**: Display type, position, width, height
- **Aspect ratio detection**: Shows aspect-ratio CSS property when set
- **Padding-bottom tracking**: Highlights Dawn's ratio trick (`--ratio-percent`)
- **Object-fit for images**: Shows contain/cover settings
- Color-coded layout tags (cyan=layout, purple=position, orange=warning)

## [v01.00.11] - 2025-12-02

### Fixed
- Improved collection card consistency with CSS aspect-ratio property
- Override Dawn's padding-based ratio trick for reliable square cards
- Images use object-fit: contain with gray background for uniform display
- Consistent card heading font size (14px) and spacing

## [v01.00.10] - 2025-12-02

### Fixed
- Collection cards now display with consistent square aspect ratio and equal heights
- Copy All button in section debug modal now works with fallback for all browsers
- Added error state feedback when clipboard copy fails

### Added
- Fallback copy method using execCommand for older browsers/contexts

## [v01.00.09] - 2025-12-02

### Fixed
- "All Products" link in Shop All dropdown now correctly goes to `/collections/all` instead of `/collections`

## [v01.00.08] - 2025-12-02

### Added
- Prominent "Copy All" button with text label in section debug modal
- Green success state feedback when copy completes
- Checkmark icon and "Copied!" text on successful copy

## [v01.00.07] - 2025-12-02

### Added
- **Section Debug Component Inspector**: Clicking section debug buttons now opens a modal showing all components
- Component details include: selector, text color, background color, border, font size/weight
- File location hints based on class name patterns (e.g., `sections/testimonials.liquid`)
- Copy button exports all component data to clipboard
- Press ESC or click overlay to close modal

### Changed
- Debug button icon changed from copy to search/inspect icon

## [v01.00.06] - 2025-12-02

### Fixed
- Testimonial card interior now seamless with card background
- Removed borders from `.testimonial__customer-info` container
- Removed borders from blockquote elements inside testimonial cards
- Set transparent backgrounds on interior elements

## [v01.00.05] - 2025-12-02

### Fixed
- Increased testimonial card contrast in dark mode
- Changed card background from `--color-card-bg` (17% lightness) to `--color-surface-2` (24% lightness)
- Added subtle shadow (`box-shadow: 0 2px 8px rgba(0,0,0,0.25)`) for depth
- Changed border to `--color-border-light` for better visibility
- Hover state uses `--color-surface-3` (26% lightness) with enhanced shadow

## [v01.00.04] - 2025-12-02

### Fixed
- Added card separation for testimonials in dark mode
- Testimonial cards now have visible background, border, and border-radius

## [v01.00.03] - 2025-12-02

### Added
- **Semantic Color Tokens (Option B)**: Implemented CSS custom property architecture
- Two-tier token system: Base HSL colors + Semantic tokens
- Dark mode overrides using `[data-theme="dark"]` selector

### Changed
- Updated sections with semantic color tokens:
  - `header2.liquid` - 14 section-level CSS custom properties
  - `banner-image-hero.liquid` - CSS vars for icon-text block
  - `wholesale-form.liquid` - Enhanced dark mode overrides
  - `contact-form.liquid` - 12 CSS custom properties for form elements
  - `features-icons.liquid` - Enhanced dark mode overrides

### Fixed
- Dark mode styling consistency across all updated sections

## [v01.00.02] - 2025-12-02

### Changed
- Moved version display to footer copyright area
- Version now displays in monospace font with reduced opacity

## [v01.00.01] - 2025-12-02

### Fixed
- Footer theme toggle section bar made transparent
- Removed visible background from theme toggle area

## [v01.00.00] - 2025-12-02

### Added
- Initial version number display in bottom right corner
- Version tracking system for theme changes

---

## Pre-versioning Changes

### Dark Mode Improvements
- Removed testimonial card borders/separation in dark mode
- Updated footer background color to `#212936`
- Fixed header icons to use consistent 24x24 viewBox SVGs

### Header Fixes
- Replaced header PNG icons with inline SVGs using `fill="currentColor"`
- Fixed header icons in dark mode (PNGs don't respond to CSS color)
- Added JavaScript fallback for icon color based on theme
- Added debug tools for diagnosing header icon issues

### Content Updates
- Updated promo bar to December-themed message

---

## Version Format

Versions follow the format: `vMM.mm.pp`
- `MM` - Major version (significant features or breaking changes)
- `mm` - Minor version (new features, enhancements)
- `pp` - Patch version (bug fixes, small improvements)

Current: **v01.00.08**
