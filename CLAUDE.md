# CLAUDE.md - @speedernet/ui library

- Everything written in the repository (code, comments, docs, tests, changesets, commits, pull requests) is in English.
- The components' default UI texts (for example `Se déconnecter`, `Annuler`, `Erreur`) stay in French: the applications using the library are French.
- The demo application (`projects/demo`) is entirely in French: page text, sample data, routes and the tests checking them.
- Every change visible to an application comes with a Changesets file (`npx changeset`) with one sentence for users and the right version type (patch, minor, major).
- Work on a branch and through a pull request; CI checks that the Changesets file is present.
- Never put a token in the repository or in the conversation.
- The reference mockup is the source of truth.
- Check before claiming: `npm test` and `npm run build:ui`.
- Components, directives, services and CSS classes use the `speed` prefix (`SpeedButton`, `<speed-field>`, `speedControl`, `.speed-container`).
- Publishing a version: see "Publishing" in `README.md`.
