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

test('select draws its option list in a white rounded panel where browsers allow it', () => {
  assert.match(css, /@supports \(appearance: base-select\)/);
  assert.match(
    css,
    /\.sn-select > select::picker\(select\)\s*\{[^}]*border-radius: var\(--radius\)/,
  );
  assert.match(
    css,
    /\.sn-select option:hover:not\(:disabled\), \.sn-select option:focus-visible\s*\{/,
  );
});

test('select disables the chevron animation under prefers-reduced-motion', () => {
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.sn-select-chevron\s*\{\s*transition: none/,
  );
});
