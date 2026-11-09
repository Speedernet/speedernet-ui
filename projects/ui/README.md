# @speedernet/ui

Speedernet's Angular component library: the design system's components, styles and assets (Mulish font, logos) for the intranet applications.

## Install

The package is published on the private registry. Point the `@speedernet` scope to it in your project's `.npmrc`:

```ini
@speedernet:registry=https://verdaccio.speedernet.io
```

Then install it (Angular 22, with `@angular/common`, `@angular/core` and `@angular/router` as peer dependencies):

```bash
npm install @speedernet/ui
```

## Set up

**Styles**: load the tokens, base styles and utility classes in your global stylesheet:

```scss
@use '@speedernet/ui/styles';
```

Breakpoint mixins are available for your own styles:

```scss
@use '@speedernet/ui/styles/breakpoints' as bp;

.panel {
  @include bp.from(tablet) {
    display: flex;
  }
}
```

**Assets**: serve the library assets under `/speedernet-ui` by adding them to the `assets` of your application in `angular.json`:

```json
{
  "glob": "**/*",
  "input": "node_modules/@speedernet/ui/assets",
  "output": "speedernet-ui"
}
```

If you serve them at another URL, provide `SPEED_ASSETS_BASE` for the logos (the font URLs in the styles stay `/speedernet-ui/fonts`).

## Use

Components are standalone: import the ones you need.

```ts
import { Component } from '@angular/core';
import { SpeedButton, SpeedField, SpeedControl } from '@speedernet/ui';

@Component({
  imports: [SpeedButton, SpeedField, SpeedControl],
  template: `
    <speed-field label="Room">
      <input speedControl />
    </speed-field>
    <button speedButton variant="primary" type="button">Book</button>
  `,
})
export class BookingForm {}
```

Available: buttons, badges, filter tabs, fields, checkbox, radio, switch, select, file input, messages and toasts, loading, empty and error states, card, tooltip, dialogs, menus, app header and logo.

Each native control (`speedControl`) sits in a single component that draws its label, hint and error: `speed-field` for inputs and textareas, `speed-select`, `speed-file-input`, `speed-checkbox`, `speed-radio` and `speed-switch`.

```html
<speed-select label="Room" hint="Rooms on the 3rd floor.">
  <select speedControl>
    <option>Croix-Rousse</option>
  </select>
</speed-select>
```

`speed-file-input` takes the size the application gives it: its drop zone grows to the component's height. With `fill`, it takes the whole width and height of its container, for example a page-high container to drop files anywhere on the page. The CSS variables `--speed-file-input-min-height` and `--speed-file-input-padding`, set on the component or an ancestor, tune the zone.

```html
<main style="height: 100dvh">
  <speed-file-input fill label="Documents">
    <input type="file" speedControl multiple />
  </speed-file-input>
</main>
```

Default UI texts (for example `Annuler`, `Se déconnecter`) are in French; most can be changed through the component inputs.

## Changes

See [CHANGELOG.md](./CHANGELOG.md).
