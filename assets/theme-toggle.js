/**
 * Theme Toggle - Light/Dark Mode
 * Handles theme switching and persists user preference in localStorage
 * Similar to next-themes pattern from React
 *
 * Features:
 * - FOUC prevention (inline script in head sets theme before CSS loads)
 * - System preference detection (prefers-color-scheme)
 * - localStorage persistence
 * - Smooth transitions after initial load
 * - Custom event dispatch for other scripts
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'theme-preference';
  const THEME_LIGHT = 'light';
  const THEME_DARK = 'dark';
  const TRANSITION_DURATION = 200; // ms - matches CSS transition

  /**
   * Get the user's theme preference
   * Priority: localStorage > default (light)
   */
  function getThemePreference() {
    // Check localStorage first
    const storedTheme = localStorage.getItem(STORAGE_KEY);
    if (storedTheme) {
      return storedTheme;
    }

    // Default to light mode for new visitors
    return THEME_LIGHT;
  }

  /**
   * Apply theme to the document
   * @param {string} theme - 'light' or 'dark'
   * @param {boolean} withTransition - whether to show transition effect
   */
  function setTheme(theme, withTransition = true) {
    const html = document.documentElement;
    const isReady = html.classList.contains('theme-ready');

    // If theme is ready and transition requested, do smooth transition
    if (isReady && withTransition) {
      // Optional: Use overlay for extra smooth transition
      // Uncomment below if you want the overlay effect
      // showTransitionOverlay();
    }

    // Set data-theme attribute on HTML element
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update button states
    updateToggleButtons(theme);

    // Update meta theme-color for mobile browsers
    updateMetaThemeColor(theme);

    // Dispatch custom event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: {
        theme,
        isInitial: !isReady
      }
    }));
  }

  /**
   * Update meta theme-color for mobile browser chrome
   */
  function updateMetaThemeColor(theme) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }

    // Set appropriate color based on theme
    metaThemeColor.content = theme === THEME_DARK ? '#0F172A' : '#F5F7FA';
  }

  /**
   * Show transition overlay for smooth theme switch (optional)
   */
  function showTransitionOverlay() {
    let overlay = document.querySelector('.theme-transition-overlay');

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'theme-transition-overlay';
      document.body.appendChild(overlay);
    }

    // Show overlay
    overlay.classList.add('active');
    overlay.classList.remove('fade-out');

    // Fade out after theme is applied
    setTimeout(() => {
      overlay.classList.add('fade-out');
      overlay.classList.remove('active');
    }, 50);

    // Remove completely after animation
    setTimeout(() => {
      overlay.classList.remove('fade-out');
    }, TRANSITION_DURATION + 50);
  }

  /**
   * Update all toggle button states
   */
  function updateToggleButtons(theme) {
    // Update aria-pressed states on buttons
    const lightBtns = document.querySelectorAll('.theme-toggle__btn--light');
    const darkBtns = document.querySelectorAll('.theme-toggle__btn--dark');

    lightBtns.forEach(btn => {
      btn.setAttribute('aria-pressed', theme === THEME_LIGHT);
    });

    darkBtns.forEach(btn => {
      btn.setAttribute('aria-pressed', theme === THEME_DARK);
    });
  }

  /**
   * Mark theme as ready - enables CSS transitions
   */
  function setThemeReady() {
    // Small delay to ensure CSS is fully loaded
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.add('theme-ready');
      });
    });
  }

  /**
   * Initialize theme toggle functionality
   */
  function init() {
    // Apply saved theme (without transition on initial load)
    const savedTheme = getThemePreference();
    setTheme(savedTheme, false);

    // Mark theme as ready after a brief delay (enables transitions)
    setThemeReady();

    // Set up click handlers for theme buttons
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.theme-toggle__btn');
      if (btn) {
        e.preventDefault();
        const themeValue = btn.getAttribute('data-theme-value');
        if (themeValue) {
          setTheme(themeValue, true);
        }
      }
    });

  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Early theme application (backup - main FOUC prevention is inline in head)
  // This runs immediately when script is parsed
  const savedTheme = getThemePreference();
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Expose functions globally for external use (similar to next-themes useTheme hook)
  window.ThemeToggle = {
    setTheme: function(theme) {
      setTheme(theme, true);
    },
    getTheme: function() {
      return document.documentElement.getAttribute('data-theme') || THEME_LIGHT;
    },
    toggle: function() {
      const currentTheme = this.getTheme();
      setTheme(currentTheme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT, true);
    },
    // Expose constants
    LIGHT: THEME_LIGHT,
    DARK: THEME_DARK
  };
})();
