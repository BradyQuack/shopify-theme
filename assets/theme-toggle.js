/**
 * Theme Toggle - Light/Dark Mode
 * Handles theme switching and persists user preference in localStorage
 * Similar to next-themes pattern
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'theme-preference';
  const THEME_LIGHT = 'light';
  const THEME_DARK = 'dark';

  /**
   * Get the user's theme preference
   * Priority: localStorage > system preference > default (light)
   */
  function getThemePreference() {
    // Check localStorage first
    const storedTheme = localStorage.getItem(STORAGE_KEY);
    if (storedTheme) {
      return storedTheme;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEME_DARK;
    }

    // Default to light
    return THEME_LIGHT;
  }

  /**
   * Apply theme to the document
   */
  function setTheme(theme) {
    // Set data-theme attribute on HTML element (similar to next-themes class approach)
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update button states
    updateToggleButtons(theme);

    // Dispatch custom event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
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
   * Initialize theme toggle functionality
   */
  function init() {
    // Apply saved theme immediately
    const savedTheme = getThemePreference();
    setTheme(savedTheme);

    // Set up click handlers for theme buttons
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.theme-toggle__btn');
      if (btn) {
        e.preventDefault();
        const themeValue = btn.getAttribute('data-theme-value');
        if (themeValue) {
          setTheme(themeValue);
        }
      }
    });

    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem(STORAGE_KEY)) {
          setTheme(e.matches ? THEME_DARK : THEME_LIGHT);
        }
      });
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also run early to prevent flash of wrong theme
  const savedTheme = getThemePreference();
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Expose functions globally for external use (similar to next-themes useTheme hook)
  window.ThemeToggle = {
    setTheme: setTheme,
    getTheme: function() {
      return document.documentElement.getAttribute('data-theme') || THEME_LIGHT;
    },
    toggle: function() {
      const currentTheme = this.getTheme();
      setTheme(currentTheme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT);
    }
  };
})();
