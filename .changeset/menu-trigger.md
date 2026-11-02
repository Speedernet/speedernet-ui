---
'@speedernet/ui': minor
---

Nouveaux `sn-menu` et `snMenuTrigger` : le menu d'actions devient une brique réutilisable qu'on ouvre depuis n'importe quel bouton (`<button snButton [snMenuTrigger]="menu">Exporter</button> <sn-menu #menu>…</sn-menu>`). `sn-action-menu` repose dessus sans changer d'API, et le menu utilisateur de `sn-app-header` l'utilise désormais : il se parcourt aux flèches comme les autres menus.
