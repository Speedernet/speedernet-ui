# Changesets

Chaque modification visible pour une application qui utilise `@speedernet/ui` s'accompagne d'un fichier Changesets :

```bash
npx changeset
```

Choisissez le type de version (`patch`, `minor`, `major`) et écrivez une phrase pour les utilisateurs. La CI refuse une pull request qui modifie la bibliothèque (`projects/ui`) sans ce fichier ; la démo, la CI et la configuration du dépôt n'en ont pas besoin.

Documentation : https://github.com/changesets/changesets
