---
'@speedernet/ui': patch
---

The library no longer needs its assets copied in `angular.json` (so it also works when `node_modules` is outside the Angular workspace): the font is bundled from the styles, `speed-logo` renders an inline SVG instead of an `<img>` (its `alt` now labels the `speed-logo` element). `SPEED_ASSETS_BASE` is removed: delete its provider from your application.
