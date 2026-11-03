import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const file = fileURLToPath(new URL('../src/lib/choice/choice.scss', import.meta.url));
const css = sass.compile(file).css;

test('choice controls use tokens only, no raw colors', () => {
  assert.doesNotMatch(css, /#[\da-f]{3,8}\b|rgba?\(|oklch\(/i);
});

test('choice labels are clickable, and look disabled with their input', () => {
  assert.match(css, /\.speed-choice-label\s*\{\s*cursor: pointer/);
  assert.match(
    css,
    /\.speed-choice:has\(input:disabled\) \.speed-choice-label\s*\{\s*color: var\(--color-text-muted\)/,
  );
});

test('switch keeps the native checkbox over the track, focusable and clickable', () => {
  assert.match(
    css,
    /\.speed-switch \.speed-choice-control > input\s*\{[^}]*position: absolute;[^}]*opacity: 0/,
  );
  assert.doesNotMatch(css, /\.speed-switch[^{]*input\s*\{[^}]*(display: none|visibility: hidden)/);
});

test('switch shows keyboard focus on its track', () => {
  assert.match(
    css,
    /\.speed-switch \.speed-choice-control > input:focus-visible \+ \.speed-switch-track\s*\{\s*outline: 3px solid var\(--color-text\)/,
  );
});

test('switch disables its animation under prefers-reduced-motion', () => {
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.speed-switch-track,\s*\.speed-switch-track::after\s*\{\s*transition: none/,
  );
});
