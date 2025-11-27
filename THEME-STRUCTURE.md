# ASIW Supply Theme Structure

## Overview

This Shopify theme is based on Dawn 15.2.0 with custom sections for wholesale/B2B functionality.

## Directory Structure

```
├── assets/          # CSS, JS, and static files
├── config/          # Theme settings (settings_schema.json, settings_data.json)
├── layout/          # Base layouts (theme.liquid, password.liquid)
├── locales/         # Translation files
├── sections/        # Reusable section components
├── snippets/        # Partial templates
└── templates/       # Page templates (JSON format)
```

## Naming Conventions

### Templates
- Format: `{type}.{handle}.json` (kebab-case)
- Examples: `page.wholesale.json`, `product.amazon-pumps.json`

### Sections
- Custom sections: descriptive kebab-case names
- Dawn sections: original names preserved

### CSS Files
- Component CSS: `component-*.css`
- Section CSS: `section-*.css`

## Key Custom Sections

| Section | Purpose | Used On |
|---------|---------|---------|
| `wholesale-hero.liquid` | Hero with CTA for wholesale page | page.wholesale.json |
| `wholesale-form.liquid` | Wholesale application form | page.wholesale.json |
| `brands-grid.liquid` | Premium brands showcase grid | page.wholesale.json |
| `why-choose-us.liquid` | Feature cards with icons | page.wholesale.json |
| `features-icons.liquid` | 4-up feature icons grid | page.wholesale.json |
| `banner-image-hero.liquid` | Full-width image banner | index.json |
| `reviews-summary.liquid` | Aggregate rating display | index.json |
| `hero-video.liquid` | Video background hero | index.json |
| `testimonials.liquid` | Customer review carousel | index.json |
| `product-grid.liquid` | Multi-column product display | index.json |
| `features-bar.liquid` | Horizontal feature strip | index.json |
| `cta-banner.liquid` | Call-to-action banner | index.json |
| `content-block.liquid` | Flexible content container | index.json |

## Template → Section Mapping

### Homepage (index.json)
- hero-video
- product-grid
- features-bar
- cta-banner
- content-block
- testimonials
- banner-image-hero (disabled)
- reviews-summary (disabled)

### Wholesale Page (page.wholesale.json)
- wholesale-hero
- features-icons
- brands-grid
- why-choose-us
- wholesale-form

### Product Pages
- main-product
- mobile-product-section1/2/3
- related-products
- collapsible-content

## Header/Footer Groups

### Header (sections/header-group.json)
- announcement-bar (disabled)
- header (disabled - original Dawn)
- header2 (active - custom header)

### Footer (sections/footer-group.json)
- footer

## Video Hero Sections

Multiple video hero variants exist for different use cases:

| Section | Features | Primary Use |
|---------|----------|-------------|
| `hero-video.liquid` | Block-based, height presets | Homepage |
| `video-hero.liquid` | Direct settings, brand text | Test page |
| `home-video-hero.liquid` | Advanced heading styles | Test page |
| `home-video-hero2.liquid` | Dual button support | Test page |

## Dawn Base Sections (Preserved)

Standard Shopify/Dawn sections kept for compatibility:
- main-* sections (product, collection, cart, etc.)
- slideshow, rich-text, image-with-text
- contact-form, collapsible-content
- All cart-* and predictive-search sections

## Assets Organization

### Custom CSS
- `section-*.css` - Section-specific styles
- `component-*.css` - Reusable component styles

### Custom JS
- `product-*.js` - Product page functionality
- `quick-*.js` - Quick add/order features

## Notes

- Test page (`page.test.json`) contains experimental sections
- Original Dawn sections removed: collage, collection-list, featured-blog, featured-product, image-banner, multicolumn, multirow, newsletter, page
- Custom sections use scoped CSS with section ID to prevent conflicts
