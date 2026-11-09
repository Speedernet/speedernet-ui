---
'@speedernet/ui': minor
---

Add `speed-file-input`, a file field with a drop zone: `<speed-file-input label="Receipt"><input type="file" speedControl /></speed-file-input>` takes `label`, `hint` and `error`, lists the chosen files with their size and a button to remove each one, and removes the files that do not match `accept`, dropped ones included, naming them in a message and emitting them through `rejected`.
