// packages/components/src/utils/isDark.ts

/**
 * @fileoverview Dark Mode Detection Utilities
 * @description Utility functions and hooks for detecting dark mode state. Uses CSS custom properties set by the framework's theme system.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { useEffect, useState } from 'react';

/**
 * Utility to detect if the current theme is dark mode
 * Uses CSS custom properties set by the framework's theme system
 *
 * @returns boolean indicating if dark mode is active
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function isDark(): boolean {
  if (typeof window === 'undefined') {
    return false; // SSR safe default
  }

  try {
    const root = document.documentElement;

    // First try to read the CSS custom property set by the framework
    const isDarkValue = getComputedStyle(root)
      .getPropertyValue('--theme-is-dark')
      .trim();

    if (isDarkValue === '1') {
      return true;
    }
    if (isDarkValue === '0') {
      return false;
    }

    // Fallback to checking for 'dark' class
    return root.classList.contains('dark');
  } catch {
    // Fallback to checking for 'dark' class if CSS custom property fails
    return document.documentElement.classList.contains('dark');
  }
}

/**
 * Hook version for React components
 * Returns the current dark mode state and updates when theme changes
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function useIsDark(): boolean {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Set initial state
    setDarkMode(isDark());

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      setDarkMode(isDark());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return darkMode;
}
