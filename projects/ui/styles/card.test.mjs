import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as sass from 'sass';

const stylesDir = fileURLToPath(new URL('.', import.meta.url));
const file = fileURLToPath(new URL('../src/lib/card/card.scss', import.meta.url));
const prefix = '@speedernet/ui/styles/';
const importer = {
  findFileUrl(url) {
    return url.startsWith(prefix) ? pathToFileURL(`${stylesDir}${url.slice(prefix.length)}`) : null;
  },
};
const css = sass.compile(file, { importers: [importer] }).css;

test('card content keeps its natural width while actions stay full width', () => {
  assert.match(css, /\.speed-card\s*\{[^}]*align-items:\s*flex-start/);
  assert.match(css, /\[speedCardActions\]\s*\{[^}]*align-self:\s*stretch/);
});
