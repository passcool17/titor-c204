# Machine C204 (John Titor) — page 3D interactive
- Lien jouable : https://passcool17.github.io/titor-c204/
- Dépôt : https://github.com/passcool17/titor-c204 (bot Arcade 3D)
- État : v0.1, modèle provisoire fait en code (Three.js r170) ; branchement automatique de `assets/c204.glb` dès qu'il existe.
- Contrôles : glisser pour tourner, pincer pour zoomer, toucher une pièce = fiche. Boutons : Démarrer (choix de date, séquence 8 étapes, compte à rebours, saut simulé, arrêt d'urgence), Éclatée, Visite (22 pièces), Champ (sinusoïde de Tipler, p.5), Dossier (histoire, manuel, IBM 5100, prédictions, identité, physique, tableau Vérifié/Non vérifié).
- Tests : `?demo=explode|field|tour|dossier`.
- GLB attendu : objets nommés selon /workspace/projets/titor-c204/manuel/NOMS-OBJETS.md ; actions idle, startup, spin_singularities, field_pulse, jump, explode.
## Ressources
- Pages du manuel (docs/manuel-p5..7.jpg) : Internet Archive « JohnTitorTimeMachineManual », documents publiés anonymement en 2000-2001, licence inconnue ; reproduction documentaire réduite.
- Three.js (MIT) via jsDelivr. Sons : voir v0.4 (packs Kenney CC0). Textures faites en code.
## Prochaines étapes
- Intégrer le GLB de la chaîne 3D (Modélisation → Rig → Rendu & export).
- Option véhicule (Corvette 1967 / pick-up 4x4) ; musique d'ambiance ; test QA sur S20.

## v0.2 — 11 nov. 2026
- Vrai modèle branché : `assets/c204_static_preview.glb` (3D · Modélisation & textures puis 3D · Rendu & export GLB, d'après le manuel ; original, 132 Ko, 5 520 triangles, Draco + WebP). Le fichier chargé est choisi dans `assets/model.json`.
- 88 pièces reliées aux 24 fiches (préfixe le plus long), couvercle ouvert, rotors et ventilateur qui tournent, 20 voyants, levier, écran et champ centrés sur les singularités.
- Vue éclatée calculée depuis le centre du modèle (en attendant l'action `explode`).
- Test local à 412x915 (Playwright) : aucune erreur, 104 appels de dessin, 5 726 triangles, 4 textures, ~10 Mo de tas JS. Fps non représentatifs sur la box (rendu logiciel) ; à mesurer sur le S20.
- Prochaine étape : remplacer par `c204.glb` (6 actions) quand Rendu le livre : changer `assets/model.json`.

## v0.3 — GLB final animé (11 nov. 2026)
- Modèle : `assets/c204.glb` (325 Ko, chaîne 3D Modélisation → Rig → Rendu, original, licence : propriété de Pascal), pointé par `assets/model.json`.
- 6 clips branchés : idle, startup (couvercle qui s'ouvre, figé à la fin), spin_singularities, field_pulse, jump, explode (bouton Éclatée, aller-retour).
- Test local 412x915 (Playwright) : 88 pièces mappées, 0 erreur console, ~114 draw calls, ~7 800 triangles. Fps réel du S20 non mesuré (la box rend en logiciel).
- Prochaines étapes : test QA sur le S20, musique, teaser de Rendu.

## v0.4 — vrais effets sonores (11 nov. 2026)
- Le son de synthèse (oscillateurs) est remplacé par 10 fichiers dans `assets/sfx/` : Ogg Opus mono 64 kb/s (Chrome, Android, Firefox), avec un repli .mp3 que la page choisit seulement si le navigateur ne lit pas l'Opus (anciens Safari).
- Lecture en Web Audio (AudioContext, decodeAudioData, un GainNode par son, boucles AudioBufferSourceNode.loop avec loopEnd exact). Téléchargement paresseux 1,5 s après l'affichage, décodage au premier toucher ; un son manquant est ignoré sans erreur. `window.__c204.sfx` liste les sons chargés, `window.__c204.audio` donne l'état.
- Ambiance `amb_hum` (boucle 4,5 s) : discrète au repos (0,16), elle monte à chaque étape de Démarrer (jusqu'à 0,62) puis redescend. `spin_loop` suit la vitesse des rotors, `field_loop` suit le niveau du champ (aussi avec le bouton Champ).
- Effets : clic (boutons, levier), `lid_open` (début de Démarrer), `tick` (compte à rebours, plus aigu à 1), `jump` (décharge puis souffle), `explode` (Éclatée, aller et retour plus grave), `beep_soft` (fiches, visite, étapes), `abort` (arrêt d'urgence).
- Bouton 🔊/🔇 en haut à côté du plein écran ; l'état est gardé dans localStorage (`c204-muted`).
- Poids : .ogg 260 Ko au total, .mp3 204 Ko, dossier entier 468 Ko (< 1,5 Mo).
- Sources et licence : ElevenLabs Sound Effects n'a pas pu servir (générations gratuites occupées, rien n'a été facturé). Les sons sont donc montés à partir des packs Kenney « Sci-Fi Sounds », « Interface Sounds » et « Impact Sounds » (kenney.nl, licence CC0 1.0, domaine public). Le bourdonnement 60 Hz de l'ambiance est synthétisé par nous (CC0). Le script de montage est `tools/sfx_compose.py` (mixage numpy, boucles en fondu enchaîné).

| Fichier | Poids (ogg / mp3) | Fait à partir de (Kenney, CC0) |
|---|---|---|
| amb_hum | 44 / 37 Ko | spaceEngineLow_004 + bourdonnement 60 Hz synthétisé |
| spin_loop | 51 / 33 Ko | engineCircular_002 |
| field_loop | 39 / 33 Ko | forceField_000-003 + spaceEngineLow_001 |
| click | 7 / 5 Ko | switch_003 |
| tick | 4 / 3 Ko | tick_004 + impactMetal_light_002 |
| beep_soft | 3 / 3 Ko | confirmation_001 |
| lid_open | 20 / 21 Ko | impactMetal_medium_001, switch_005, doorOpen_002, impactMetal_001, spaceEngineSmall_002 |
| jump | 36 / 29 Ko | computerNoise_003, laserLarge_000-003, lowFrequency_explosion_000, thrusterFire_001 |
| explode | 14 / 12 Ko | spaceEngineSmall_000, doorOpen_000, impactMetal_light_000-003, impactMetal_medium_003 |
| abort | 32 / 20 Ko | error_007, spaceEngine_001 (ralenti) |

## v0.4.1 — corrections du rapport QA (11 nov. 2026)
Rapport : /workspace/qa/titor-c204/rapport-2026-11-11.md (v0.4, 7a160e7).
1. (Haute) ARRÊT D'URGENCE pendant le saut : l'arrêt agit tout de suite (les attentes en cours sont annulées). `endJump()` remet toujours la machine visible, le flash à 0, les particules et `jumpT`, arrête l'action `jump` en fondu, relance `idle` et coupe le son du saut.
2. (Moyenne) Paysage (hauteur ≤ 520 px) : le panneau de séquence est à gauche et la fiche à droite, sans chevauchement. Le panneau passe au-dessus des fiches (z-index) et ARRÊT D'URGENCE reste collé en bas du panneau, toujours touchable.
3. (Moyenne) Dossier : il passe au-dessus de tout (z-index 50), avec un ✕ fixe toujours visible et un espace en bas pour la dernière ligne. La barre du bas et l'en-tête sont inactifs pendant qu'il est ouvert ; Démarrer ferme le Dossier.
4. (Moyenne) Démarrer en vue Éclatée : `startSeq` referme d'abord la vue éclatée (`explode` à l'envers, en environ 0,8 s), puis ouvre le couvercle. À son retour au début, `explode` est arrêtée pour ne plus se mélanger aux autres actions.
5. (Basse) Son : il se débloque au premier vrai geste n'importe où (pointerdown, pointerup, touchend, keydown, click, en capture, canvas compris, glisser compris). L'AudioContext n'est créé qu'après une activation réelle (`navigator.userActivation`), donc sans avertissement.
6. (Basse) Cibles tactiles d'au moins 44x44 px : 🔊, ⛶, tous les ✕, ARRÊT D'URGENCE, Précédent et Suivant, dates rapides, champ de date.
7. (Basse) Le retour d'Éclatée part tout de suite : quand l'action est figée à la fin, time = duration, paused = false, enabled = true, puis timeScale -1.
- Défaut connu : la ligne d'aide est cachée pendant la séquence.
- Version visible dans `window.__c204.version`, et `?v=0.4.1` ajouté sur main.js et style.css (cache).
- Tests Playwright (playwright-core + Chrome de la box, tactile) en 412x915 et 915x412, script dans /workspace/games3d/titor-c204-tests/t041.js : chaque scénario de bug rejoué, 0 erreur, 0 avertissement.
