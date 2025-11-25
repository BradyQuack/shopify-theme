/**
 * Style Debug Modal
 * Scans the page for style inconsistencies in fonts, sizes, weights, and colors
 */

(function() {
  'use strict';

  const DEBUG_MODAL_ID = 'style-debug-modal';

  // Expected values based on theme settings
  const EXPECTED = {
    fontFamily: 'var(--font-body-family)',
    // Common font sizes in the theme (in px)
    fontSizes: [10, 12, 13, 14, 15, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72],
    // Common font weights
    fontWeights: [400, 500, 600, 700],
    // Theme colors (light mode)
    lightColors: {
      bg: '#F5F7FA',
      surface: '#FFFFFF',
      textPrimary: '#2B2C2D',
      primary: '#005496',
      accent: '#DD6727',
      success: '#28A745',
      border: '#E1E5EA'
    },
    // Theme colors (dark mode)
    darkColors: {
      bg: '#0F172A',
      surface: '#1E293B',
      textPrimary: '#F1F5F9',
      primary: '#60A5FA',
      accent: '#F28C38',
      success: '#39B47E',
      border: '#2D3A50'
    }
  };

  // Store found inconsistencies
  let inconsistencies = {
    fontFamily: [],
    fontSize: [],
    fontWeight: [],
    color: []
  };

  // Normalize font family string for comparison
  function normalizeFontFamily(fontFamily) {
    return fontFamily.toLowerCase().replace(/['"]/g, '').trim();
  }

  // Check if font family matches expected system fonts
  function isExpectedFontFamily(fontFamily) {
    const normalized = normalizeFontFamily(fontFamily);
    const systemFonts = [
      'system-ui', '-apple-system', 'blinkmacsystemfont', 'segoe ui',
      'roboto', 'helvetica neue', 'arial', 'sans-serif', 'noto sans',
      'liberation sans', 'helvetica'
    ];

    // Check if it contains any system font
    return systemFonts.some(sf => normalized.includes(sf));
  }

  // Convert RGB to Hex
  function rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return null;

    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return rgb;

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);

    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  }

  // Check if color is a theme color
  function isThemeColor(hexColor) {
    if (!hexColor) return true;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const themeColors = isDark ? EXPECTED.darkColors : EXPECTED.lightColors;
    const allThemeColors = Object.values(themeColors).map(c => c.toUpperCase());

    // Also allow common variations
    const allowedColors = [
      ...allThemeColors,
      '#FFFFFF', '#000000', '#FFF', '#000',
      'TRANSPARENT', 'INHERIT', 'CURRENTCOLOR'
    ];

    return allowedColors.includes(hexColor.toUpperCase());
  }

  // Get element selector for display
  function getElementSelector(el) {
    let selector = el.tagName.toLowerCase();
    if (el.id) selector += '#' + el.id;
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.split(' ').filter(c => c.trim()).slice(0, 2);
      if (classes.length) selector += '.' + classes.join('.');
    }
    return selector;
  }

  // Scan all elements for style inconsistencies
  function scanStyles() {
    inconsistencies = {
      fontFamily: [],
      fontSize: [],
      fontWeight: [],
      color: []
    };

    const seenFontFamilies = new Map();
    const seenFontSizes = new Map();
    const seenFontWeights = new Map();
    const seenColors = new Map();

    // Get all visible elements
    const elements = document.querySelectorAll('body *:not(script):not(style):not(svg):not(path):not(circle):not(line):not(rect):not(polygon)');

    elements.forEach(el => {
      // Skip hidden elements and the debug modal itself
      if (el.closest('#' + DEBUG_MODAL_ID)) return;
      if (el.offsetParent === null && el.tagName !== 'BODY') return;

      const styles = window.getComputedStyle(el);
      const selector = getElementSelector(el);

      // Check font-family
      const fontFamily = styles.fontFamily;
      if (fontFamily && !isExpectedFontFamily(fontFamily)) {
        const key = fontFamily;
        if (!seenFontFamilies.has(key)) {
          seenFontFamilies.set(key, []);
        }
        seenFontFamilies.get(key).push(selector);
      }

      // Check font-size (collect all unique sizes)
      const fontSize = parseFloat(styles.fontSize);
      if (fontSize) {
        const key = fontSize + 'px';
        if (!seenFontSizes.has(key)) {
          seenFontSizes.set(key, []);
        }
        if (seenFontSizes.get(key).length < 3) {
          seenFontSizes.get(key).push(selector);
        }
      }

      // Check font-weight
      const fontWeight = parseInt(styles.fontWeight);
      if (fontWeight) {
        const key = fontWeight.toString();
        if (!seenFontWeights.has(key)) {
          seenFontWeights.set(key, []);
        }
        if (seenFontWeights.get(key).length < 3) {
          seenFontWeights.get(key).push(selector);
        }
      }

      // Check text color
      const color = rgbToHex(styles.color);
      if (color && color !== '#000000' && color !== '#FFFFFF') {
        const key = color;
        if (!seenColors.has(key)) {
          seenColors.set(key, { isTheme: isThemeColor(color), elements: [] });
        }
        if (seenColors.get(key).elements.length < 3) {
          seenColors.get(key).elements.push(selector);
        }
      }

      // Check background color
      const bgColor = rgbToHex(styles.backgroundColor);
      if (bgColor) {
        const key = 'bg:' + bgColor;
        if (!seenColors.has(key)) {
          seenColors.set(key, { isTheme: isThemeColor(bgColor), elements: [], isBg: true });
        }
        if (seenColors.get(key).elements.length < 3) {
          seenColors.get(key).elements.push(selector);
        }
      }
    });

    // Convert to array format
    inconsistencies.fontFamily = Array.from(seenFontFamilies.entries()).map(([font, els]) => ({
      value: font,
      elements: els,
      isInconsistent: true
    }));

    inconsistencies.fontSize = Array.from(seenFontSizes.entries())
      .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
      .map(([size, els]) => ({
        value: size,
        elements: els
      }));

    inconsistencies.fontWeight = Array.from(seenFontWeights.entries())
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([weight, els]) => ({
        value: weight,
        elements: els
      }));

    inconsistencies.color = Array.from(seenColors.entries())
      .map(([color, data]) => ({
        value: data.isBg ? color.replace('bg:', '') + ' (bg)' : color,
        elements: data.elements,
        isTheme: data.isTheme,
        isBg: data.isBg
      }))
      .sort((a, b) => (a.isTheme === b.isTheme ? 0 : a.isTheme ? 1 : -1));

    return inconsistencies;
  }

  // Create the debug modal HTML
  function createModal() {
    const existingModal = document.getElementById(DEBUG_MODAL_ID);
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = DEBUG_MODAL_ID;
    modal.innerHTML = `
      <div class="debug-modal__overlay"></div>
      <div class="debug-modal__content">
        <div class="debug-modal__header">
          <h2>Style Debug Inspector</h2>
          <div class="debug-modal__actions">
            <button type="button" class="debug-modal__refresh" title="Refresh scan">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
              Rescan
            </button>
            <button type="button" class="debug-modal__close" title="Close">&times;</button>
          </div>
        </div>
        <div class="debug-modal__body">
          <div class="debug-modal__tabs">
            <button type="button" class="debug-modal__tab active" data-tab="fonts">Font Family</button>
            <button type="button" class="debug-modal__tab" data-tab="sizes">Font Sizes</button>
            <button type="button" class="debug-modal__tab" data-tab="weights">Font Weights</button>
            <button type="button" class="debug-modal__tab" data-tab="colors">Colors</button>
          </div>
          <div class="debug-modal__panels">
            <div class="debug-modal__panel active" data-panel="fonts"></div>
            <div class="debug-modal__panel" data-panel="sizes"></div>
            <div class="debug-modal__panel" data-panel="weights"></div>
            <div class="debug-modal__panel" data-panel="colors"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('.debug-modal__close').addEventListener('click', hideModal);
    modal.querySelector('.debug-modal__overlay').addEventListener('click', hideModal);
    modal.querySelector('.debug-modal__refresh').addEventListener('click', refreshScan);

    modal.querySelectorAll('.debug-modal__tab').forEach(tab => {
      tab.addEventListener('click', () => {
        modal.querySelectorAll('.debug-modal__tab').forEach(t => t.classList.remove('active'));
        modal.querySelectorAll('.debug-modal__panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        modal.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add('active');
      });
    });

    return modal;
  }

  // Render results into panels
  function renderResults(data) {
    const modal = document.getElementById(DEBUG_MODAL_ID);
    if (!modal) return;

    // Font Family Panel
    const fontsPanel = modal.querySelector('[data-panel="fonts"]');
    if (data.fontFamily.length === 0) {
      fontsPanel.innerHTML = '<div class="debug-modal__success">All fonts use system sans-serif (consistent)</div>';
    } else {
      fontsPanel.innerHTML = `
        <div class="debug-modal__warning">Found ${data.fontFamily.length} non-standard font families:</div>
        <div class="debug-modal__list">
          ${data.fontFamily.map(item => `
            <div class="debug-modal__item debug-modal__item--error">
              <div class="debug-modal__item-value" style="font-family: ${item.value}">${item.value}</div>
              <div class="debug-modal__item-elements">${item.elements.slice(0, 3).join(', ')}${item.elements.length > 3 ? '...' : ''}</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Font Sizes Panel
    const sizesPanel = modal.querySelector('[data-panel="sizes"]');
    sizesPanel.innerHTML = `
      <div class="debug-modal__info">Found ${data.fontSize.length} unique font sizes:</div>
      <div class="debug-modal__list debug-modal__list--grid">
        ${data.fontSize.map(item => `
          <div class="debug-modal__item">
            <div class="debug-modal__item-value" style="font-size: 14px">${item.value}</div>
            <div class="debug-modal__item-elements">${item.elements.slice(0, 2).join(', ')}</div>
          </div>
        `).join('')}
      </div>
    `;

    // Font Weights Panel
    const weightsPanel = modal.querySelector('[data-panel="weights"]');
    weightsPanel.innerHTML = `
      <div class="debug-modal__info">Found ${data.fontWeight.length} unique font weights:</div>
      <div class="debug-modal__list debug-modal__list--grid">
        ${data.fontWeight.map(item => `
          <div class="debug-modal__item">
            <div class="debug-modal__item-value" style="font-weight: ${item.value}">${item.value}</div>
            <div class="debug-modal__item-elements">${item.elements.slice(0, 2).join(', ')}</div>
          </div>
        `).join('')}
      </div>
    `;

    // Colors Panel
    const colorsPanel = modal.querySelector('[data-panel="colors"]');
    const nonThemeColors = data.color.filter(c => !c.isTheme);
    const themeColors = data.color.filter(c => c.isTheme);

    colorsPanel.innerHTML = `
      ${nonThemeColors.length > 0 ? `
        <div class="debug-modal__warning">Found ${nonThemeColors.length} non-theme colors:</div>
        <div class="debug-modal__list debug-modal__list--colors">
          ${nonThemeColors.map(item => `
            <div class="debug-modal__item debug-modal__item--error">
              <div class="debug-modal__color-swatch" style="background-color: ${item.value.replace(' (bg)', '')}"></div>
              <div class="debug-modal__item-value">${item.value}</div>
              <div class="debug-modal__item-elements">${item.elements.slice(0, 2).join(', ')}</div>
            </div>
          `).join('')}
        </div>
      ` : '<div class="debug-modal__success">All colors match theme palette</div>'}

      <div class="debug-modal__divider"></div>
      <div class="debug-modal__info">Theme colors in use (${themeColors.length}):</div>
      <div class="debug-modal__list debug-modal__list--colors">
        ${themeColors.map(item => `
          <div class="debug-modal__item">
            <div class="debug-modal__color-swatch" style="background-color: ${item.value.replace(' (bg)', '')}"></div>
            <div class="debug-modal__item-value">${item.value}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Show the modal
  function showModal() {
    let modal = document.getElementById(DEBUG_MODAL_ID);
    if (!modal) {
      modal = createModal();
    }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Run scan
    const data = scanStyles();
    renderResults(data);
  }

  // Hide the modal
  function hideModal() {
    const modal = document.getElementById(DEBUG_MODAL_ID);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Refresh scan
  function refreshScan() {
    const data = scanStyles();
    renderResults(data);
  }

  // Toggle modal
  function toggleModal() {
    const modal = document.getElementById(DEBUG_MODAL_ID);
    if (modal && modal.classList.contains('active')) {
      hideModal();
    } else {
      showModal();
    }
  }

  // Expose to global scope
  window.StyleDebug = {
    show: showModal,
    hide: hideModal,
    toggle: toggleModal,
    scan: scanStyles
  };

  // Auto-show if debug button exists
  document.addEventListener('DOMContentLoaded', function() {
    const debugBtn = document.querySelector('.debug-modal-trigger');
    if (debugBtn) {
      debugBtn.addEventListener('click', function(e) {
        e.preventDefault();
        toggleModal();
      });
    }
  });
})();
