import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, relative, join } from 'path';

import { describe, it, expect } from 'vitest';

/** Recursively find all CSS files under a directory (posix-style relative paths). */
function findCssFiles(dir: string, base: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findCssFiles(full, base));
    } else if (entry.endsWith('.css')) {
      results.push(relative(base, full).replace(/\\/g, '/'));
    }
  }
  return results;
}

/**
 * Ensures every component CSS file is registered in styles/index.css.
 * Catches the "added component but forgot to register CSS" class of bugs.
 */
describe('styles/index.css completeness', () => {
  const stylesDir = resolve(__dirname, '..', 'styles');
  const srcDir = resolve(__dirname, '..');
  const indexCssPath = resolve(stylesDir, 'index.css');
  const indexCss = readFileSync(indexCssPath, 'utf-8');

  // Extract all @import paths from index.css (normalized to forward slashes)
  const importedPaths = new Set(
    [...indexCss.matchAll(/@import\s+['"]([^'"]+)['"]/g)].map((m) =>
      m[1]!.replace(/\\/g, '/')
    )
  );

  // Find all CSS files under src/ (excluding styles/ directory itself — those are aggregated, not components)
  const allCssFiles = findCssFiles(srcDir, srcDir).filter(
    (f: string) => !f.startsWith('styles/')
  );

  it('should have at least one CSS file to validate', () => {
    expect(allCssFiles.length).toBeGreaterThan(0);
  });

  it('every component CSS file should be imported in styles/index.css', () => {
    const missing: string[] = [];

    for (const cssFile of allCssFiles) {
      // Build the relative import path from styles/index.css to the CSS file
      const absolutePath = resolve(srcDir, cssFile);
      const relFromStyles = relative(stylesDir, absolutePath).replace(
        /\\/g,
        '/'
      );
      // Normalize: ensure it starts with ../
      const importPath = relFromStyles.startsWith('.')
        ? relFromStyles
        : `./${relFromStyles}`;

      if (!importedPaths.has(importPath)) {
        missing.push(cssFile);
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `${missing.length} CSS file(s) not imported in styles/index.css:\n` +
          missing.map((f) => `  - ${f}`).join('\n') +
          '\n\nAdd @import for each in packages/components/src/styles/index.css'
      );
    }
  });

  it('no stale imports — every imported CSS file should exist', () => {
    const stale: string[] = [];

    for (const importPath of importedPaths) {
      // Skip non-relative imports (e.g., npm packages)
      if (!importPath.startsWith('.')) continue;
      const absolutePath = resolve(stylesDir, importPath);
      try {
        readFileSync(absolutePath);
      } catch {
        stale.push(importPath);
      }
    }

    if (stale.length > 0) {
      throw new Error(
        `${stale.length} stale import(s) in styles/index.css (file not found):\n` +
          stale.map((f) => `  - ${f}`).join('\n')
      );
    }
  });
});
