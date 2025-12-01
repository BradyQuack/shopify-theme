/**
 * Section Debug - Copy Debug Button
 * Adds a debug copy button to each Shopify section
 * Copies section info (ID, type, settings path) to clipboard
 */

(function() {
  'use strict';

  // Icons as SVG strings
  const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>`;

  const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>`;

  let toast = null;
  let toastTimeout = null;

  /**
   * Create the toast notification element
   */
  function createToast() {
    if (toast) return toast;

    toast = document.createElement('div');
    toast.className = 'section-debug-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);

    return toast;
  }

  /**
   * Show toast notification
   * @param {string} sectionId - The section ID that was copied
   * @param {string} sectionType - The section type
   */
  function showToast(sectionId, sectionType) {
    const toastEl = createToast();

    toastEl.innerHTML = `
      ${CHECK_ICON}
      <span>Copied</span>
      <span class="section-debug-toast__id">${sectionType || sectionId}</span>
    `;

    // Clear any existing timeout
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    // Show toast
    requestAnimationFrame(() => {
      toastEl.classList.add('section-debug-toast--visible');
    });

    // Hide after delay
    toastTimeout = setTimeout(() => {
      toastEl.classList.remove('section-debug-toast--visible');
    }, 2000);
  }

  /**
   * Extract section type from section element
   * Shopify sections have data attributes or class patterns we can parse
   * @param {HTMLElement} section - The section element
   * @returns {string|null} - The section type or null
   */
  function getSectionType(section) {
    // Try data-section-type attribute (common pattern)
    if (section.dataset.sectionType) {
      return section.dataset.sectionType;
    }

    // Try to find section type from inner element with data-section-type
    const innerWithType = section.querySelector('[data-section-type]');
    if (innerWithType && innerWithType.dataset.sectionType) {
      return innerWithType.dataset.sectionType;
    }

    // Try to extract from section ID (format: shopify-section-template--*--section-type-*)
    const sectionId = section.id || '';
    const idMatch = sectionId.match(/shopify-section-(?:template--\d+--)?([a-z0-9-]+)/i);
    if (idMatch && idMatch[1]) {
      // Clean up the extracted type
      let type = idMatch[1];
      // Remove trailing unique IDs (like _abc123)
      type = type.replace(/_[a-zA-Z0-9]+$/, '');
      // Remove numeric suffixes
      type = type.replace(/-\d+$/, '');
      return type;
    }

    // Try to find class that might indicate section type
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
   * @param {HTMLElement} section - The section element
   * @returns {string} - The section ID
   */
  function getSectionId(section) {
    const fullId = section.id || '';
    // Extract just the unique part after "shopify-section-"
    return fullId.replace('shopify-section-', '') || 'unknown';
  }

  /**
   * Get block count within section
   * @param {HTMLElement} section - The section element
   * @returns {number} - Number of blocks found
   */
  function getBlockCount(section) {
    // Look for common block patterns
    const blocks = section.querySelectorAll('[data-block-id], [data-shopify-editor-block]');
    return blocks.length;
  }

  /**
   * Convert RGB to HEX
   * @param {string} rgb - RGB color string like "rgb(255, 255, 255)"
   * @returns {string} - HEX color like "#FFFFFF"
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
   * Get computed colors for an element
   * @param {HTMLElement} element - The element to get colors from
   * @returns {Object} - Color information
   */
  function getComputedColors(element) {
    const styles = window.getComputedStyle(element);

    // Find the first text element to get actual text color
    const textElement = element.querySelector('h1, h2, h3, h4, h5, h6, p, span, a') || element;
    const textStyles = window.getComputedStyle(textElement);

    return {
      background: rgbToHex(styles.backgroundColor),
      text: rgbToHex(textStyles.color),
      border: rgbToHex(styles.borderColor),
    };
  }

  /**
   * Build debug info object for a section
   * @param {HTMLElement} section - The section element
   * @returns {Object} - Debug info object
   */
  function buildDebugInfo(section) {
    const sectionId = getSectionId(section);
    const sectionType = getSectionType(section);
    const blockCount = getBlockCount(section);

    // Get computed dimensions
    const rect = section.getBoundingClientRect();

    // Check for common section properties
    const hasColorScheme = section.className.includes('color-');
    const colorSchemeMatch = section.className.match(/color-(\S+)/);

    // Get current theme mode
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

    // Get computed colors
    const colors = getComputedColors(section);

    const info = {
      section_id: sectionId,
      section_type: sectionType || 'unknown',
      full_element_id: section.id,
      block_count: blockCount,
      dimensions: {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
      theme: currentTheme,
      colors: colors,
      page: {
        url: window.location.pathname,
        template: window.Shopify?.theme?.name || 'unknown',
      }
    };

    if (colorSchemeMatch) {
      info.color_scheme = colorSchemeMatch[1];
    }

    // Add helpful paths
    info.paths = {
      section_file: `sections/${sectionType || sectionId}.liquid`,
      template_json: `templates/${getTemplateName()}.json`,
    };

    return info;
  }

  /**
   * Get current template name
   * @returns {string} - Template name
   */
  function getTemplateName() {
    // Try to extract from body class or Shopify object
    const bodyClasses = document.body.className;

    // Common patterns: template-index, template-product, template-page, etc.
    const templateMatch = bodyClasses.match(/template-([a-z0-9-]+)/i);
    if (templateMatch) {
      return templateMatch[1];
    }

    // Fallback to pathname parsing
    const path = window.location.pathname;
    if (path === '/' || path === '') return 'index';
    if (path.includes('/products/')) return 'product';
    if (path.includes('/collections/')) return 'collection';
    if (path.includes('/pages/')) return 'page';
    if (path.includes('/blogs/')) return 'article';
    if (path.includes('/cart')) return 'cart';

    return 'unknown';
  }

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} - Success status
   */
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      } catch (e) {
        document.body.removeChild(textarea);
        console.error('Failed to copy:', e);
        return false;
      }
    }
  }

  /**
   * Handle copy button click
   * @param {Event} e - Click event
   * @param {HTMLElement} section - The section element
   * @param {HTMLButtonElement} btn - The button element
   */
  async function handleCopyClick(e, section, btn) {
    e.preventDefault();
    e.stopPropagation();

    const debugInfo = buildDebugInfo(section);
    const jsonString = JSON.stringify(debugInfo, null, 2);

    const success = await copyToClipboard(jsonString);

    if (success) {
      // Visual feedback on button
      btn.classList.add('section-debug-btn--copied');
      btn.innerHTML = `${CHECK_ICON}<span class="section-debug-btn__type">Copied!</span>`;

      // Show toast
      showToast(debugInfo.section_id, debugInfo.section_type);

      // Reset button after delay
      setTimeout(() => {
        btn.classList.remove('section-debug-btn--copied');
        btn.innerHTML = `${COPY_ICON}<span class="section-debug-btn__type">${debugInfo.section_type || debugInfo.section_id}</span>`;
      }, 1500);
    }
  }

  /**
   * Create debug button for a section
   * @param {HTMLElement} section - The section element
   * @returns {HTMLButtonElement} - The button element
   */
  function createDebugButton(section) {
    const sectionType = getSectionType(section);
    const sectionId = getSectionId(section);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'section-debug-btn';
    btn.setAttribute('aria-label', `Copy debug info for ${sectionType || sectionId} section`);
    btn.innerHTML = `${COPY_ICON}<span class="section-debug-btn__type">${sectionType || sectionId}</span>`;

    btn.addEventListener('click', (e) => handleCopyClick(e, section, btn));

    return btn;
  }

  /**
   * Initialize section debug buttons
   */
  function init() {
    // Find all Shopify sections
    const sections = document.querySelectorAll('.shopify-section');

    sections.forEach((section) => {
      // Skip if button already exists
      if (section.querySelector('.section-debug-btn')) return;

      // Ensure section has position context for absolute button
      const computedStyle = window.getComputedStyle(section);
      if (computedStyle.position === 'static') {
        section.style.position = 'relative';
      }

      // Create and append button
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

  // Re-initialize on Shopify section events (for theme editor)
  document.addEventListener('shopify:section:load', (e) => {
    if (e.target && e.target.classList.contains('shopify-section')) {
      const btn = createDebugButton(e.target);
      e.target.appendChild(btn);
    }
  });

  // Expose globally for manual use
  window.SectionDebug = {
    init,
    getInfo: (sectionElement) => buildDebugInfo(sectionElement),
    copyInfo: async (sectionElement) => {
      const info = buildDebugInfo(sectionElement);
      return copyToClipboard(JSON.stringify(info, null, 2));
    }
  };
})();
