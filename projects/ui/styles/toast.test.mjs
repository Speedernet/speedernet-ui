import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as sass from 'sass';

const stylesDir = fileURLToPath(new URL('.', import.meta.url));
const file = fileURLToPath(new URL('../src/lib/toast/toast.scss', import.meta.url));
const prefix = '@speedernet/ui/styles/';
const importer = {
  findFileUrl(url) {
    return url.startsWith(prefix) ? pathToFileURL(`${stylesDir}${url.slice(prefix.length)}`) : null;
  },
};
const css = sass.compile(file, { importers: [importer] }).css;

test('toast uses tokens only, no raw colors', () => {
  assert.doesNotMatch(css, /#[\da-f]{3,8}\b|rgba?\(|oklch\(/i);
});

test('toast shows a white focus ring on its dark background', () => {
  assert.match(css, /\.sn-toast :focus-visible\s*\{\s*outline-color: var\(--color-on-dark\)/);
});

test('toast announcer is visually hidden, not hidden from screen readers', () => {
  assert.match(css, /\.sn-toast-announcer\s*\{[^}]*clip-path: inset\(50%\)/);
  assert.doesNotMatch(css, /\.sn-toast-announcer\s*\{[^}]*display: none/);
});

test('toast disables its animation under prefers-reduced-motion', () => {
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.sn-toast\s*\{\s*animation: none/,
  );
});
