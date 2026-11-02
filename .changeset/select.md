---
'@speedernet/ui': minor
---

Nouveau composant `sn-select` : il habille le `<select snControl>` natif placé dans un `sn-field` (chevron, état désactivé) ; dans les navigateurs qui le permettent (Chrome et Edge récents), la liste des options prend le style du menu d'actions, ailleurs la liste du système reste affichée, sans changer son fonctionnement : libellé, aide et erreur viennent du champ, le clavier, la liste du téléphone et les formulaires Angular marchent comme d'habitude (`<sn-field label="Salle"><sn-select><select snControl>…</select></sn-select></sn-field>`).
