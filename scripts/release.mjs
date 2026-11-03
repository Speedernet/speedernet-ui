// Publishes @speedernet/ui from dist/ui and tags it, unless this version is already on the registry.
// Run by the Release workflow (changesets/action) on every push to main without pending changesets.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const { name, version, publishConfig } = JSON.parse(
  readFileSync(new URL('../projects/ui/package.json', import.meta.url), 'utf8'),
);
const run = (command) => execSync(command, { stdio: 'inherit' });

let published = false;
try {
  const found = execSync(
    `npm view ${name}@${version} version --registry ${publishConfig.registry}`,
    {
      stdio: 'pipe',
    },
  );
  published = found.toString().trim() === version;
} catch {
  // npm view fails with E404 while the package has never been published
}

if (published) {
  console.log(`${name}@${version} is already published, nothing to do.`);
} else {
  run('npm run build:ui');
  run('npm publish ./dist/ui');
  // Prints "New tag: ..." lines, which changesets/action pushes and turns into GitHub releases
  run('npx changeset tag');
}
