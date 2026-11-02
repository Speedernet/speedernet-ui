---
'@speedernet/ui': minor
---

Nouveau service `SnToastService` : il affiche une notification temporaire en bas de l'écran (`toast.show('Réservation supprimée', { action: 'Annuler' })`), avec une action facultative. Elle disparaît seule après 5 s (10 s avec une action), sauf pendant le survol ou quand le focus est dessus ; les lecteurs d'écran l'annoncent sans que le focus bouge. `result` indique si l'action a été utilisée.
