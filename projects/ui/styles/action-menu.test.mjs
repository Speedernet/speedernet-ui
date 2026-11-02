import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const file = fileURLToPath(new URL('../src/lib/action-menu/action-menu.scss', import.meta.url));
const css = sass.compile(file).css;

test('action menu uses tokens only, no raw colors', () => {
  assert.doesNotMatch(css, /#[\da-f]{3,8}\b|rgba?\(|oklch\(/i);
});

test('action menu hides its closed list', () => {
  assert.match(css, /\.sn-action-menu-list\[hidden\]\s*\{\s*display: none/);
});

test('menu items show keyboard focus with a highlight and a ring', () => {
  assert.match(css, /\.sn-menu-item:hover:not\(:disabled\), \.sn-menu-item:focus-visible\s*\{/);
  assert.match(css, /\.sn-menu-item:focus-visible\s*\{\s*outline-offset: -3px/);
});

test('action menu disables its animation under prefers-reduced-motion', () => {
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.sn-action-menu-list\s*\{\s*animation: none/,
  );
});
