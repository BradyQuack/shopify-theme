/**
 * Section Debug - Component Inspector
 * Shows detailed component information for each Shopify section
 * Displays colors, backgrounds, and file locations for every element
 */

(function() {
  'use strict';

  // Icons as SVG strings
  const INSPECT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="M21 21l-4.35-4.35"></path>
  </svg>`;

  const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>`;

  const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>`;

  const DEBUG_MODAL_ID = 'section-debug-modal';

  /**
   * Convert RGB to HEX
   */
  function rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') {
      return 'transparent';
    }
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return rgb;
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
  }

  /**
   * Get element selector for display
   */
  function getElementSelector(el) {
    let selector = el.tagName.toLowerCase();
    if (el.id) selector += '#' + el.id;
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.split(' ').filter(c => c.trim() && !c.startsWith('shopify')).slice(0, 3);
      if (classes.length) selector += '.' + classes.join('.');
    }
    return selector;
  }

  /**
   * Get the primary class name for file location hint
   */
  function getPrimaryClass(el) {
    if (!el.className || typeof el.className !== 'string') return null;
    const classes = el.className.split(' ').filter(c => c.trim() && !c.startsWith('shopify') && !c.startsWith('color-'));
    return classes[0] || null;
  }

  /**
   * Guess file location based on class names
   */
  function guessFileLocation(className, sectionType) {
    if (!className) return null;

    // Common patterns
    const patterns = [
      // Section-specific classes
      { regex: /^testimonial/, file: 'sections/testimonials.liquid' },
      { regex: /^header2/, file: 'sections/header2.liquid' },
      { regex: /^footer/, file: 'sections/footer.liquid' },
      { regex: /^features-bar/, file: 'sections/features-bar.liquid' },
      { regex: /^features-icons/, file: 'sections/features-icons.liquid' },
      { regex: /^product-card/, file: 'snippets/product-card.liquid' },
      { regex: /^product-grid/, file: 'sections/product-grid.liquid' },
      { regex: /^banner/, file: 'sections/banner-image-hero.liquid' },
      { regex: /^video-hero/, file: 'sections/hero-video.liquid' },
      { regex: /^wholesale/, file: 'sections/wholesale-*.liquid' },
      { regex: /^contact/, file: 'sections/contact-form.liquid' },
      { regex: /^cta-banner/, file: 'sections/cta-banner.liquid' },
      { regex: /^brand/, file: 'sections/brands-grid.liquid' },
      // Generic patterns
      { regex: /^card/, file: 'snippets/card-*.liquid' },
      { regex: /^button/, file: 'assets/base.css' },
      { regex: /^rte/, file: 'snippets/article-*.liquid' },
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(className)) {
        return pattern.file;
      }
    }

    // Default: try section type
    if (sectionType) {
      return `sections/${sectionType}.liquid`;
    }

    return 'assets/theme-toggle.css (dark mode overrides)';
  }

  /**
   * Get CSS variable if used
   */
  function getCSSVariable(el, property) {
    // Check inline style for var() usage
    const inlineStyle = el.getAttribute('style') || '';
    const varMatch = inlineStyle.match(new RegExp(`${property}:\\s*var\\(([^)]+)\\)`));
    if (varMatch) return varMatch[1];

    return null;
  }

  /**
   * Scan all components within a section
   */
  function scanSectionComponents(section) {
    const components = [];
    const sectionType = getSectionType(section);

    // Get section info first
    const sectionStyles = window.getComputedStyle(section);
    components.push({
      element: 'Section Container',
      selector: getElementSelector(section),
      className: getPrimaryClass(section),
      textColor: rgbToHex(sectionStyles.color),
      bgColor: rgbToHex(sectionStyles.backgroundColor),
      fileHint: guessFileLocation(getPrimaryClass(section), sectionType),
      isSection: true
    });

    // Find notable child elements
    const selectors = [
      // Headings
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      // Text containers
      'p', 'blockquote', '.rte',
      // Cards and containers
      '[class*="card"]', '[class*="item"]', '[class*="block"]',
      // Media elements (important for debugging images)
      '.media', '[class*="media"]', 'img', 'picture', 'video',
      // Specific components
      '[class*="badge"]', '[class*="tag"]', '[class*="pill"]',
      '[class*="button"]', '[class*="btn"]',
      '[class*="icon"]', '[class*="star"]',
      '[class*="nav"]', '[class*="dot"]',
      '[class*="customer"]', '[class*="service"]',
      '[class*="quote"]', '[class*="text"]',
      '[class*="heading"]', '[class*="title"]', '[class*="description"]',
      // Form elements
      'input', 'textarea', 'select', 'label',
    ];

    const seen = new Set();

    selectors.forEach(selector => {
      try {
        const elements = section.querySelectorAll(selector);
        elements.forEach(el => {
          // Skip if already processed
          if (seen.has(el)) return;
          if (el.closest('#' + DEBUG_MODAL_ID)) return;

          // Check if hidden (but still include imgs and media for debugging)
          const isMediaElement = el.tagName === 'IMG' || el.classList.contains('media') || el.closest('.media');
          const isHidden = el.offsetParent === null && el.tagName !== 'BODY';
          if (isHidden && !isMediaElement) return;

          let className = getPrimaryClass(el);
          // For img elements without classes, use tag name
          if (!className && el.tagName === 'IMG') {
            className = 'img';
          }
          if (!className) return; // Skip elements without meaningful classes

          // Skip duplicates by class (but allow multiple images)
          if (seen.has(className) && el.tagName !== 'IMG') return;
          seen.add(className);
          seen.add(el);

          const styles = window.getComputedStyle(el);
          const textColor = rgbToHex(styles.color);
          const bgColor = rgbToHex(styles.backgroundColor);
          const borderColor = rgbToHex(styles.borderColor);

          // For images, always include them for debugging
          const isImage = el.tagName === 'IMG';

          // Only include if it has meaningful styling OR is an image/media
          if (textColor !== 'transparent' || bgColor !== 'transparent' || isImage || isMediaElement) {
            // Get layout properties
            const display = styles.display;
            const position = styles.position;
            const width = styles.width;
            const height = styles.height;
            const aspectRatio = styles.aspectRatio;
            const objectFit = el.tagName === 'IMG' ? styles.objectFit : null;
            const paddingBottom = styles.paddingBottom;
            const visibility = styles.visibility;
            const opacity = styles.opacity;

            // Check for CSS variable in inline style
            const inlineStyle = el.getAttribute('style') || '';
            const ratioVar = inlineStyle.match(/--ratio-percent:\s*([^;]+)/);

            // Image-specific properties
            let imgSrc = null;
            let imgNaturalSize = null;
            let imgLoaded = null;
            if (isImage) {
              imgSrc = el.src ? (el.src.length > 80 ? el.src.substring(0, 80) + '...' : el.src) : 'NO SRC';
              imgNaturalSize = el.naturalWidth && el.naturalHeight ? `${el.naturalWidth}×${el.naturalHeight}` : 'not loaded';
              imgLoaded = el.complete && el.naturalHeight > 0;
            }

            components.push({
              element: el.tagName.toLowerCase(),
              selector: getElementSelector(el),
              className: className,
              textColor: textColor,
              textVar: getCSSVariable(el, 'color'),
              bgColor: bgColor,
              bgVar: getCSSVariable(el, 'background-color'),
              borderColor: borderColor !== 'transparent' ? borderColor : null,
              fileHint: guessFileLocation(className, sectionType),
              fontSize: styles.fontSize,
              fontWeight: styles.fontWeight,
              // Layout properties
              display: display,
              position: position !== 'static' ? position : null,
              width: width,
              height: height,
              aspectRatio: aspectRatio !== 'auto' ? aspectRatio : null,
              objectFit: objectFit !== 'fill' ? objectFit : null,
              paddingBottom: paddingBottom !== '0px' ? paddingBottom : null,
              ratioVar: ratioVar ? ratioVar[1].trim() : null,
              // Visibility
              visibility: visibility !== 'visible' ? visibility : null,
              opacity: opacity !== '1' ? opacity : null,
              isHidden: isHidden,
              // Image-specific
              imgSrc: imgSrc,
              imgNaturalSize: imgNaturalSize,
              imgLoaded: imgLoaded
            });
          }
        });
      } catch (e) {
        // Invalid selector, skip
      }
    });

    return components;
  }

  /**
   * Extract section type from section element
   */
  function getSectionType(section) {
    if (section.dataset.sectionType) {
      return section.dataset.sectionType;
    }

    const innerWithType = section.querySelector('[data-section-type]');
    if (innerWithType && innerWithType.dataset.sectionType) {
      return innerWithType.dataset.sectionType;
    }

    const sectionId = section.id || '';
    const idMatch = sectionId.match(/shopify-section-(?:template--\d+--)?([a-z0-9-]+)/i);
    if (idMatch && idMatch[1]) {
      let type = idMatch[1];
      type = type.replace(/_[a-zA-Z0-9]+$/, '');
      type = type.replace(/-\d+$/, '');
      return type;
    }

    const classes = Array.from(section.classList);
    for (const cls of classes) {
      if (cls.startsWith('section-') && cls !== 'section-padding') {
        return cls.replace('section-', '');
      }
    }

    return null;
  }

  /**
   * Get section ID (cleaned up)
   */
  function getSectionId(section) {
    const fullId = section.id || '';
    return fullId.replace('shopify-section-', '') || 'unknown';
  }

  /**
   * Create the debug modal
   */
  function createModal() {
    const existingModal = document.getElementById(DEBUG_MODAL_ID);
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = DEBUG_MODAL_ID;
    modal.className = 'section-debug-modal';
    modal.innerHTML = `
      <div class="section-debug-modal__overlay"></div>
      <div class="section-debug-modal__content">
        <div class="section-debug-modal__header">
          <h2 class="section-debug-modal__title">Section Components</h2>
          <div class="section-debug-modal__actions">
            <button type="button" class="section-debug-modal__copy-all" title="Copy all component data">
              ${COPY_ICON}
              <span>Copy All</span>
            </button>
            <button type="button" class="section-debug-modal__close" title="Close">
              ${CLOSE_ICON}
            </button>
          </div>
        </div>
        <div class="section-debug-modal__body">
          <div class="section-debug-modal__info"></div>
          <div class="section-debug-modal__components"></div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    modal.querySelector('.section-debug-modal__close').addEventListener('click', hideModal);
    modal.querySelector('.section-debug-modal__overlay').addEventListener('click', hideModal);
    modal.querySelector('.section-debug-modal__copy-all').addEventListener('click', () => copyToClipboard(modal));

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideModal();
    });

    return modal;
  }

  /**
   * Show modal with section component data
   */
  function showModal(section) {
    let modal = document.getElementById(DEBUG_MODAL_ID);
    if (!modal) {
      modal = createModal();
    }

    const sectionType = getSectionType(section);
    const sectionId = getSectionId(section);
    const components = scanSectionComponents(section);
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

    // Update title
    modal.querySelector('.section-debug-modal__title').textContent =
      `${sectionType || sectionId} Components`;

    // Section info
    const infoEl = modal.querySelector('.section-debug-modal__info');
    infoEl.innerHTML = `
      <div class="section-debug-modal__meta">
        <span><strong>Section:</strong> ${sectionType || 'unknown'}</span>
        <span><strong>ID:</strong> ${sectionId}</span>
        <span><strong>Theme:</strong> ${currentTheme}</span>
        <span><strong>Components:</strong> ${components.length}</span>
      </div>
      <div class="section-debug-modal__file">
        <strong>File:</strong> sections/${sectionType || sectionId}.liquid
      </div>
    `;

    // Components list
    const componentsEl = modal.querySelector('.section-debug-modal__components');
    componentsEl.innerHTML = components.map((comp, idx) => `
      <div class="section-debug-modal__component ${comp.isSection ? 'section-debug-modal__component--section' : ''}">
        <div class="section-debug-modal__component-header">
          <span class="section-debug-modal__component-num">#${idx + 1}</span>
          <span class="section-debug-modal__component-name">${comp.element}</span>
          <code class="section-debug-modal__component-class">.${comp.className}</code>
        </div>
        <div class="section-debug-modal__component-details">
          <div class="section-debug-modal__component-row">
            <span class="section-debug-modal__component-label">Selector:</span>
            <code class="section-debug-modal__component-value">${comp.selector}</code>
          </div>
          <div class="section-debug-modal__component-row">
            <span class="section-debug-modal__component-label">Text Color:</span>
            <span class="section-debug-modal__component-value">
              <span class="section-debug-modal__color-swatch" style="background-color: ${comp.textColor}"></span>
              ${comp.textColor}
              ${comp.textVar ? `<code class="section-debug-modal__var">${comp.textVar}</code>` : ''}
            </span>
          </div>
          <div class="section-debug-modal__component-row">
            <span class="section-debug-modal__component-label">Background:</span>
            <span class="section-debug-modal__component-value">
              <span class="section-debug-modal__color-swatch" style="background-color: ${comp.bgColor}; ${comp.bgColor === 'transparent' ? 'background-image: linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%); background-size: 8px 8px; background-position: 0 0, 0 4px, 4px -4px, -4px 0px;' : ''}"></span>
              ${comp.bgColor}
              ${comp.bgVar ? `<code class="section-debug-modal__var">${comp.bgVar}</code>` : ''}
            </span>
          </div>
          ${comp.borderColor ? `
            <div class="section-debug-modal__component-row">
              <span class="section-debug-modal__component-label">Border:</span>
              <span class="section-debug-modal__component-value">
                <span class="section-debug-modal__color-swatch" style="background-color: ${comp.borderColor}"></span>
                ${comp.borderColor}
              </span>
            </div>
          ` : ''}
          <div class="section-debug-modal__component-row">
            <span class="section-debug-modal__component-label">Font:</span>
            <span class="section-debug-modal__component-value">${comp.fontSize} / ${comp.fontWeight}</span>
          </div>
          <div class="section-debug-modal__component-row section-debug-modal__component-row--layout">
            <span class="section-debug-modal__component-label">Layout:</span>
            <span class="section-debug-modal__component-value">
              <code class="section-debug-modal__layout-tag">${comp.display}</code>
              ${comp.position ? `<code class="section-debug-modal__layout-tag section-debug-modal__layout-tag--position">${comp.position}</code>` : ''}
            </span>
          </div>
          <div class="section-debug-modal__component-row">
            <span class="section-debug-modal__component-label">Size:</span>
            <span class="section-debug-modal__component-value">${comp.width} × ${comp.height}</span>
          </div>
          ${comp.aspectRatio ? `
            <div class="section-debug-modal__component-row">
              <span class="section-debug-modal__component-label">Aspect Ratio:</span>
              <span class="section-debug-modal__component-value"><code class="section-debug-modal__layout-tag section-debug-modal__layout-tag--highlight">${comp.aspectRatio}</code></span>
            </div>
          ` : ''}
          ${comp.paddingBottom ? `
            <div class="section-debug-modal__component-row">
              <span class="section-debug-modal__component-label">Padding-Bottom:</span>
              <span class="section-debug-modal__component-value"><code class="section-debug-modal__layout-tag section-debug-modal__layout-tag--warning">${comp.paddingBottom}</code></span>
            </div>
          ` : ''}
          ${comp.ratioVar ? `
            <div class="section-debug-modal__component-row">
              <span class="section-debug-modal__component-label">--ratio-percent:</span>
              <span class="section-debug-modal__component-value"><code class="section-debug-modal__layout-tag section-debug-modal__layout-tag--warning">${comp.ratioVar}</code></span>
            </div>
          ` : ''}
          ${comp.objectFit ? `
            <div class="section-debug-modal__component-row">
              <span class="section-debug-modal__component-label">Object-Fit:</span>
              <span class="section-debug-modal__component-value"><code class="section-debug-modal__layout-tag">${comp.objectFit}</code></span>
            </div>
          ` : ''}
          ${comp.visibility || comp.opacity || comp.isHidden ? `
            <div class="section-debug-modal__component-row">
              <span class="section-debug-modal__component-label">Visibility:</span>
              <span class="section-debug-modal__component-value">
                ${comp.isHidden ? '<code class="section-debug-modal__layout-tag section-debug-modal__layout-tag--error">HIDDEN (no offsetParent)</code>' : ''}
                ${comp.visibility ? `<code class="section-debug-modal__layout-tag section-debug-modal__layout-tag--warning">${comp.visibility}</code>` : ''}
                ${comp.opacity ? `<code class="section-debug-modal__layout-tag section-debug-modal__layout-tag--warning">opacity: ${comp.opacity}</code>` : ''}
              </span>
            </div>
          ` : ''}
          ${comp.imgSrc ? `
            <div class="section-debug-modal__component-row">
              <span class="section-debug-modal__component-label">Image Src:</span>
              <code class="section-debug-modal__component-value section-debug-modal__img-src">${comp.imgSrc}</code>
            </div>
            <div class="section-debug-modal__component-row">
              <span class="section-debug-modal__component-label">Natural Size:</span>
              <span class="section-debug-modal__component-value">
                ${comp.imgLoaded ? `<code class="section-debug-modal__layout-tag section-debug-modal__layout-tag--success">${comp.imgNaturalSize}</code>` : `<code class="section-debug-modal__layout-tag section-debug-modal__layout-tag--error">${comp.imgNaturalSize}</code>`}
                ${comp.imgLoaded ? '✓ loaded' : '✗ NOT LOADED'}
              </span>
            </div>
          ` : ''}
          <div class="section-debug-modal__component-row">
            <span class="section-debug-modal__component-label">File:</span>
            <code class="section-debug-modal__component-value section-debug-modal__file-hint">${comp.fileHint || 'unknown'}</code>
          </div>
        </div>
      </div>
    `).join('');

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Store data for copy
    modal.dataset.components = JSON.stringify(components, null, 2);
    modal.dataset.sectionType = sectionType;
  }

  /**
   * Hide modal
   */
  function hideModal() {
    const modal = document.getElementById(DEBUG_MODAL_ID);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  /**
   * Copy text using fallback method
   */
  function fallbackCopyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    let success = false;
    try {
      success = document.execCommand('copy');
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }

    document.body.removeChild(textarea);
    return success;
  }

  /**
   * Copy component data to clipboard
   */
  async function copyToClipboard(modal) {
    const components = JSON.parse(modal.dataset.components || '[]');
    const sectionType = modal.dataset.sectionType || 'unknown';
    const theme = document.documentElement.getAttribute('data-theme') || 'light';

    let text = `SECTION COMPONENT DEBUG: ${sectionType}\n`;
    text += `Theme Mode: ${theme}\n`;
    text += `${'='.repeat(60)}\n\n`;

    components.forEach((comp, idx) => {
      text += `#${idx + 1} ${comp.element} (.${comp.className})\n`;
      text += `   Selector: ${comp.selector}\n`;
      text += `   Text Color: ${comp.textColor}\n`;
      text += `   Background: ${comp.bgColor}\n`;
      if (comp.borderColor) text += `   Border: ${comp.borderColor}\n`;
      text += `   Font: ${comp.fontSize} / ${comp.fontWeight}\n`;
      text += `   Layout: ${comp.display}${comp.position ? ` (${comp.position})` : ''}\n`;
      text += `   Size: ${comp.width} × ${comp.height}\n`;
      if (comp.aspectRatio) text += `   Aspect-Ratio: ${comp.aspectRatio}\n`;
      if (comp.paddingBottom) text += `   Padding-Bottom: ${comp.paddingBottom}\n`;
      if (comp.ratioVar) text += `   --ratio-percent: ${comp.ratioVar}\n`;
      if (comp.objectFit) text += `   Object-Fit: ${comp.objectFit}\n`;
      if (comp.isHidden) text += `   ⚠️ HIDDEN: no offsetParent\n`;
      if (comp.visibility) text += `   Visibility: ${comp.visibility}\n`;
      if (comp.opacity) text += `   Opacity: ${comp.opacity}\n`;
      if (comp.imgSrc) {
        text += `   Image Src: ${comp.imgSrc}\n`;
        text += `   Natural Size: ${comp.imgNaturalSize} ${comp.imgLoaded ? '✓ loaded' : '✗ NOT LOADED'}\n`;
      }
      text += `   File: ${comp.fileHint}\n`;
      text += '\n';
    });

    const copyBtn = modal.querySelector('.section-debug-modal__copy-all');
    const originalHTML = copyBtn.innerHTML;
    let success = false;

    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        success = true;
      } catch (err) {
        console.warn('Clipboard API failed, trying fallback:', err);
        success = fallbackCopyText(text);
      }
    } else {
      // Use fallback for older browsers
      success = fallbackCopyText(text);
    }

    if (success) {
      copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Copied!</span>`;
      copyBtn.classList.add('section-debug-modal__copy-all--success');
      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.classList.remove('section-debug-modal__copy-all--success');
      }, 1500);
    } else {
      copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg><span>Failed</span>`;
      copyBtn.style.backgroundColor = 'hsl(0 71% 45%)';
      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.style.backgroundColor = '';
      }, 1500);
    }
  }

  /**
   * Create debug button for a section
   */
  function createDebugButton(section) {
    const sectionType = getSectionType(section);
    const sectionId = getSectionId(section);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'section-debug-btn';
    btn.setAttribute('aria-label', `Inspect ${sectionType || sectionId} section components`);
    btn.innerHTML = `${INSPECT_ICON}<span class="section-debug-btn__type">${sectionType || sectionId}</span>`;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showModal(section);
    });

    return btn;
  }

  /**
   * Initialize section debug buttons
   */
  function init() {
    const sections = document.querySelectorAll('.shopify-section');

    sections.forEach((section) => {
      if (section.querySelector('.section-debug-btn')) return;

      const computedStyle = window.getComputedStyle(section);
      if (computedStyle.position === 'static') {
        section.style.position = 'relative';
      }

      const btn = createDebugButton(section);
      section.appendChild(btn);
    });

    console.log(`[Section Debug] Added debug buttons to ${sections.length} sections`);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-initialize on Shopify section events
  document.addEventListener('shopify:section:load', (e) => {
    if (e.target && e.target.classList.contains('shopify-section')) {
      const btn = createDebugButton(e.target);
      e.target.appendChild(btn);
    }
  });

  // Expose globally
  window.SectionDebug = {
    init,
    inspect: showModal,
    hide: hideModal,
    scanComponents: scanSectionComponents
  };
})();
