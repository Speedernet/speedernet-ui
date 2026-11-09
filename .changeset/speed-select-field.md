---
'@speedernet/ui': major
---

`speed-select` is now a field on its own: it takes `label`, `hint` and `error` and no longer goes inside `speed-field`; replace `<speed-field label="Room"><speed-select><select speedControl>…</select></speed-select></speed-field>` with `<speed-select label="Room"><select speedControl>…</select></speed-select>`.
