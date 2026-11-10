# @speedernet/ui

## 2.1.0

### Minor Changes

- c06cdad: `speed-app-header` takes a `customImageUrl` shown instead of the Speedernet logo, a `customImageSize` (`{ width?, height? }` in pixels, 40px high by default) within which the image keeps its ratio, and `showAppName` to hide the name, the logo then labelling the home link; a name too long for the space left now ends with an ellipsis instead of running over the navigation.

## 2.0.0

### Major Changes

- f47b13b: `speed-select` is now a field on its own: it takes `label`, `hint` and `error` and no longer goes inside `speed-field`; replace `<speed-field label="Room"><speed-select><select speedControl>…</select></speed-select></speed-field>` with `<speed-select label="Room"><select speedControl>…</select></speed-select>`.

### Minor Changes

- ba98d4a: Add `speed-file-input`, a file field with a drop zone: `<speed-file-input label="Receipt"><input type="file" speedControl /></speed-file-input>` takes `label`, `hint` and `error`, lists the chosen files with their size and a button to remove each one, and removes the files that do not match `accept`, dropped ones included, naming them in a message and emitting them through `rejected`; its zone grows to the height given to it, `fill` makes it take the whole width and height of its container, and `--speed-file-input-min-height` and `--speed-file-input-padding` tune it.

## 1.0.0

### Major Changes

- 29de0e1: Breaking: the `sn` prefix becomes `speed` everywhere. Classes and services are renamed (`SnButton` → `SpeedButton`, `SnToastService` → `SpeedToastService`, `SN_ASSETS_BASE` → `SPEED_ASSETS_BASE`), as are element selectors (`<sn-field>` → `<speed-field>`), attribute directives (`snButton` → `speedButton`, `snControl` → `speedControl`, `[snMenuTrigger]` → `[speedMenuTrigger]`) and CSS classes (`.sn-container` → `.speed-container`). To migrate, replace `Sn` with `Speed`, `SN_` with `SPEED_`, `sn-` with `speed-` and `sn` followed by a capital letter with `speed` in your templates, code and styles.

### Patch Changes

- 634719f: The package now ships a README (installation, styles and assets setup, usage), and the changelog is in English. Components' default texts stay in French.

## 0.1.0

### Minor Changes

- b36b358: New `sn-action-menu` component: a "⋯" button that opens a list of actions (`<button snMenuItem>Edit</button>`), with an optional icon and a `danger` tone for a destructive action. It is fully keyboard-operable (arrows, Home, End, first letter, Escape) and returns focus to the button after a choice.
- 4169e39: New `sn-checkbox`, `sn-radio`, `sn-radio-group` and `sn-switch` components: checkbox, radio button, radio group and switch, with a clickable label, a hint, an error and a disabled state, like `sn-field`. They keep the native input (`<sn-checkbox label="…"><input type="checkbox" snControl /></sn-checkbox>`), so the keyboard and Angular forms work as usual. `snControl` can now be used in these components too.
- 4655e4d: New `sn-dialog` component: a generic modal window with a title, free content and an actions area (`<button snDialogActions …>`). It opens with `open()`, closes with `close()` or Escape, keeps focus inside and returns it to the original element when it closes. `sn-confirm-dialog` is now built on it, with no change for your screens.
- 643c0cb: New `sn-menu` and `snMenuTrigger`: the action menu becomes a reusable building block that can be opened from any button (`<button snButton [snMenuTrigger]="menu">Export</button> <sn-menu #menu>…</sn-menu>`). `sn-action-menu` is built on it without any API change, and the user menu of `sn-app-header` now uses it: it can be browsed with the arrow keys like the other menus.
- 797f131: The cyan, yellow and red scales are rebuilt in OKLCH around the brand colors, placed at step 500, with a new step 950; the night and gray scales share a common lightness grid, and gray also gains a `--gray-950` step. Note that the brand colors move to a different step: `--color-primary` is `--cyan-500` (instead of `--cyan-400`), `--color-accent` is `--yellow-500` (instead of `--yellow-200`), `--color-brand` is `--red-500` (instead of `--red-600`) and `--color-danger` is `--red-600` (instead of `--red-700`, white contrast 5.2:1). If your application uses a step of these scales directly (for example `--cyan-400`), check its color or use the `--color-*` tokens.
- e60f06a: New `sn-select` component: it styles the native `<select snControl>` placed in an `sn-field` (chevron, disabled state); in browsers that support it (recent Chrome and Edge), the option list takes the style of the action menu, elsewhere the system list is still shown, without changing how it works: label, hint and error come from the field, and the keyboard, the phone picker and Angular forms work as usual (`<sn-field label="Room"><sn-select><select snControl>…</select></sn-select></sn-field>`).
- 8509f42: New `SnToastService` service: it shows a temporary notification at the bottom of the screen (`toast.show('Booking deleted', { action: 'Undo' })`), in the style of `sn-message` (badge "C'est fait", "Info", "Attention" or "Erreur" depending on the `type` option), with an optional action. It disappears on its own after 5 s (10 s with an action), except while hovered or focused; screen readers announce it without moving focus. `result` tells whether the action was used.
- 896e571: New `sn-tooltip` component: a tooltip that shows a short text above its content on hover and keyboard focus. It stays visible while hovered, closes with Escape and describes the element it wraps for screen readers (`<sn-tooltip text="Edit"><button …></button></sn-tooltip>`).

### Patch Changes

- 55ae38e: `sn-action-menu`: the action list is now shown above the page (top layer), so it is no longer clipped inside a table or a scrolling container. It stays attached to its button while scrolling and opens above it when there isn't enough room below.
- 1cc01b8: Visual tweaks to match the mockup: `sn-menu` gets less rounded corners, the `sn-message` info banner fits the width of its content, and `sn-toast` vertically centers its badge and buttons and can grow up to 760 px wide.
