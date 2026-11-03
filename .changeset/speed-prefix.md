---
'@speedernet/ui': major
---

Breaking: the `sn` prefix becomes `speed` everywhere. Classes and services are renamed (`SnButton` → `SpeedButton`, `SnToastService` → `SpeedToastService`, `SN_ASSETS_BASE` → `SPEED_ASSETS_BASE`), as are element selectors (`<sn-field>` → `<speed-field>`), attribute directives (`snButton` → `speedButton`, `snControl` → `speedControl`, `[snMenuTrigger]` → `[speedMenuTrigger]`) and CSS classes (`.sn-container` → `.speed-container`). To migrate, replace `Sn` with `Speed`, `SN_` with `SPEED_`, `sn-` with `speed-` and `sn` followed by a capital letter with `speed` in your templates, code and styles.
