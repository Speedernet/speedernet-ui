// Runs after `npm run build:ui`. ng-packagr copies projects/ui/package.json into dist/ui as is,
// including publishConfig.directory, which only tells `changeset publish` where the built package is:
// npm doesn't know this key inside the published package and warns about it, so remove it there.
import { readFileSync, writeFileSync } from 'node:fs';

const file = new URL('../dist/ui/package.json', import.meta.url);
const manifest = JSON.parse(readFileSync(file, 'utf8'));
delete manifest.publishConfig?.directory;
writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
