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

Publishing is automated by the [Release workflow](.github/workflows/release.yml), set up as recommended by the [Changesets automation guide](https://changesets.dev/guide/automating) (token-based publishing, since Verdaccio doesn't support npm Trusted Publishing). Versions follow [semver](https://semver.org/): the next version is the strongest type among the pending files in `.changeset/` (`major` > `minor` > `patch`).

### How it works

1. A pull request that changes the library is merged into `main` with its Changesets file.
2. The workflow runs the tests and builds the library on `main`, then selects a mode:
   - **Pending changesets**: it opens (or updates) a **"chore: release @speedernet/ui"** pull request from a `changeset-release/main` branch. It bumps the version in `projects/ui/package.json`, writes the `projects/ui/CHANGELOG.md` entry and deletes the consumed changesets.
   - **No pending changesets and an unpublished version** (the release pull request was just merged): `changeset publish` publishes `dist/ui` to `https://verdaccio.speedernet.io`, then the `@speedernet/ui@X.Y.Z` git tag and GitHub release are created.
   - **Otherwise**: nothing.
3. Review the release pull request (version number, changelog wording), then merge it once the demo has been validated.

One feature pull request gives one version if you merge the release pull request after each of them; merging several feature pull requests first releases them together.

`changeset publish` publishes `dist/ui`, not `projects/ui`, thanks to `publishConfig.directory` in `projects/ui/package.json`; `npm run build:ui` removes that key from the built `dist/ui/package.json`.

The CI workflow only runs on pull requests (and skips the Changesets check on the release pull request, which consumes changesets). Pull requests opened by the workflow don't trigger CI (a GitHub limitation of `GITHUB_TOKEN`): the tests and build run in the Release workflow before versioning and publishing.

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
git switch -c changeset-release/main
npm run version-packages
git add -A .changeset projects/ui
git commit -m "chore: release @speedernet/ui X.Y.Z"
git push -u origin changeset-release/main
```

Open the pull request and merge it, then from `main`:

```bash
npm run build:ui
npx changeset publish
git push --follow-tags
```

`changeset publish` skips a version already on the registry and creates the git tag.

A published version cannot be republished: to fix a mistake, release a new patch version.
