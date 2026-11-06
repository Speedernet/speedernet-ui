---
'@speedernet/ui': minor
---

Add `speed-file-input`, a drop zone that wraps `<input type="file" speedControl>` inside `speed-field` and lists the chosen files with their size and a button to remove each one; files that do not match `accept`, including dropped ones, are removed, named in a message and emitted through `rejected`.
