/**
 * Theme Toggle - Light/Dark Mode
 * Handles theme switching and persists user preference in localStorage
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
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update all toggle buttons
    updateToggleButtons(theme);

    // Dispatch custom event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  /**
   * Toggle between light and dark themes
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || THEME_LIGHT;
    const newTheme = currentTheme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
    setTheme(newTheme);
  }

  /**
   * Update all toggle button states
   */
  function updateToggleButtons(theme) {
    const toggles = document.querySelectorAll('.theme-toggle__switch');
    toggles.forEach(toggle => {
      toggle.setAttribute('aria-pressed', theme === THEME_DARK);
      toggle.setAttribute('aria-label', `Switch to ${theme === THEME_DARK ? 'light' : 'dark'} mode`);
    });
  }

  /**
   * Initialize theme toggle functionality
   */
  function init() {
    // Apply saved theme immediately
    const savedTheme = getThemePreference();
    setTheme(savedTheme);

    // Set up toggle button click handlers
    document.addEventListener('click', function(e) {
      if (e.target.closest('.theme-toggle__switch') || e.target.closest('.theme-toggle')) {
        e.preventDefault();
        toggleTheme();
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

  // Expose functions globally for external use
  window.ThemeToggle = {
    toggle: toggleTheme,
    set: setTheme,
    get: function() {
      return document.documentElement.getAttribute('data-theme') || THEME_LIGHT;
    }
  };
})();
