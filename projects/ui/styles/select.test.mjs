import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const file = fileURLToPath(new URL('../src/lib/select/select.scss', import.meta.url));
const css = sass.compile(file).css;

test('select uses tokens only, no raw colors', () => {
  assert.doesNotMatch(css, /#[\da-f]{3,8}\b|rgba?\(|oklch\(/i);
});

test('select replaces the browser arrow with a chevron that lets clicks through', () => {
  assert.match(css, /\.sn-select > select\s*\{[^}]*appearance: none/);
  assert.match(css, /\.sn-select-chevron\s*\{[^}]*pointer-events: none/);
});

test('select keeps room for the chevron so the text never runs under it', () => {
  assert.match(css, /\.sn-select > select\s*\{[^}]*padding-right: 2\.75rem/);
});

test('disabled select looks disabled', () => {
  assert.match(css, /\.sn-select > select:disabled\s*\{[^}]*background: var\(--color-disabled\)/);
});
