import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { getPurifier } from '../sanitizeDom.server';

const packageDir = resolve(__dirname, '../../..');

describe('sanitizeDom.server', () => {
  it('loads jsdom with require() alone, as Vercel functions do (no require of ES modules)', () => {
    const result = spawnSync(
      process.execPath,
      ['--no-experimental-require-module', '-e', "require('jsdom')"],
      { cwd: packageDir, encoding: 'utf8' }
    );
    expect(result.stderr).not.toContain('ERR_REQUIRE_ESM');
    expect(result.status).toBe(0);
  });

  it('creates one DOMPurify on jsdom, on first use', () => {
    const purifier = getPurifier();
    expect(purifier.isSupported).toBe(true);
    expect(getPurifier()).toBe(purifier);
    expect(purifier.sanitize('<p>a<script>x()</script></p>')).toBe('<p>a</p>');
  });
});
