import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const file = fileURLToPath(new URL('../src/lib/menu/menu.scss', import.meta.url));
const css = sass.compile(file).css;

test('menu uses tokens only, no raw colors', () => {
  assert.doesNotMatch(css, /#[\da-f]{3,8}\b|rgba?\(|oklch\(/i);
});

test('menu hides its closed list', () => {
  assert.match(css, /\.speed-menu\[hidden\]\s*\{\s*display: none/);
});

test('menu list is fixed in the top layer, not clipped by a scrolling parent', () => {
  assert.match(css, /\.speed-menu\s*\{[^}]*position: fixed;[^}]*inset: auto/);
});

test('menu items show keyboard focus with a highlight and a ring', () => {
  assert.match(
    css,
    /\.speed-menu-item:hover:not\(:disabled\), \.speed-menu-item:focus-visible\s*\{/,
  );
  assert.match(css, /\.speed-menu-item:focus-visible\s*\{\s*outline-offset: -3px/);
});

test('menu disables its animation under prefers-reduced-motion', () => {
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.speed-menu\s*\{\s*animation: none/,
  );
});
