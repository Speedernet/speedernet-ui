# CLAUDE.md - Bibliothèque @speedernet/ui

- Réponds en français, simplement.
- Tout changement visible pour une application s'accompagne d'un fichier Changesets (`npx changeset`) avec une phrase pour les utilisateurs et le bon type de version (patch, minor, major).
- Travaille par branche et demande de modification (pull request) ; la CI vérifie la présence du fichier Changesets.
- Jamais de jeton dans le dépôt ni dans la conversation.
- La maquette de référence fait foi.
- Vérifie avant d'affirmer : `npm test` et `npm run build:ui`.
