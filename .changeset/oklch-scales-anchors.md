---
'@speedernet/ui': minor
---

Les échelles cyan, jaune et rouge sont refaites en OKLCH autour des couleurs de la marque, placées au palier 500, avec un nouveau palier 950 ; les échelles nuit et gris partagent une grille de luminance commune, et le gris gagne lui aussi un palier `--gray-950`. Attention, les couleurs de marque changent de palier : `--color-primary` vaut `--cyan-500` (au lieu de `--cyan-400`), `--color-accent` vaut `--yellow-500` (au lieu de `--yellow-200`), `--color-brand` vaut `--red-500` (au lieu de `--red-600`) et `--color-danger` vaut `--red-600` (au lieu de `--red-700`, contraste du blanc 5,2:1). Si votre application utilise directement un palier de ces échelles (par exemple `--cyan-400`), vérifiez sa couleur ou passez par les jetons `--color-*`.
