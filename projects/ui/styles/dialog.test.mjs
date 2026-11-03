import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as sass from 'sass';

const stylesDir = fileURLToPath(new URL('.', import.meta.url));
const file = fileURLToPath(new URL('../src/lib/dialog/dialog.scss', import.meta.url));
const prefix = '@speedernet/ui/styles/';
const importer = {
  findFileUrl(url) {
    return url.startsWith(prefix) ? pathToFileURL(`${stylesDir}${url.slice(prefix.length)}`) : null;
  },
};
const css = sass.compile(file, { importers: [importer] }).css;

test('dialog uses tokens only, no raw colors', () => {
  assert.doesNotMatch(css, /#[\da-f]{3,8}\b|rgba?\(|oklch\(/i);
});

test('dialog dims the page with the backdrop token', () => {
  assert.match(css, /\.speed-dialog::backdrop\s*\{\s*background: var\(--color-backdrop\)/);
});

test('dialog body scrolls so the title and actions stay visible', () => {
  assert.match(css, /\.speed-dialog \.speed-dialog-body\s*\{[^}]*overflow-y: auto/);
});

test('dialog disables its opening animation under prefers-reduced-motion', () => {
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.speed-dialog\[open\]\s*\{\s*animation: none/,
  );
});
