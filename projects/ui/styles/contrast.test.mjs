// Contrast of every text / background association used by the components (WCAG 2.2, level AA).
// Values are computed from the compiled tokens, so a change in a color scale that breaks an
// association fails here. When a component starts using a new association, add it below.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const stylesDir = fileURLToPath(new URL('.', import.meta.url));
const css = sass.compile(`${stylesDir}index.scss`, { loadPaths: [stylesDir] }).css;

const TEXT = 4.5; // normal text
const NON_TEXT = 3; // borders, focus outlines and icons that carry meaning

const associations = [
  // Text on surfaces
  ['--color-text', '--color-surface', TEXT, 'text on cards, header, dialogs, fields'],
  ['--color-text', '--color-background', TEXT, 'page text'],
  ['--color-text-muted', '--color-surface', TEXT, 'help text, header subtitle'],
  ['--color-text-muted', '--color-background', TEXT, 'muted text on the page'],
  ['--color-danger', '--color-surface', TEXT, 'field error text'],
  // Text on tints and highlights
  ['--color-text', '--tint-neutral', TEXT, 'neutral badge, filter tabs'],
  ['--color-text', '--tint-primary', TEXT, 'primary badge'],
  ['--color-text', '--tint-primary-subtle', TEXT, 'hovered table row'],
  ['--color-text', '--tint-accent', TEXT, 'accent badge'],
  ['--color-text', '--tint-brand', TEXT, 'brand badge'],
  ['--color-text', '--tint-highlight', TEXT, 'hovered link'],
  ['--color-text', '--color-accent', TEXT, 'title highlight, header'],
  ['--color-text', '--cyan-100', TEXT, 'header link highlight'],
  // White text on dark fills
  ['--color-on-dark', '--color-text', TEXT, 'primary button, dark badge, active tab, table head'],
  ['--color-on-dark', '--color-night', TEXT, 'hovered primary button'],
  ['--color-on-dark', '--color-danger', TEXT, 'danger button'],
  ['--color-accent', '--color-text', TEXT, 'toast action'],
  ['--color-accent', '--color-night', TEXT, 'hovered toast action'],
  // Non-text elements
  ['--color-border-strong', '--color-surface', NON_TEXT, 'field border'],
  ['--color-danger', '--color-surface', NON_TEXT, 'invalid field border, error icon'],
  ['--color-text', '--color-background', NON_TEXT, 'focus outline'],
  ['--color-on-dark', '--color-text', NON_TEXT, 'focus outline inside a toast'],
  ['--color-on-dark', '--color-night', NON_TEXT, 'focus outline on a hovered toast button'],
];

const declarations = new Map(
  [...css.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
);

/** Resolves var() references down to a color value. */
function resolve(name) {
  const value = declarations.get(name);
  assert.ok(value, `${name} is not declared`);
  const reference = value.match(/^var\((--[\w-]+)\)$/);
  return reference ? resolve(reference[1]) : value;
}

/** Linear sRGB channels (0-1) of an "oklch(L% C H)" or "#rrggbb" value. */
function linearRgb(value) {
  const hex = value.match(/^#([\da-f]{6})$/i);
  if (hex) {
    return [0, 2, 4].map((i) => {
      const v = parseInt(hex[1].slice(i, i + 2), 16) / 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
  }
  const oklch = value.match(/^oklch\(([\d.]+)% ([\d.]+) ([\d.]+)\)$/);
  assert.ok(oklch, `unsupported color value: ${value}`);
  const [l, c, h] = [Number(oklch[1]) / 100, Number(oklch[2]), (Number(oklch[3]) * Math.PI) / 180];
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const [lc, mc, sc] = [
    l + 0.3963377774 * a + 0.2158037573 * b,
    l - 0.1055613458 * a - 0.0638541728 * b,
    l - 0.0894841775 * a - 1.291485548 * b,
  ].map((v) => v ** 3);
  return [
    4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
    -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
    -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc,
  ].map((v) => Math.min(1, Math.max(0, v)));
}

function contrast(foreground, background) {
  const [l1, l2] = [foreground, background]
    .map((name) => linearRgb(resolve(name)))
    .map(([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b)
    .sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

for (const [foreground, background, minimum, usage] of associations) {
  test(`${foreground} on ${background} reaches ${minimum}:1 (${usage})`, () => {
    const ratio = contrast(foreground, background);
    assert.ok(ratio >= minimum, `${ratio.toFixed(2)}:1 is below ${minimum}:1`);
  });
}

test('measures the brand text color on white as 13:1', () => {
  // Reference value checked with an external contrast checker (#313131 on #ffffff).
  assert.equal(contrast('--color-text', '--color-surface').toFixed(1), '13.0');
});
