# ASIW Supply Website Context Document
## For Boss-to-Developer Translation App

> **Version:** 1.0.0
> **Last Updated:** December 2, 2024
> **Theme Base:** Shopify Dawn 15.4.0
> **Business:** ASIW Supply - Irrigation & Pump Equipment Wholesale

---

## Quick Reference: Business to Technical Terms

| What Boss Says | Technical Term | Where to Find It |
|----------------|----------------|------------------|
| "The top bar" | Promo Bar / Announcement Bar | `sections/header2.liquid` |
| "The menu" / "Navigation" | Header / Navbar | `sections/header2.liquid` |
| "Logo" | Logo image | Theme Settings > Logo |
| "The big video/image at top" | Hero Section | `sections/hero-video.liquid` or `sections/banner-image-hero.liquid` |
| "The banner" / "Blue bar" | CTA Banner | `sections/cta-banner.liquid` |
| "Product boxes" / "Product cards" | Product Grid / Card | `sections/product-grid.liquid` or `snippets/card-product.liquid` |
| "Reviews" / "Testimonials" | Testimonials Section | `sections/testimonials.liquid` |
| "The icons row" | Features Bar | `sections/features-bar.liquid` |
| "Brand logos" | Brand Spotlight / Content Block | `sections/content-block.liquid` or `sections/brandspotlight.liquid` |
| "Footer" | Footer | `sections/footer.liquid` |
| "Contact page" | Contact Form Page | `templates/page.contact.json` |
| "Wholesale page" | Wholesale Landing Page | `templates/page.wholesale.json` |
| "Product page" | Product Template | `templates/product.json` + `sections/main-product.liquid` |
| "Collection page" / "Category page" | Collection Template | `templates/collection.json` |
| "Homepage" | Index Template | `templates/index.json` |
| "Make it darker/lighter" | Color Scheme / Dark Mode | Theme Settings > Colors or `assets/theme-toggle.css` |
| "Change the font" | Typography | Theme Settings > Typography |
| "Add spacing" / "More room" | Padding / Margin | Section settings (padding_top, padding_bottom) |
| "Make it wider" | Container Width / Full Width | Section settings (max_width, full_width) |
| "Mobile version" | Responsive / Mobile Layout | Usually in same section with mobile-specific settings |

---

## Site Structure Overview

### Page Types

```
ASIW Supply Website
├── Homepage (index.json)
│   ├── Hero Video
│   ├── Product Highlights (3 columns)
│   ├── Features Bar (4 icons)
│   ├── Wholesale CTA Banner
│   ├── Brand Logos
│   ├── Berkeley Parts CTA Banner
│   └── Customer Testimonials
│
├── Product Pages
│   ├── Standard Product (product.json)
│   ├── Amazon Pumps (product.amazon-pumps.json)
│   ├── Amazon Parts (product.amazon-pump-parts.json)
│   └── RFQ Products (product.rfq.json)
│
├── Collection Pages
│   ├── All Collections (list-collections.json)
│   ├── Standard Collection (collection.json)
│   └── Berkeley Parts (collection.berkeley-parts.json)
│
├── Special Pages
│   ├── Wholesale (page.wholesale.json) ← Important landing page
│   ├── About Us (page.about-us.json)
│   ├── Contact (page.contact.json)
│   ├── Breakdowns (page.breakdowns.json) ← Boss-to-dev translator tool
│   ├── Berkeley Replacement Parts (page.berkeley-replacement-parts.json)
│   └── Request to Quote (page.request-to-quote.json)
│
├── Standard Pages
│   ├── Cart (cart.json)
│   ├── Search (search.json)
│   ├── 404 Error (404.json)
│   └── Blog/Articles (blog.json, article.json)
│
└── Global Elements (appear on all pages)
    ├── Header with Promo Bar (header-group.json → header2.liquid)
    └── Footer (footer-group.json → footer.liquid)
```

---

## Global Elements

### Header (`sections/header2.liquid`)

The header appears on every page and has multiple parts:

