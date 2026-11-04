import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { en } from './zod-locales';

const require = createRequire(import.meta.url);
const zodRoot = path.dirname(require.resolve('zod/package.json'));

type Resolve = (
  context: { originModulePath: string; resolveRequest: () => unknown },
  moduleName: string,
  platform: string,
) => unknown;
const metroConfig: { resolver: { resolveRequest: Resolve } } = require('../../metro.config.js');

/** zod modules that import the full locale index, which the Metro config swaps out. */
function filesImportingLocaleIndex(): string[] {
  return ['core', 'classic', 'mini'].flatMap((folder) =>
    readdirSync(path.join(zodRoot, 'v4', folder))
      .filter((file) => file.endsWith('.js'))
      .map((file) => path.join(zodRoot, 'v4', folder, file))
      .filter((file) => readFileSync(file, 'utf8').includes('"../locales/index.js"')),
  );
}

describe('English-only zod locales', () => {
  it('exports the same English locale as zod', () => {
    expect(en).toBe(z.locales.en);
  });

  it('still matches how zod loads its locales', () => {
    // If a zod upgrade moves these imports, the swap stops applying and the bundle grows again.
    expect(filesImportingLocaleIndex().length).toBeGreaterThan(0);
    expect(readFileSync(path.join(zodRoot, 'v4/classic/schemas.js'), 'utf8')).toContain(
      'import en from "../locales/en.js"',
    );
  });

  it('is what Metro resolves for every zod import of the locale index', () => {
    const stub = fileURLToPath(new URL('./zod-locales.ts', import.meta.url));
    for (const originModulePath of filesImportingLocaleIndex()) {
      const resolved = metroConfig.resolver.resolveRequest(
        { originModulePath, resolveRequest: () => null },
        '../locales/index.js',
        'web',
      );
      expect(resolved).toEqual({ type: 'sourceFile', filePath: stub });
    }
  });
});
