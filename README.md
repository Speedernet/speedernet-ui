# @speedernet/ui

Speedernet's Angular component library (package `@speedernet/ui`), used by the intranet applications. It contains the design system's components, styles and assets (fonts, logos).

The package is published on the private registry `https://verdaccio.speedernet.io`.

## Run the demo

```bash
npm install
npm start
```

The demo application opens at http://localhost:4200.

## Test

```bash
npm test
npm run build:ui
```

## Format

```bash
npm run format
```

## Contributing

Work on a branch and open a pull request against `main`. Every change visible to an application comes with a Changesets file (see [.changeset/README.md](.changeset/README.md)):

```bash
npx changeset
```

CI checks formatting, the Changesets file, the tests and the library build.

## Publishing

A version is published from `main` once the demo has been validated. Versions follow [semver](https://semver.org/); [Changesets](https://github.com/changesets/changesets) computes the next version from the pending files in `.changeset/` and writes `projects/ui/CHANGELOG.md`.

### Prerequisites

Be logged in to the registry with an account that can publish `@speedernet/*`:

```bash
npm login --registry https://verdaccio.speedernet.io
npm whoami --registry https://verdaccio.speedernet.io
```

The token lives in your user `~/.npmrc`, never in the repository.

### 1. Prepare the version (pull request)

Check what will be released:

```bash
npx changeset status
```

From an up-to-date `main`, create a release branch and bump the version:

```bash
git switch main
git pull
git switch -c release/vX.Y.Z
npx changeset version
npx changeset add --empty
```

`changeset version` updates `projects/ui/package.json`, writes the `CHANGELOG.md` entry and deletes the consumed changesets. The empty changeset (`--empty`) lets the CI Changesets check pass on this pull request; the next `changeset version` removes it.

Review the `CHANGELOG.md`, run the checks, then commit, push and open the pull request:

```bash
npm test
npm run build:ui
git add -A .changeset projects/ui
git commit -m "chore: release @speedernet/ui X.Y.Z"
git push -u origin release/vX.Y.Z
```

### 2. Publish (after the merge)

Once the pull request is merged, publish from `main`:

```bash
git switch main
git pull
npm run build:ui
npm publish ./dist/ui --dry-run
npm publish ./dist/ui
```

Always publish the built package in `dist/ui` (the `./` matters: without it npm reads `dist/ui` as a GitHub repository). Check the dry run before publishing: package name, version and file list.

### 3. Check and tag

```bash
npm view @speedernet/ui versions dist-tags --registry https://verdaccio.speedernet.io
npx changeset tag
git push --tags
```

`changeset tag` creates the `@speedernet/ui@X.Y.Z` git tag on the published commit.

A published version cannot be republished: to fix a mistake, release a new patch version.
