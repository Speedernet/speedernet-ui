import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const stylesDir = fileURLToPath(new URL('.', import.meta.url));
const css = sass.compile(`${stylesDir}index.scss`, { loadPaths: [stylesDir] }).css;

test('compiles the design tokens', () => {
  assert.match(css, /--cyan-200: oklch\(90\.5% 0\.088 205\.7\)/);
  assert.match(css, /--color-danger: var\(--red-700\)/);
});

test('anchors the brand colors in the color scales', () => {
  assert.match(css, /--cyan-400: oklch\(76\.1% 0\.129 205\.7\)/);
  assert.match(css, /--yellow-200: oklch\(91\.5% 0\.166 99\)/);
  assert.match(css, /--red-600: oklch\(63\.6% 0\.229 25\.4\)/);
  assert.match(css, /--gray-900: oklch\(31\.3% 0 0\)/);
  assert.match(css, /--night-950: oklch\(22\.7% 0\.012 270\.8\)/);
  assert.match(css, /--color-primary: var\(--cyan-400\)/);
  assert.match(css, /--color-accent: var\(--yellow-200\)/);
  assert.match(css, /--color-brand: var\(--red-600\)/);
  assert.match(css, /--color-text: var\(--gray-900\)/);
  assert.match(css, /--color-night: var\(--night-950\)/);
});

test('declares the self-hosted font under /speedernet-ui/', () => {
  assert.ok(css.includes('url("/speedernet-ui/fonts/mulish-latin.woff2")'));
});

test('emits the global classes and native field rules', () => {
  assert.match(
    css,
    /\.sn-highlight\s*{[^}]*linear-gradient\(transparent 60%, var\(--color-accent\) 60%\)/,
  );
  assert.match(css, /accent-color: var\(--color-text\)/);
  assert.ok(css.includes('@media (min-width: 960px)'));
});
