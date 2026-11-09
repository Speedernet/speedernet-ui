import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const file = fileURLToPath(new URL('../src/lib/file-input/file-input.scss', import.meta.url));
const css = sass.compile(file).css;

test('file input uses tokens only, no raw colors', () => {
  assert.doesNotMatch(css, /#[\da-f]{3,8}\b|rgba?\(|oklch\(/i);
});

test('file input stretches the transparent native input over the drop zone', () => {
  assert.match(css, /\.speed-file-input-zone > input\s*\{[^}]*inset: 0[^}]*opacity: 0/);
  assert.match(css, /\.speed-file-input-zone\s*\{[^}]*position: relative/);
});

test('file input draws a dashed drop zone that turns solid and tinted under a drag', () => {
  assert.match(
    css,
    /\.speed-file-input-zone\s*\{[^}]*border: 2px dashed var\(--color-border-strong\)/,
  );
  assert.match(
    css,
    /\.speed-file-input-zone\.speed-file-input-dragging\s*\{[^}]*border-style: solid[^}]*background: var\(--tint-primary-subtle\)/,
  );
});

test('file input shows the focus, error and disabled states of its native input', () => {
  assert.match(css, /\.speed-file-input-zone:has\(> input:focus-visible\)\s*\{[^}]*box-shadow/);
  assert.match(
    css,
    /\.speed-file-input-zone:has\(> input\[aria-invalid=true\]\)\s*\{[^}]*var\(--color-danger\)/,
  );
  assert.match(
    css,
    /\.speed-file-input-zone:has\(> input:disabled\)\s*\{[^}]*background: var\(--color-disabled\)/,
  );
});

test('file input cuts long file names instead of widening the list', () => {
  assert.match(css, /\.speed-file-input-name\s*\{[^}]*text-overflow: ellipsis/);
});

test('file input hides the remove buttons of a disabled input', () => {
  assert.match(
    css,
    /\.speed-file-input:has\(input:disabled\) \.speed-file-input-remove\s*\{\s*display: none/,
  );
});

test('file input disables its animations under prefers-reduced-motion', () => {
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.speed-file-input-zone,\s*\.speed-file-input-icon,\s*\.speed-file-input-button\s*\{\s*transition: none/,
  );
});

test('file input zone grows to the height given to the component', () => {
  assert.match(css, /\.speed-file-input-zone\s*\{[^}]*flex: 1 0 auto[^}]*justify-content: center/);
});

test('file input zone size can be tuned with CSS variables, with defaults', () => {
  assert.match(
    css,
    /\.speed-file-input-zone\s*\{[^}]*min-height: var\(--speed-file-input-min-height, auto\)/,
  );
  assert.match(
    css,
    /\.speed-file-input-zone\s*\{[^}]*padding: var\(--speed-file-input-padding, var\(--space-4\) var\(--space-3\)\)/,
  );
});

test('filled file input takes its whole container and scrolls its file list', () => {
  assert.match(
    css,
    /\.speed-file-input-fill\s*\{[^}]*align-self: stretch[^}]*width: 100%[^}]*height: 100%/,
  );
  assert.match(css, /\.speed-file-input-fill \.speed-file-input-files\s*\{[^}]*overflow-y: auto/);
});