#### Promo Bar (Top Strip)
- **What it is:** Colored bar at very top with promotional message
- **Current:** "December Deals! Wrap up the year with incredible savings..."
- **Customizable:**
  - Message text
  - Link destination
  - Background color (currently navy blue #1e3a8a)
  - Text color (currently white)
- **Can be hidden:** Yes (show_promo_bar setting)

#### Main Header
- **Logo:** Left side, clickable to homepage
- **Store Hours:** Displays "Store Hours: 7:30am - 4:30pm"
- **Search Bar:** Center, expandable, placeholder text customizable
- **Account Icon:** Right side, leads to login/account
- **Cart Icon:** Right side, shows cart count

#### Navigation Bar
- **Shop All Button:** Green dropdown button with categories
  - Links to: Pumps, Pump Parts, PVC Pipe, Berkeley Parts
  - "All Products" link at bottom
- **Main Nav Items:** Wholesale, About, Contact, Deals
- **Quick Links/Recommendations:** Can show suggested searches

#### Header Settings Available:
| Setting | What it Controls |
|---------|-----------------|
| `header_full_width` | Whether header stretches full screen |
| `promo_message` | Text in top promo bar |
| `promo_bar_color` | Background color of promo bar |
| `logo_height` | Size of logo (currently 90px) |
| `search_placeholder` | Text shown in empty search box |
| `shop_all_text` | Text on main shop button |
| `header_bg_color` | Background of main header |
| `nav_bg_color` | Background of navigation bar |
| `accent_color` | Primary brand color for highlights |

---

### Footer (`sections/footer.liquid`)

#### Footer Columns
1. **Products:** Links to product categories
2. **Customer Support:** Support-related links
3. **Company:** About, policies, etc.

#### Footer Features
- Social media icons
- Country/language selectors
- Payment method icons
- Policy links
- Newsletter signup (currently disabled)
- Theme toggle (light/dark mode)
- Version number display

---

## Homepage Sections (In Order)

### 1. Hero Video Section
**File:** `sections/hero-video.liquid`
**Purpose:** Large video background with overlay text and CTA buttons

**Current Content:**
- Heading: "Parts You Need, Service You Trust"
- Subtext: "Supplying contractors, farms, and municipalities..."
- Buttons: "Discover Our Products" + "About ASIW"

**Customization Options:**
| Setting | Options |
|---------|---------|
| Video | Upload MP4 file |
| Overlay opacity | 0-100% (currently 50%) |
| Height | small, medium, large |
| Content position | 9 positions (top-left to bottom-right) |
| Content alignment | left, center, right |
| Show text box | Toggle background behind text |

---

### 2. Product Highlights Grid
**File:** `sections/product-grid.liquid`
**Purpose:** 3-column product showcase

**Current Columns:**
1. **Water Pumps:** Goulds J5S, J10S, GT15, GT20
2. **Pump Parts:** Casings, impellers, rebuild kits
3. **Custom Length PVC:** 1-1/2", 2-1/2", 3", 4" pipes

**Customization Options:**
- Column titles
- Products displayed (product picker)
- Show/hide badges and ratings
- Review count text
- View All link per column
- Mobile visibility per column

---

### 3. Features Bar
**File:** `sections/features-bar.liquid`
**Purpose:** Row of 4 feature highlights with icons

**Current Features:**
1. Authorized Distributor
2. Exclusive Wholesale Discounts
3. Dedicated Support
4. Nationwide Delivery

**Customization Options:**
| Setting | What it Does |
|---------|--------------|
| Icons | Upload PNG images |
| Titles | Text for each feature |
| Descriptions | Subtext for each feature |
| Columns | 2-4 on desktop, 1-4 on mobile |
| Background color | Section background |
| Icon background radius | Rounded corners on icon circles |
| Show dividers | Lines between items |

---

### 4. CTA Banners
**File:** `sections/cta-banner.liquid`
**Purpose:** Promotional banner with button

**Current Banners:**
1. **Wholesale Banner:** "Wholesale Pricing Available..." → Goes to /wholesale
2. **Berkeley Banner:** "Find replacement parts for 100+ Berkeley Pumps" → Goes to Berkeley collection

**Customization Options:**
| Setting | What it Does |
|---------|--------------|
| Title | Main banner text |
| Subtitle | Secondary text (optional) |
| Button text | CTA button label |
| Button link | Where button goes |
| Background color | Banner background |
| Enable gradient | Gradient effect |
| Button colors | Background, text, hover states |
| Font sizes | Title, subtitle, button |
| Padding | Spacing around content |
| Sticky | Make banner stick while scrolling |
| Animation | Slide-in effect |

---

### 5. Brand Logos Section
**File:** `sections/content-block.liquid` (features_highlight block)
**Purpose:** Grid of partner brand logos

**Current Brands:**
Goulds, Netafim, Pentair Sta-Rite, Charlotte Pipe, Berkeley, Lesso, Hunter, Evoqua, Bermad, Rain Bird, Dura

**Customization Options:**
- Up to 12 brand images
- Mobile columns (1-4)
- Desktop columns (2-12)
- Container width percentage
- Background color
- Debug outlines for alignment

---

### 6. Customer Testimonials
**File:** `sections/testimonials.liquid`
**Purpose:** Customer review carousel/grid

**Current Reviews:** 6 reviews with 5-star ratings

**Customization Options:**
| Setting | What it Does |
|---------|--------------|
| Badge text | Label like "Customer Reviews" |
| Heading | Section title |
| Description | Intro text |
| Star color | Color of rating stars |
| Quote icon | Custom quote character |
| Review text size | Font size of reviews |
| Colors | Name, location, service badge |
| Padding | Top and bottom spacing |

**Review Block Options:**
- Rating (1-5 stars)
- Review text
- Customer name
- Customer location/business
- Service type badge

---

## Wholesale Page Structure

**Template:** `templates/page.wholesale.json`

### Sections in Order:

1. **Wholesale Hero** (`wholesale-hero.liquid`)
   - Large headline: "Wholesale & Bulk Pricing"
   - Subheadline: "Unlock Exclusive Discounts"
   - Description text
   - CTA button to form

2. **Premium Brands Grid** (`brands-grid.liquid`)
   - 3 category cards: Pumps, Sprinklers & Filters, Controllers
   - Lists brands available for each category
   - "WHOLESALE" badge on each brand

3. **Why Choose Us** (`why-choose-us.liquid`)
   - 3 feature cards:
     - Save on bulk orders
     - Direct access to top brands
     - Dedicated wholesale support
   - Each with icon, badge, and description

4. **Wholesale Application Form** (`wholesale-form.liquid`)
   - Contact name field
   - Business name field
   - Business email field
   - Submit button
   - Tags submissions for follow-up

---

## Product Pages

### Main Product Section (`sections/main-product.liquid`)

**Components:**
- Product images/gallery
- Title and vendor
- Price display
- Variant selector (size, color, etc.)
- Quantity input
- Add to Cart button
- Product description
- Share buttons

**Special Product Templates:**
- **RFQ Products:** Products priced at $1 show "View Parts" button instead
- **Amazon Products:** Custom styling for Amazon pump products

---

## Collection Pages

### Collection Product Grid (`sections/main-collection-product-grid.liquid`)

**Features:**
- Filterable product grid
- Sorting options
- Pagination
- Loading spinner on filter
- Product cards with:
  - Product image
  - Title
  - Price
  - Quick add button (optional)
  - Rating stars (optional)

**Customization Options:**
| Setting | Options |
|---------|---------|
| Products per page | 8-36 |
| Columns desktop | 1-6 |
| Columns mobile | 1-2 |
| Image ratio | Adapt, Portrait, Square |
| Show secondary image | Hover effect |
| Show vendor | Brand name |
| Show rating | Star display |
| Quick add | None, Standard, Bulk |
| Enable filtering | Toggle filters |
| Filter type | Horizontal, Vertical, Drawer |
| Enable sorting | Toggle sort dropdown |

---

## Color System

### Theme Color Schemes

The site uses Shopify's color scheme system. Key schemes:

| Scheme | Primary Use |
|--------|-------------|
| scheme-1 | Default/Light backgrounds |
| scheme-2 | Dark backgrounds (footer, header2) |
| scheme-4 | Accent sections (wholesale hero) |

### Key Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | #1d6ae5 | CTA banners, buttons |
| Dark Navy | #1e3a8a | Promo bar, accents |
| Green | #4caf50 | Success buttons |
| Light Gray | #f5f7fa | Section backgrounds |
| Dark Text | #2b2c2d | Headings, body |
| Medium Gray | #64748b | Secondary text |

### Dark Mode

The site supports dark mode via `assets/theme-toggle.css`. Toggle in footer settings.

---

## File Reference

### Section Files (Custom)

| File | Purpose |
|------|---------|
| `header2.liquid` | Main header with nav |
| `hero-video.liquid` | Video background hero |
| `banner-image-hero.liquid` | Image background hero |
| `cta-banner.liquid` | Promotional banners |
| `product-grid.liquid` | 3-column product showcase |
| `features-bar.liquid` | Icon features row |
| `features-icons.liquid` | Alternative icon grid |
| `testimonials.liquid` | Customer reviews |
| `reviews-summary.liquid` | Rating summary block |
| `content-block.liquid` | Flexible content area |
| `brands-grid.liquid` | Brand/category cards |
| `brandspotlight.liquid` | Brand logo grid |
| `wholesale-hero.liquid` | Wholesale page hero |
| `wholesale-form.liquid` | Application form |
| `why-choose-us.liquid` | Feature cards |
| `contact-form.liquid` | Contact page form |

### Snippet Files (Reusable Components)

| File | Purpose |
|------|---------|
| `card-product.liquid` | Product card display |
| `card-collection.liquid` | Collection card display |
| `price.liquid` | Price formatting |
| `facets.liquid` | Filter sidebar |
| `pagination.liquid` | Page navigation |
| `loading-spinner.liquid` | Loading indicator |
| `header-mega-menu.liquid` | Mega menu dropdown |
| `header-dropdown-menu.liquid` | Simple dropdown |

### Asset Files (CSS/JS)

| File | Purpose |
|------|---------|
| `theme-toggle.css` | Dark mode styles |
| `section-debug.js` | Debug inspector tool |
| `component-card.css` | Card styling |
| `template-collection.css` | Collection page styles |
| `facets.js` | Filter functionality |

---

## Common Change Requests

### "Change the promo bar message"
→ Edit `sections/header-group.json` → `header2_WRTrXp` → `promo_message`

### "Update the hero video/text"
→ Edit `templates/index.json` → `home_video_hero2_EDKM6A` section

### "Add/remove products from homepage"
→ Edit `templates/index.json` → `product_highlights_nY6mri` → add/remove product blocks

### "Change banner text/colors"
→ Edit `templates/index.json` → find `cta-banner` section → modify settings

### "Update testimonials"
→ Edit `templates/index.json` → `customerreview_jDbTcx` → edit review blocks

### "Change navigation links"
→ Edit `sections/header-group.json` → `header2_WRTrXp` → nav_item blocks

### "Update footer links"
→ Shopify Admin → Navigation → Edit footer menus (footer-products, footer-support, footer-company)

### "Change site colors"
→ Shopify Admin → Theme Settings → Colors

### "Change fonts"
→ Shopify Admin → Theme Settings → Typography

### "Update wholesale page"
→ Edit `templates/page.wholesale.json`

---

## Notes for Translation App

### Understanding Request Types

1. **Content Changes:** Text, images, links → Usually JSON template files
2. **Style Changes:** Colors, spacing, sizes → Section settings or CSS
3. **Structural Changes:** Adding/removing sections → Template JSON + possibly new section files
4. **Functionality Changes:** New features → Liquid code + JS

### Priority Indicators

When translating requests, consider:
- **Urgent:** Site broken, checkout issues, major display problems
- **High:** Homepage changes, navigation updates, pricing displays
- **Medium:** Style tweaks, minor content updates
- **Low:** Nice-to-have features, minor visual adjustments

### Clarification Questions to Ask

1. "Which page is this on?" (homepage, product page, wholesale page, etc.)
2. "Is this for desktop, mobile, or both?"
3. "What should happen when clicked?" (for interactive elements)
4. "Should this replace existing content or add to it?"
5. "Are there similar examples on the current site?"

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v01.00.18 | Dec 2, 2024 | Collection card images fix |
| v01.00.17 | Dec 2, 2024 | Debug tool enhancements |
| v01.00.16 | Dec 2, 2024 | Filter loading spinner |
| v01.00.15 | Dec 2, 2024 | Collection filter fix |

*Current theme version displayed in footer*
