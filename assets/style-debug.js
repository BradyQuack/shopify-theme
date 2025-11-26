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
    // Expected spacing values in px (based on rem: 0, 8, 12, 16, 24, 32, 48, 64, 96)
    // 1rem = 16px typically
    spacingValues: [0, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 112, 128],
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
    color: [],
    spacing: [],
    conflicts: [],
    variables: []
  };

  // Inspector mode state
  let inspectorMode = false;
  let inspectorOverlay = null;

  // Check if spacing value is consistent with expected values
  function isConsistentSpacing(value) {
    const rounded = Math.round(value);
    // Allow values that are close to expected (within 2px tolerance)
    return EXPECTED.spacingValues.some(expected => Math.abs(rounded - expected) <= 2);
  }

  // Parse spacing value to pixels
  function parseSpacingValue(value) {
    if (!value || value === 'auto' || value === 'normal') return null;
    const num = parseFloat(value);
    if (isNaN(num) || num === 0) return null;
    return num;
  }

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
      color: [],
      spacing: []
    };

    const seenFontFamilies = new Map();
    const seenFontSizes = new Map();
    const seenFontWeights = new Map();
    const seenColors = new Map();
    const seenSpacing = new Map();

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

      // Check spacing (margin, padding, gap)
      const spacingProps = [
        { prop: 'marginTop', label: 'margin-top' },
        { prop: 'marginBottom', label: 'margin-bottom' },
        { prop: 'marginLeft', label: 'margin-left' },
        { prop: 'marginRight', label: 'margin-right' },
        { prop: 'paddingTop', label: 'padding-top' },
        { prop: 'paddingBottom', label: 'padding-bottom' },
        { prop: 'paddingLeft', label: 'padding-left' },
        { prop: 'paddingRight', label: 'padding-right' },
        { prop: 'gap', label: 'gap' },
        { prop: 'rowGap', label: 'row-gap' },
        { prop: 'columnGap', label: 'column-gap' }
      ];

      spacingProps.forEach(({ prop, label }) => {
        const value = parseSpacingValue(styles[prop]);
        if (value !== null && value > 0) {
          const rounded = Math.round(value);
          const key = rounded + 'px';
          const isConsistent = isConsistentSpacing(value);

          if (!seenSpacing.has(key)) {
            seenSpacing.set(key, {
              elements: [],
              properties: new Set(),
              isConsistent: isConsistent
            });
          }
          const data = seenSpacing.get(key);
          data.properties.add(label);
          if (data.elements.length < 3) {
            data.elements.push(selector);
          }
        }
      });
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

    inconsistencies.spacing = Array.from(seenSpacing.entries())
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([size, data]) => ({
        value: size,
        elements: data.elements,
        properties: Array.from(data.properties),
        isConsistent: data.isConsistent
      }));

    return inconsistencies;
  }

  // Scan for CSS conflicts (overridden styles)
  function scanConflicts() {
    const conflicts = [];
    const elements = document.querySelectorAll('body *:not(script):not(style):not(svg):not(path)');

    // Get theme colors for comparison
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const themeColors = isDark ? EXPECTED.darkColors : EXPECTED.lightColors;
    const themeColorValues = Object.values(themeColors).map(c => c.toUpperCase());
    const allowedColors = [...themeColorValues, '#FFFFFF', '#000000', '#FFF', '#000', 'TRANSPARENT'];

    elements.forEach(el => {
      if (el.closest('#' + DEBUG_MODAL_ID)) return;
      if (el.offsetParent === null && el.tagName !== 'BODY') return;

      const selector = getElementSelector(el);
      const computed = window.getComputedStyle(el);

      // Check for !important overrides by looking at inline styles vs computed
      const inlineStyle = el.getAttribute('style');
      if (inlineStyle && inlineStyle.includes('!important')) {
        conflicts.push({
          element: selector,
          type: 'inline-important',
          detail: 'Inline !important override detected',
          style: inlineStyle.substring(0, 100) + (inlineStyle.length > 100 ? '...' : '')
        });
      }

      // Check for color conflicts (computed differs from CSS variable)
      const colorProps = ['color', 'background-color', 'border-color'];
      colorProps.forEach(prop => {
        const computedValue = computed.getPropertyValue(prop);
        const hexColor = rgbToHex(computedValue);

        // Check if element has inline style that might override theme
        if (el.style[prop === 'background-color' ? 'backgroundColor' : prop]) {
          const inlineVal = el.style[prop === 'background-color' ? 'backgroundColor' : prop];
          if (inlineVal && !inlineVal.includes('var(')) {
            conflicts.push({
              element: selector,
              type: 'inline-override',
              detail: `Inline ${prop} override`,
              expected: 'theme variable',
              actual: inlineVal
            });
          }
        }

        // NEW: Check if computed color is hardcoded (not a theme color)
        // This catches <style> block hardcoded colors, not just inline styles
        if (hexColor && !allowedColors.includes(hexColor.toUpperCase())) {
          // Check if this is a text element with non-theme color
          const isTextElement = el.innerText && el.innerText.trim().length > 0;
          const isColorProp = prop === 'color';
          const isBgProp = prop === 'background-color';

          // Only flag visible text colors or prominent backgrounds
          if ((isColorProp && isTextElement) || (isBgProp && hexColor !== null)) {
            // Check if any matching CSS rule uses var()
            let usesVariable = false;
            try {
              for (const sheet of document.styleSheets) {
                try {
                  for (const rule of sheet.cssRules || []) {
                    if (rule.selectorText && el.matches(rule.selectorText)) {
                      const ruleValue = rule.style.getPropertyValue(prop);
                      if (ruleValue && ruleValue.includes('var(')) {
                        usesVariable = true;
                        break;
                      }
                    }
                  }
                } catch (e) { /* cross-origin */ }
                if (usesVariable) break;
              }
            } catch (e) { /* ignore */ }

            if (!usesVariable) {
              conflicts.push({
                element: selector,
                type: 'hardcoded-color',
                detail: `Hardcoded ${prop} (not theme variable)`,
                expected: 'var(--color-*)',
                actual: hexColor
              });
            }
          }
        }
      });
    });

    // Deduplicate and limit
    const seen = new Set();
    return conflicts.filter(c => {
      const key = c.element + c.type + c.detail;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 100);
  }

  // Scan theme CSS variables
  function scanThemeVariables() {
    const variables = [];
    const root = document.documentElement;
    const computed = window.getComputedStyle(root);

    // Common theme variable patterns to look for
    const varPatterns = [
      '--color-', '--font-', '--spacing-', '--border-', '--shadow-',
      '--bg-', '--text-', '--primary', '--secondary', '--accent',
      '--success', '--warning', '--error', '--surface'
    ];

    // Get all CSS custom properties from stylesheets
    const allVars = new Set();

    try {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules || []) {
            if (rule.style) {
              for (let i = 0; i < rule.style.length; i++) {
                const prop = rule.style[i];
                if (prop.startsWith('--')) {
                  allVars.add(prop);
                }
              }
            }
          }
        } catch (e) {
          // Cross-origin stylesheet, skip
        }
      }
    } catch (e) {
      // Fallback: check common variables
    }

    // Also check inline root styles
    const rootStyles = root.getAttribute('style') || '';
    const inlineVarMatches = rootStyles.match(/--[\w-]+/g) || [];
    inlineVarMatches.forEach(v => allVars.add(v));

    // Add common Shopify Dawn theme variables
    const commonVars = [
      '--color-base-text', '--color-base-background', '--color-base-solid-button-labels',
      '--color-base-accent-1', '--color-base-accent-2', '--color-base-background-1',
      '--color-base-background-2', '--color-foreground', '--color-background',
      '--color-primary', '--color-secondary', '--color-accent', '--color-bg',
      '--color-surface', '--color-text-primary', '--color-border',
      '--font-body-family', '--font-heading-family', '--font-body-weight',
      '--font-heading-weight', '--font-body-scale', '--font-heading-scale'
    ];
    commonVars.forEach(v => allVars.add(v));

    // Get resolved values
    allVars.forEach(varName => {
      const value = computed.getPropertyValue(varName).trim();
      if (value) {
        // Categorize by type
        let category = 'other';
        if (varName.includes('color') || varName.includes('bg') || varName.includes('text')) {
          category = 'color';
        } else if (varName.includes('font')) {
          category = 'font';
        } else if (varName.includes('spacing') || varName.includes('gap') || varName.includes('margin') || varName.includes('padding')) {
          category = 'spacing';
        } else if (varName.includes('border') || varName.includes('radius')) {
          category = 'border';
        }

        variables.push({
          name: varName,
          value: value,
          category: category
        });
      }
    });

    // Sort by category then name
    variables.sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.name.localeCompare(b.name);
    });

    return variables;
  }

  // Element inspector functionality
  function enableInspector() {
    if (inspectorMode) return;
    inspectorMode = true;

    // Create overlay
    inspectorOverlay = document.createElement('div');
    inspectorOverlay.id = 'style-debug-inspector-overlay';
    inspectorOverlay.innerHTML = `
      <div class="inspector-tooltip"></div>
    `;
    document.body.appendChild(inspectorOverlay);

    document.body.style.cursor = 'crosshair';

    document.addEventListener('mouseover', inspectorMouseOver);
    document.addEventListener('click', inspectorClick, true);
    document.addEventListener('keydown', inspectorKeyDown);
  }

  function disableInspector() {
    if (!inspectorMode) return;
    inspectorMode = false;

    if (inspectorOverlay) {
      inspectorOverlay.remove();
      inspectorOverlay = null;
    }

    document.body.style.cursor = '';
    document.querySelectorAll('.style-debug-highlight').forEach(el => {
      el.classList.remove('style-debug-highlight');
    });

    document.removeEventListener('mouseover', inspectorMouseOver);
    document.removeEventListener('click', inspectorClick, true);
    document.removeEventListener('keydown', inspectorKeyDown);
  }

  function inspectorMouseOver(e) {
    if (!inspectorMode) return;
    if (e.target.closest('#' + DEBUG_MODAL_ID)) return;
    if (e.target.closest('#style-debug-inspector-overlay')) return;

    // Remove previous highlights
    document.querySelectorAll('.style-debug-highlight').forEach(el => {
      el.classList.remove('style-debug-highlight');
    });

    // Highlight current element
    e.target.classList.add('style-debug-highlight');

    // Update tooltip
    const tooltip = inspectorOverlay.querySelector('.inspector-tooltip');
    const selector = getElementSelector(e.target);
    const rect = e.target.getBoundingClientRect();

    tooltip.textContent = selector;
    tooltip.style.left = (rect.left + window.scrollX) + 'px';
    tooltip.style.top = (rect.top + window.scrollY - 30) + 'px';
    tooltip.style.display = 'block';
  }

  function inspectorClick(e) {
    if (!inspectorMode) return;
    if (e.target.closest('#' + DEBUG_MODAL_ID)) return;
    if (e.target.closest('#style-debug-inspector-overlay')) return;

    e.preventDefault();
    e.stopPropagation();

    showElementDetails(e.target);
    disableInspector();
  }

  function inspectorKeyDown(e) {
    if (e.key === 'Escape') {
      disableInspector();
    }
  }

  function showElementDetails(el) {
    const modal = document.getElementById(DEBUG_MODAL_ID);
    if (!modal) return;

    const computed = window.getComputedStyle(el);
    const selector = getElementSelector(el);

    // Gather style information
    const styleInfo = {
      selector: selector,
      tag: el.tagName.toLowerCase(),
      classes: el.className ? el.className.split(' ').filter(c => c) : [],
      id: el.id || null,
      styles: {
        // Typography
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        lineHeight: computed.lineHeight,
        color: rgbToHex(computed.color),
        // Box Model
        width: computed.width,
        height: computed.height,
        padding: `${computed.paddingTop} ${computed.paddingRight} ${computed.paddingBottom} ${computed.paddingLeft}`,
        margin: `${computed.marginTop} ${computed.marginRight} ${computed.marginBottom} ${computed.marginLeft}`,
        // Background & Border
        backgroundColor: rgbToHex(computed.backgroundColor),
        border: computed.border,
        borderRadius: computed.borderRadius,
        // Layout
        display: computed.display,
        position: computed.position,
        zIndex: computed.zIndex
      },
      inlineStyles: el.getAttribute('style') || 'none'
    };

    // Switch to a details view
    const panel = modal.querySelector('[data-panel="inspector"]');
    if (panel) {
      panel.innerHTML = `
        <div class="debug-modal__element-details">
          <div class="debug-modal__element-header">
            <strong>${styleInfo.selector}</strong>
            ${styleInfo.id ? `<span class="debug-id">#${styleInfo.id}</span>` : ''}
          </div>
          ${styleInfo.classes.length ? `<div class="debug-classes">.${styleInfo.classes.join(' .')}</div>` : ''}

          <div class="debug-modal__divider"></div>

          <div class="debug-section">
            <div class="debug-section-title">Typography</div>
            <div class="debug-prop"><span>font-family:</span> ${styleInfo.styles.fontFamily}</div>
            <div class="debug-prop"><span>font-size:</span> ${styleInfo.styles.fontSize}</div>
            <div class="debug-prop"><span>font-weight:</span> ${styleInfo.styles.fontWeight}</div>
            <div class="debug-prop"><span>line-height:</span> ${styleInfo.styles.lineHeight}</div>
            <div class="debug-prop"><span>color:</span> <span class="debug-color-preview" style="background:${styleInfo.styles.color}"></span> ${styleInfo.styles.color}</div>
          </div>

          <div class="debug-section">
            <div class="debug-section-title">Box Model</div>
            <div class="debug-prop"><span>width:</span> ${styleInfo.styles.width}</div>
            <div class="debug-prop"><span>height:</span> ${styleInfo.styles.height}</div>
            <div class="debug-prop"><span>padding:</span> ${styleInfo.styles.padding}</div>
            <div class="debug-prop"><span>margin:</span> ${styleInfo.styles.margin}</div>
          </div>

          <div class="debug-section">
            <div class="debug-section-title">Background & Border</div>
            <div class="debug-prop"><span>background:</span> <span class="debug-color-preview" style="background:${styleInfo.styles.backgroundColor}"></span> ${styleInfo.styles.backgroundColor || 'transparent'}</div>
            <div class="debug-prop"><span>border:</span> ${styleInfo.styles.border}</div>
            <div class="debug-prop"><span>border-radius:</span> ${styleInfo.styles.borderRadius}</div>
          </div>

          <div class="debug-section">
            <div class="debug-section-title">Layout</div>
            <div class="debug-prop"><span>display:</span> ${styleInfo.styles.display}</div>
            <div class="debug-prop"><span>position:</span> ${styleInfo.styles.position}</div>
            <div class="debug-prop"><span>z-index:</span> ${styleInfo.styles.zIndex}</div>
          </div>

          <div class="debug-section">
            <div class="debug-section-title">Inline Styles</div>
            <div class="debug-inline-styles">${styleInfo.inlineStyles}</div>
          </div>
        </div>
      `;

      // Switch to inspector tab
      modal.querySelectorAll('.debug-modal__tab').forEach(t => t.classList.remove('active'));
      modal.querySelectorAll('.debug-modal__panel').forEach(p => p.classList.remove('active'));
      modal.querySelector('[data-tab="inspector"]').classList.add('active');
      panel.classList.add('active');
    }
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
            <button type="button" class="debug-modal__copy" title="Copy all to clipboard">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span class="debug-modal__copy-text">Copy All</span>
            </button>
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
            <button type="button" class="debug-modal__tab active" data-tab="fonts">Fonts</button>
            <button type="button" class="debug-modal__tab" data-tab="sizes">Sizes</button>
            <button type="button" class="debug-modal__tab" data-tab="weights">Weights</button>
            <button type="button" class="debug-modal__tab" data-tab="colors">Colors</button>
            <button type="button" class="debug-modal__tab" data-tab="spacing">Spacing</button>
            <button type="button" class="debug-modal__tab" data-tab="conflicts">Conflicts</button>
            <button type="button" class="debug-modal__tab" data-tab="variables">Variables</button>
            <button type="button" class="debug-modal__tab" data-tab="inspector">Inspector</button>
          </div>
          <div class="debug-modal__panels">
            <div class="debug-modal__panel active" data-panel="fonts"></div>
            <div class="debug-modal__panel" data-panel="sizes"></div>
            <div class="debug-modal__panel" data-panel="weights"></div>
            <div class="debug-modal__panel" data-panel="colors"></div>
            <div class="debug-modal__panel" data-panel="spacing"></div>
            <div class="debug-modal__panel" data-panel="conflicts"></div>
            <div class="debug-modal__panel" data-panel="variables"></div>
            <div class="debug-modal__panel" data-panel="inspector"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('.debug-modal__close').addEventListener('click', hideModal);
    modal.querySelector('.debug-modal__overlay').addEventListener('click', hideModal);
    modal.querySelector('.debug-modal__refresh').addEventListener('click', refreshScan);
    modal.querySelector('.debug-modal__copy').addEventListener('click', copyAllToClipboard);

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

  // Format data for clipboard
  function formatDataForClipboard(data) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const lines = [];

    lines.push('='.repeat(60));
    lines.push('STYLE DEBUG REPORT');
    lines.push('Generated: ' + new Date().toLocaleString());
    lines.push('Theme Mode: ' + (isDark ? 'Dark' : 'Light'));
    lines.push('Page URL: ' + window.location.href);
    lines.push('='.repeat(60));
    lines.push('');

    // Font Families
    lines.push('FONT FAMILIES');
    lines.push('-'.repeat(40));
    if (data.fontFamily.length === 0) {
      lines.push('✓ All fonts use system sans-serif (consistent)');
    } else {
      lines.push('⚠ Found ' + data.fontFamily.length + ' non-standard font families:');
      data.fontFamily.forEach(item => {
        lines.push('  • ' + item.value);
        lines.push('    Elements: ' + item.elements.join(', '));
      });
    }
    lines.push('');

    // Font Sizes
    lines.push('FONT SIZES (' + data.fontSize.length + ' unique sizes)');
    lines.push('-'.repeat(40));
    data.fontSize.forEach(item => {
      lines.push('  • ' + item.value + ' — ' + item.elements.slice(0, 3).join(', '));
    });
    lines.push('');

    // Font Weights
    lines.push('FONT WEIGHTS (' + data.fontWeight.length + ' unique weights)');
    lines.push('-'.repeat(40));
    data.fontWeight.forEach(item => {
      lines.push('  • ' + item.value + ' — ' + item.elements.slice(0, 3).join(', '));
    });
    lines.push('');

    // Colors
    const nonThemeColors = data.color.filter(c => !c.isTheme);
    const themeColors = data.color.filter(c => c.isTheme);

    lines.push('COLORS');
    lines.push('-'.repeat(40));

    if (nonThemeColors.length > 0) {
      lines.push('⚠ Non-theme colors (' + nonThemeColors.length + '):');
      nonThemeColors.forEach(item => {
        lines.push('  • ' + item.value + ' — ' + item.elements.slice(0, 3).join(', '));
      });
      lines.push('');
    } else {
      lines.push('✓ All colors match theme palette');
      lines.push('');
    }

    lines.push('Theme colors in use (' + themeColors.length + '):');
    themeColors.forEach(item => {
      lines.push('  • ' + item.value);
    });
    lines.push('');

    // Spacing
    const inconsistentSpacing = data.spacing.filter(s => !s.isConsistent);
    const consistentSpacing = data.spacing.filter(s => s.isConsistent);

    lines.push('SPACING (' + data.spacing.length + ' unique values)');
    lines.push('-'.repeat(40));

    if (inconsistentSpacing.length > 0) {
      lines.push('⚠ Non-standard spacing values (' + inconsistentSpacing.length + '):');
      inconsistentSpacing.forEach(item => {
        lines.push('  • ' + item.value + ' — ' + item.properties.join(', '));
        lines.push('    Elements: ' + item.elements.slice(0, 3).join(', '));
      });
      lines.push('');
    }

    lines.push('Consistent spacing values (' + consistentSpacing.length + '):');
    consistentSpacing.forEach(item => {
      lines.push('  • ' + item.value + ' — ' + item.properties.join(', '));
    });
    lines.push('');

    // CSS Conflicts
    const conflicts = scanConflicts();
    lines.push('CSS CONFLICTS');
    lines.push('-'.repeat(40));
    if (conflicts.length === 0) {
      lines.push('✓ No CSS conflicts detected');
    } else {
      lines.push('⚠ Found ' + conflicts.length + ' potential conflicts:');
      conflicts.forEach(item => {
        lines.push('  • ' + item.element + ' [' + item.type + ']');
        lines.push('    ' + item.detail);
        if (item.actual) lines.push('    Actual: ' + item.actual);
      });
    }
    lines.push('');

    // Theme Variables
    const variables = scanThemeVariables();
    lines.push('THEME VARIABLES (' + variables.length + ' found)');
    lines.push('-'.repeat(40));
    const colorVars = variables.filter(v => v.category === 'color');
    const fontVars = variables.filter(v => v.category === 'font');

    if (colorVars.length > 0) {
      lines.push('Color Variables (' + colorVars.length + '):');
      colorVars.slice(0, 10).forEach(v => {
        lines.push('  • ' + v.name + ': ' + v.value);
      });
      if (colorVars.length > 10) lines.push('  ... and ' + (colorVars.length - 10) + ' more');
    }
    lines.push('');
    if (fontVars.length > 0) {
      lines.push('Font Variables (' + fontVars.length + '):');
      fontVars.forEach(v => {
        lines.push('  • ' + v.name + ': ' + v.value);
      });
    }
    lines.push('');
    lines.push('='.repeat(60));

    return lines.join('\n');
  }

  // Copy all data to clipboard
  function copyAllToClipboard() {
    const data = scanStyles();
    const text = formatDataForClipboard(data);

    const copyBtn = document.querySelector('.debug-modal__copy');
    const copyText = copyBtn.querySelector('.debug-modal__copy-text');

    navigator.clipboard.writeText(text).then(() => {
      // Show success feedback
      copyText.textContent = 'Copied!';
      copyBtn.classList.add('debug-modal__copy--success');

      setTimeout(() => {
        copyText.textContent = 'Copy All';
        copyBtn.classList.remove('debug-modal__copy--success');
      }, 2000);
    }).catch(err => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      copyText.textContent = 'Copied!';
      copyBtn.classList.add('debug-modal__copy--success');

      setTimeout(() => {
        copyText.textContent = 'Copy All';
        copyBtn.classList.remove('debug-modal__copy--success');
      }, 2000);
    });
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

    // Spacing Panel
    const spacingPanel = modal.querySelector('[data-panel="spacing"]');
    const inconsistentSpacing = data.spacing.filter(s => !s.isConsistent);
    const consistentSpacing = data.spacing.filter(s => s.isConsistent);

    spacingPanel.innerHTML = `
      ${inconsistentSpacing.length > 0 ? `
        <div class="debug-modal__warning">Found ${inconsistentSpacing.length} non-standard spacing values:</div>
        <div class="debug-modal__list">
          ${inconsistentSpacing.map(item => `
            <div class="debug-modal__item debug-modal__item--error">
              <div class="debug-modal__item-value">${item.value}</div>
              <div class="debug-modal__item-props">${item.properties.join(', ')}</div>
              <div class="debug-modal__item-elements">${item.elements.slice(0, 2).join(', ')}</div>
            </div>
          `).join('')}
        </div>
      ` : '<div class="debug-modal__success">All spacing values are consistent</div>'}

      <div class="debug-modal__divider"></div>
      <div class="debug-modal__info">Consistent spacing values (${consistentSpacing.length}):</div>
      <div class="debug-modal__list debug-modal__list--grid">
        ${consistentSpacing.map(item => `
          <div class="debug-modal__item">
            <div class="debug-modal__item-value">${item.value}</div>
            <div class="debug-modal__item-props">${item.properties.slice(0, 3).join(', ')}</div>
          </div>
        `).join('')}
      </div>

      <div class="debug-modal__divider"></div>
      <div class="debug-modal__info">Expected spacing scale:</div>
      <div class="debug-modal__note">0, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 112, 128px</div>
    `;

    // Conflicts Panel
    const conflictsPanel = modal.querySelector('[data-panel="conflicts"]');
    const conflicts = scanConflicts();

    conflictsPanel.innerHTML = `
      ${conflicts.length > 0 ? `
        <div class="debug-modal__warning">Found ${conflicts.length} potential CSS conflicts:</div>
        <div class="debug-modal__list">
          ${conflicts.map(item => `
            <div class="debug-modal__item debug-modal__item--error">
              <div class="debug-modal__item-value">${item.element}</div>
              <div class="debug-modal__item-type">${item.type}</div>
              <div class="debug-modal__item-detail">${item.detail}</div>
              ${item.style ? `<div class="debug-modal__item-code">${item.style}</div>` : ''}
              ${item.actual ? `<div class="debug-modal__item-actual">Actual: ${item.actual}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : '<div class="debug-modal__success">No CSS conflicts detected</div>'}

      <div class="debug-modal__divider"></div>
      <div class="debug-modal__info">What this checks:</div>
      <div class="debug-modal__note">
        • Inline !important overrides<br>
        • Inline color overrides (not using theme variables)<br>
        • Style specificity conflicts
      </div>
    `;

    // Variables Panel
    const variablesPanel = modal.querySelector('[data-panel="variables"]');
    const variables = scanThemeVariables();

    const colorVars = variables.filter(v => v.category === 'color');
    const fontVars = variables.filter(v => v.category === 'font');
    const spacingVars = variables.filter(v => v.category === 'spacing');
    const otherVars = variables.filter(v => v.category === 'other' || v.category === 'border');

    variablesPanel.innerHTML = `
      <div class="debug-modal__info">Theme CSS Variables (${variables.length} found):</div>

      ${colorVars.length > 0 ? `
        <div class="debug-modal__var-section">
          <div class="debug-section-title">Color Variables (${colorVars.length})</div>
          <div class="debug-modal__list debug-modal__list--vars">
            ${colorVars.map(v => `
              <div class="debug-modal__var-item">
                <span class="debug-modal__var-name">${v.name}</span>
                <span class="debug-modal__var-value">
                  ${v.value.includes('rgb') || v.value.startsWith('#') ? `<span class="debug-color-preview" style="background:${v.value}"></span>` : ''}
                  ${v.value}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${fontVars.length > 0 ? `
        <div class="debug-modal__var-section">
          <div class="debug-section-title">Font Variables (${fontVars.length})</div>
          <div class="debug-modal__list debug-modal__list--vars">
            ${fontVars.map(v => `
              <div class="debug-modal__var-item">
                <span class="debug-modal__var-name">${v.name}</span>
                <span class="debug-modal__var-value">${v.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${spacingVars.length > 0 ? `
        <div class="debug-modal__var-section">
          <div class="debug-section-title">Spacing Variables (${spacingVars.length})</div>
          <div class="debug-modal__list debug-modal__list--vars">
            ${spacingVars.map(v => `
              <div class="debug-modal__var-item">
                <span class="debug-modal__var-name">${v.name}</span>
                <span class="debug-modal__var-value">${v.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${otherVars.length > 0 ? `
        <div class="debug-modal__var-section">
          <div class="debug-section-title">Other Variables (${otherVars.length})</div>
          <div class="debug-modal__list debug-modal__list--vars">
            ${otherVars.map(v => `
              <div class="debug-modal__var-item">
                <span class="debug-modal__var-name">${v.name}</span>
                <span class="debug-modal__var-value">${v.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;

    // Inspector Panel
    const inspectorPanel = modal.querySelector('[data-panel="inspector"]');
    inspectorPanel.innerHTML = `
      <div class="debug-modal__inspector-intro">
        <div class="debug-modal__info">Element Inspector</div>
        <p>Click the button below, then click on any element on the page to inspect its computed styles.</p>
        <button type="button" class="debug-modal__inspect-btn" id="start-inspector">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Start Inspector
        </button>
        <div class="debug-modal__note" style="margin-top: 12px;">
          Press <kbd>Esc</kbd> to cancel inspection mode
        </div>
      </div>
    `;

    // Add inspector button handler
    const inspectBtn = inspectorPanel.querySelector('#start-inspector');
    if (inspectBtn) {
      inspectBtn.addEventListener('click', () => {
        hideModal();
        setTimeout(() => enableInspector(), 100);
      });
    }
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
    scan: scanStyles,
    scanConflicts: scanConflicts,
    scanVariables: scanThemeVariables,
    inspect: enableInspector,
    stopInspect: disableInspector
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
