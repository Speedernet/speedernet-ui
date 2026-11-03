# Changesets

Every change visible to an application using `@speedernet/ui` comes with a Changesets file:

```bash
npx changeset
```

Pick the version type (`patch`, `minor`, `major`) and write one sentence, in English, for users. CI rejects a pull request that changes the library (`projects/ui`) without this file; the demo, CI and repository configuration don't need one.

Documentation: https://github.com/changesets/changesets
