---
'@speedernet/ui': minor
---

Add `speed-file-input`, a file field with a drop zone: `<speed-file-input label="Receipt"><input type="file" speedControl /></speed-file-input>` takes `label`, `hint` and `error`, lists the chosen files with their size and a button to remove each one, and removes the files that do not match `accept`, dropped ones included, naming them in a message and emitting them through `rejected`; its zone grows to the height given to it, `fill` makes it take the whole width and height of its container, and `--speed-file-input-min-height` and `--speed-file-input-padding` tune it.
