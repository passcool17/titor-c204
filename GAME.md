# Machine C204 (John Titor) — page 3D interactive
- Lien jouable : https://passcool17.github.io/titor-c204/
- Dépôt : https://github.com/passcool17/titor-c204 (bot Arcade 3D)
- État : v0.1, modèle provisoire fait en code (Three.js r170) ; branchement automatique de `assets/c204.glb` dès qu'il existe.
- Contrôles : glisser pour tourner, pincer pour zoomer, toucher une pièce = fiche. Boutons : Démarrer (choix de date, séquence 8 étapes, compte à rebours, saut simulé, arrêt d'urgence), Éclatée, Visite (22 pièces), Champ (sinusoïde de Tipler, p.5), Dossier (histoire, manuel, IBM 5100, prédictions, identité, physique, tableau Vérifié/Non vérifié).
- Tests : `?demo=explode|field|tour|dossier`.
- GLB attendu : objets nommés selon /workspace/projets/titor-c204/manuel/NOMS-OBJETS.md ; actions idle, startup, spin_singularities, field_pulse, jump, explode.
## Ressources
- Pages du manuel (docs/manuel-p5..7.jpg) : Internet Archive « JohnTitorTimeMachineManual », documents publiés anonymement en 2000-2001, licence inconnue ; reproduction documentaire réduite.
- Three.js (MIT) via jsDelivr. Sons générés en Web Audio. Textures faites en code.
## Prochaines étapes
- Intégrer le GLB de la chaîne 3D (Modélisation → Rig → Rendu & export).
- Option véhicule (Corvette 1967 / pick-up 4x4) ; musique d'ambiance ; test QA sur S20.

## v0.2 — 11 nov. 2026
- Vrai modèle branché : `assets/c204_static_preview.glb` (3D · Modélisation & textures puis 3D · Rendu & export GLB, d'après le manuel ; original, 132 Ko, 5 520 triangles, Draco + WebP). Le fichier chargé est choisi dans `assets/model.json`.
- 88 pièces reliées aux 24 fiches (préfixe le plus long), couvercle ouvert, rotors et ventilateur qui tournent, 20 voyants, levier, écran et champ centrés sur les singularités.
- Vue éclatée calculée depuis le centre du modèle (en attendant l'action `explode`).
- Test local à 412x915 (Playwright) : aucune erreur, 104 appels de dessin, 5 726 triangles, 4 textures, ~10 Mo de tas JS. Fps non représentatifs sur la box (rendu logiciel) ; à mesurer sur le S20.
- Prochaine étape : remplacer par `c204.glb` (6 actions) quand Rendu le livre : changer `assets/model.json`.
