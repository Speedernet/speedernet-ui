import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as sass from 'sass';

const stylesDir = fileURLToPath(new URL('.', import.meta.url));
const file = fileURLToPath(new URL('../src/lib/button/button.scss', import.meta.url));
const prefix = '@speedernet/ui/styles/';
const importer = {
  findFileUrl(url) {
    return url.startsWith(prefix) ? pathToFileURL(`${stylesDir}${url.slice(prefix.length)}`) : null;
  },
};
const css = sass.compile(file, { importers: [importer] }).css;

test('button uses tokens only, no raw rgba colors', () => {
  assert.doesNotMatch(css, /rgba\(/);
});

test('button disables lift and sweep under prefers-reduced-motion', () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
