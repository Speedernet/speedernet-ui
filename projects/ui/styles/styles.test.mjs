import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const stylesDir = fileURLToPath(new URL('.', import.meta.url));
const css = sass.compile(`${stylesDir}index.scss`, { loadPaths: [stylesDir] }).css;

test('compiles the design tokens', () => {
  assert.match(css, /--cyan-200: oklch\(87\.4% 0\.129 205\.728\)/);
  assert.match(css, /--color-danger: var\(--red-600\)/);
});

test('anchors the brand colors in the color scales', () => {
  assert.match(css, /--cyan-500: oklch\(76\.1% 0\.129 205\.728\)/);
  assert.match(css, /--yellow-500: oklch\(91\.5% 0\.166 98\.959\)/);
  assert.match(css, /--red-500: oklch\(63\.6% 0\.229 25\.283\)/);
  assert.match(css, /--gray-900: oklch\(31\.3% 0 0\)/);
  assert.match(css, /--night-950: oklch\(22\.7% 0\.012 270\.8\)/);
  assert.match(css, /--color-primary: var\(--cyan-500\)/);
  assert.match(css, /--color-accent: var\(--yellow-500\)/);
  assert.match(css, /--color-brand: var\(--red-500\)/);
  assert.match(css, /--color-text: var\(--gray-900\)/);
  assert.match(css, /--color-night: var\(--night-950\)/);
});

test('keeps every color scale ordered from light to dark', () => {
  for (const scale of ['cyan', 'yellow', 'red', 'night', 'gray']) {
    const lightness = [...css.matchAll(new RegExp(`--${scale}-\\d+: oklch\\(([\\d.]+)%`, 'g'))].map(
      (match) => Number(match[1]),
    );
    assert.ok(lightness.length >= 10, scale);
    lightness.slice(1).forEach((l, i) => assert.ok(l < lightness[i], `${scale}: ${lightness}`));
  }
});

test('keeps every OKLCH color inside the sRGB gamut', () => {
  for (const [, name, l, c, h] of css.matchAll(
    /--([\w-]+): oklch\(([\d.]+)% ([\d.]+) ([\d.]+)\)/g,
  )) {
    const a = c * Math.cos((h * Math.PI) / 180);
    const b = c * Math.sin((h * Math.PI) / 180);
    const [lc, mc, sc] = [
      l / 100 + 0.3963377774 * a + 0.2158037573 * b,
      l / 100 - 0.1055613458 * a - 0.0638541728 * b,
      l / 100 - 0.0894841775 * a - 1.291485548 * b,
    ].map((v) => v ** 3);
    const rgb = [
      4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
      -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
      -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc,
    ];
    // Small tolerance for the rounding of the published values.
    assert.ok(
      rgb.every((v) => v >= -0.0005 && v <= 1.0005),
      `--${name} is out of the sRGB gamut`,
    );
  }
});

test('gives a step the same lightness in the night and gray scales', () => {
  for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
    const lightness = ['night', 'gray'].map(
      (scale) => css.match(new RegExp(`--${scale}-${step}: oklch\\(([\\d.]+)%`))[1],
    );
    assert.equal(new Set(lightness).size, 1, `step ${step}: ${lightness}`);
  }
});

test('declares the self-hosted font relative to the styles, for the application build to bundle', () => {
  for (const file of ['mulish-latin.woff2', 'mulish-latin-ext.woff2']) {
    assert.ok(css.includes(`url("../assets/fonts/${file}")`), file);
    assert.ok(existsSync(fileURLToPath(new URL(`../assets/fonts/${file}`, import.meta.url))), file);
  }
});

test('emits the global classes and native field rules', () => {
  assert.match(
    css,
    /\.speed-highlight\s*{[^}]*linear-gradient\(transparent 60%, var\(--color-accent\) 60%\)/,
  );
  assert.match(css, /accent-color: var\(--color-text\)/);
  assert.ok(css.includes('@media (min-width: 960px)'));
});
