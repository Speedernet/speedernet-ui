import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const file = fileURLToPath(new URL('../src/lib/tooltip/tooltip.scss', import.meta.url));
const css = sass.compile(file).css;

test('tooltip shows on hover and keyboard focus, not after a mouse click', () => {
  assert.match(css, /\.sn-tooltip:is\(:hover, :has\(:focus-visible\)\)/);
  assert.doesNotMatch(css, /:focus-within/);
});

test('tooltip disables its animation under prefers-reduced-motion', () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
