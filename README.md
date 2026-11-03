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

Publishing is automated by the [Release workflow](.github/workflows/release.yml) with [Changesets](https://github.com/changesets/changesets). Versions follow [semver](https://semver.org/): the next version is the strongest type among the pending files in `.changeset/` (`major` > `minor` > `patch`).

### How it works

1. Pull requests that change the library are merged into `main` with their Changesets file.
2. On every push to `main` with pending changesets, the workflow opens (or updates) a **"chore: release @speedernet/ui"** pull request from the `changeset-release/main` branch. It bumps the version in `projects/ui/package.json`, writes the `projects/ui/CHANGELOG.md` entry and deletes the consumed changesets.
3. Review that pull request (version number, changelog wording), then merge it once the demo has been validated.
4. The workflow then runs the tests, builds the library, publishes `dist/ui` to `https://verdaccio.speedernet.io` and pushes the `@speedernet/ui@X.Y.Z` git tag with a GitHub release.

Nothing is published until the release pull request is merged. Merging more pull requests before that simply updates it.

The CI workflow only runs on pull requests. After every merge, the Release workflow runs the tests and builds the library on `main` before doing anything else. Pull requests opened by the workflow don't trigger CI either (a GitHub limitation of `GITHUB_TOKEN`), so this check also covers the release pull request.

### Requirements

- The `VERDACCIO_TOKEN` repository secret must be a Verdaccio token allowed to **publish** `@speedernet/*` (it is also used to install dependencies).
- "Allow GitHub Actions to create and approve pull requests" must stay enabled in the repository settings (Settings → Actions → General).

### Check a release

```bash
npm view @speedernet/ui versions dist-tags --registry https://verdaccio.speedernet.io
```

The run log is in the repository's Actions tab, under "Release".

### Publishing by hand (fallback)

Only if the workflow can't be used, from an up-to-date `main` and logged in to the registry (`npm login --registry https://verdaccio.speedernet.io`; the token stays in your user `~/.npmrc`, never in the repository):

```bash
git switch -c release/vX.Y.Z
npm run version-packages
git add -A .changeset projects/ui
git commit -m "chore: release @speedernet/ui X.Y.Z"
git push -u origin release/vX.Y.Z
```

Name the branch `changeset-release/main` instead if you want CI to skip the Changesets check, or open the pull request and merge it as usual. Once merged, from `main`:

```bash
npm run release
git push --tags
```

`npm run release` builds the library, publishes `./dist/ui` (skipped if this version is already on the registry) and creates the git tag.

A published version cannot be republished: to fix a mistake, release a new patch version.
