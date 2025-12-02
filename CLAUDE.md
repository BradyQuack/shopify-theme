# Claude Instructions for ASIW Supply Shopify Theme

## First Steps
1. Read `THEME-STRUCTURE.md` to understand the architecture
2. Check `git status` to see current state

## Naming Conventions
- **Templates**: kebab-case (e.g., `page.wholesale.json`, `product.amazon-pumps.json`)
- **Sections**: descriptive kebab-case (e.g., `wholesale-form.liquid`, `features-icons.liquid`)
- **CSS**: `section-*.css` or `component-*.css`

## Key Files
| File | Purpose |
|------|---------|
| `THEME-STRUCTURE.md` | Architecture documentation |
| `sections/header-group.json` | Header configuration (uses `header2`) |
| `sections/footer-group.json` | Footer configuration |
| `templates/index.json` | Homepage |
| `templates/page.wholesale.json` | Wholesale landing page |

## Custom Sections (Not Dawn)
- `wholesale-*.liquid` - Wholesale page components
- `brands-grid.liquid` - Brand showcase
- `features-*.liquid` - Feature displays
- `reviews-summary.liquid` - Rating summary
- `hero-video.liquid` - Video background hero
- `testimonials.liquid` - Customer reviews
- `product-grid.liquid` - Product columns
- `cta-banner.liquid` - Call-to-action banners
- `content-block.liquid` - Flexible content
- `brandspotlight.liquid` - Brand logos grid

## Before Making Changes
- Verify section is actually used: `grep -r "type\":\"section-name\"" templates/`
- Check for related CSS: `ls assets/*section-name*`
- Read the section file's header comment for context

## Git Workflow
- Branch naming: `claude/*` prefix required
- Always push with `-u origin branch-name`
