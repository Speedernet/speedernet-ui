import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const file = fileURLToPath(new URL('../src/lib/action-menu/action-menu.scss', import.meta.url));
const css = sass.compile(file).css;

test('action menu uses tokens only, no raw colors', () => {
  assert.doesNotMatch(css, /#[\da-f]{3,8}\b|rgba?\(|oklch\(/i);
});

test('action menu highlights its button while the menu is open', () => {
  assert.match(
    css,
    /\.sn-action-menu-trigger\[aria-expanded=true\]\s*\{\s*background: var\(--tint-highlight\)/,
  );
});
