import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const stylesDir = fileURLToPath(new URL('.', import.meta.url));
const css = sass.compile(`${stylesDir}index.scss`, { loadPaths: [stylesDir] }).css;

test('compiles the design tokens', () => {
  assert.match(css, /--cyan-200: oklch\(90\.5% 0\.088 205\.7\)/);
  assert.match(css, /--color-text: oklch\(31\.3% 0 0\)/);
  assert.match(css, /--color-danger: var\(--red-700\)/);
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
