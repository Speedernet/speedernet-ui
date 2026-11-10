import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as sass from 'sass';

const stylesDir = fileURLToPath(new URL('.', import.meta.url));
const file = fileURLToPath(new URL('../src/lib/app-header/app-header.scss', import.meta.url));
const prefix = '@speedernet/ui/styles/';

// Resolves `@speedernet/ui/styles/...` to this folder, as the library build does.
const libraryImporter = {
  findFileUrl(url) {
    if (!url.startsWith(prefix)) return null;
    return pathToFileURL(`${stylesDir}${url.slice(prefix.length)}`);
  },
};

const css = sass.compile(file, { importers: [libraryImporter] }).css;
const desktopQuery = '@media (min-width: 960px)';

/** Splits the stylesheet into the rules outside and inside the desktop media queries. */
function splitDesktop(source) {
  let outside = '';
  const blocks = [];
  let index = 0;
  for (;;) {
    const start = source.indexOf(desktopQuery, index);
    if (start === -1) break;
    outside += source.slice(index, start);
    const open = source.indexOf('{', start);
    let depth = 1;
    let end = open + 1;
    for (; depth > 0; end++) {
      if (source[end] === '{') depth++;
      if (source[end] === '}') depth--;
    }
    blocks.push(source.slice(open + 1, end - 1));
    index = end;
  }
  return { mobile: outside + source.slice(index), desktopBlocks: blocks };
}

const { mobile, desktopBlocks } = splitDesktop(css);
const desktop = desktopBlocks.join(' ');

/** Declarations of the first rule whose selector is exactly `selector`. */
function rule(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`(?:^|[{}\\s])${escaped}\\s*\\{([^}]*)\\}`));
  return match?.[1] ?? '';
}

test('hides the navigation and the user menu below desktop', () => {
  assert.match(rule(mobile, '.speed-app-header-nav'), /display:\s*none/);
  assert.match(rule(mobile, '.speed-app-header-user'), /display:\s*none/);
  assert.doesNotMatch(rule(mobile, '.speed-app-header-menu'), /display:\s*none/);
});

test('shows them from desktop and hides the mobile menu', () => {
  assert.ok(desktopBlocks.length > 0, 'expected a 960px media query');
  assert.match(rule(desktop, '.speed-app-header-nav'), /display:\s*flex/);
  assert.match(rule(desktop, '.speed-app-header-user'), /display:\s*block/);
  assert.match(rule(desktop, '.speed-app-header-menu'), /display:\s*none/);
});

test('truncates a long application name instead of overflowing on the navigation', () => {
  const name = rule(css, '.speed-app-header-name');
  assert.match(name, /min-width:\s*0/);
  assert.match(name, /overflow:\s*hidden/);
  assert.match(name, /text-overflow:\s*ellipsis/);
  assert.match(name, /white-space:\s*nowrap/);
});

test('truncates a long user name on one line', () => {
  const name = rule(css, '.speed-app-header-user-name');
  assert.match(name, /max-width:\s*16ch/);
  assert.match(name, /overflow:\s*hidden/);
  assert.match(name, /text-overflow:\s*ellipsis/);
  assert.match(name, /white-space:\s*nowrap/);
});
