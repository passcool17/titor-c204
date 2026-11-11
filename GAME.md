# Machine C204 (John Titor) — page 3D interactive
- Lien jouable : https://passcool17.github.io/titor-c204/
- Dépôt : https://github.com/passcool17/titor-c204 (bot Arcade 3D)
- État : v0.6 — scène Machine (GLB c204.glb) et scène Corvette 1967 (GLB corvette.glb v2), navigation #machine / #corvette.
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

## v0.5 — scène « Corvette 1967 » (11 nov. 2026)
Référence lue : /workspace/assets3d/corvette-1967/references/grok-share-titor-vehicules.md.
- **Modèle provisoire procédural** (corvette.js, fait en code, sans fichier externe) : Corvette Sting Ray C2 cabriolet 1967 en low-poly, aux dimensions réelles (4,45 × 1,77 × 1,25 m, empattement 2,49 m). Pas de logo officiel. Objets nommés à part : `door_L`, `door_R`, `hood`, `trunk`, `soft_top` (arceaux `soft_top_bow_1..3` + toile), `steering_wheel`, `wheel_FL/FR/RL/RR` et `c204_unit`. Pivots sur les charnières (portes à l'avant, capot et coffre à l'arrière) et au centre des roues, avec X comme axe.
- **C204 dans la voiture** : copie de assets/c204.glb fusionnée par matériau (peu de draw calls), à l'échelle (≈ 1,10 × 0,42 × 0,37 m). Elle est posée à l'arrière côté passager, couvercle ouvert, sur une plaque (`c204_mount`), avec un câble jusqu'au tableau de bord (`c204_cable`).
- **assets/corvette.json** (`{"url": …}`) : `null` pour l'instant, donc le modèle procédural est utilisé. Avec un GLB, les noms sont associés aux fiches, y compris par préfixe (`soft_top_*`, `soft_top.*`). Les actions `idle`, `doors_open`, `top_down`, `hood_open`, `wheels_spin` et `jump` sont jouées si elles existent, sinon l'animation se fait en code. Si le GLB a son propre `c204_unit`, il est gardé.
- **Navigation** : bouton 🚗 Corvette dans la scène Machine et ⚙ Machine dans la scène Corvette. Toucher la C204 dans la voiture ouvre la vue Machine. Le hash d'URL `#machine` / `#corvette` est ouvrable directement et suit le bouton Retour. On ne change pas de scène pendant une séquence. Chaque scène garde sa caméra et ses limites de zoom.
- **Les deux scènes restent chargées** : la voiture n'est construite qu'à la première visite, en 164 ms. Seule la scène active est mise à jour et rendue. Mesure (Chrome, SwiftShader) : tas JS 13,8 Mo avec la Machine seule, 21,4 Mo avec les deux scènes, soit environ +8 Mo. Libérer la voiture en quittant la scène ne valait donc pas la reconstruction.
- **Fiches touchables** : carrosserie, moteur, portes, capote, coffre, habitacle, roues, unité C204, installation (position, environ 100 kg, câblage) et voyage de 1975 (bouton ⓘ 1975). Chaque fiche sépare « Récit de Titor » (en doré) et « Faits vérifiés » (en vert). Toucher une roue la fait tourner.
- **Saut depuis la voiture** : la voiture reste immobile, les feux s'allument, elle vibre (régime) et un champ l'entoure. Compte à rebours, puis flash, disparition et réapparition, avec les sons de la v0.4. ARRÊT D'URGENCE garde les garanties de la v0.4.1 : arrêt immédiat, et `endJump()` remet toujours la voiture visible, à l'échelle 1 (racine, groupe porteur et nœuds animés par l'échelle d'une action `jump` de GLB), le flash à 0 et les feux éteints.
- **Mesures de la scène Corvette** (renderer.info) : 61 draw calls, 10 414 triangles (voiture : 24 maillages, 10 090 triangles). pixelRatio ≤ 2 inchangé. Le 60 i/s sur S20 n'a pas été mesuré sur l'appareil (la box tourne sur SwiftShader, environ 12 i/s, comme la scène Machine).
- **Boutons** : 63×57 px en portrait et 147×44 px en paysage, tous touchables. Les contrôles de caméra sont les mêmes que dans la scène Machine.
- **Tests** (/workspace/games3d/titor-c204-tests/t05.js, playwright-core et Chrome tactile, en 412x915 et 915x412) : aller-retour entre les scènes, toucher de la C204, fiches, portes, capote et capot, saut complet, arrêt pendant le saut. Résultat : 0 erreur, 0 avertissement.
- **Encore provisoire** : la forme de la voiture est approximative (low-poly fait en code) et il n'y a pas encore de GLB ni de vraies actions animées. La position exacte de l'unité dans la voiture est une interprétation du récit.

### Sources et licences (v0.5)
| Élément | Source | Licence |
|---|---|---|
| Corvette procédurale (corvette.js) | faite en code pour ce projet | celle du projet (création originale) |
| C204 dans la voiture | assets/c204.glb (chaîne 3D du projet) | celle du projet |
| Sons | ceux de la v0.4 (Kenney) | CC0 |
| Éclairage d'environnement | RoomEnvironment, three.js r170 | MIT |
| Faits sur la Corvette 1967 (22 940 construites, dont 14 436 cabriolets, moteurs 327 et 427, L88, empattement de 98 po, 5 ouïes d'aile…) | Corvette Action Center (corvetteactioncenter.com), CorvSport (corvsport.com) | faits cités, textes réécrits |
| Récit de Titor | messages publics de 2000-2001 (archives), via le fichier de référence ci-dessus | cité comme récit, non vérifié |

## v0.6 — GLB Corvette final (11 nov. 2026)
- **Modèle** : `assets/corvette.glb` **v2** (288 Ko, Draco + WebP), fait par la chaîne 3D du projet (Modélisation → Rig → Rendu & export) ; création originale, propriété de Pascal, sans logo ni marque. `assets/corvette.json` pointe dessus. Capote v2 : nouveaux pivots des arceaux `soft_top_bow1..3` et piste d'échelle voulue sur `soft_top_bow3` (gardée) ; le couvercle `trunk` reste fermé pendant `top_down`. 3 nouveaux nœuds `cable_c204_plug_1..3`, rattachés à la fiche Installation.
- **Repli** : si le GLB ne se charge pas, le modèle procédural de `corvette.js` reste affiché (avertissement console, aucune erreur).
- **Chargement** : même GLTFLoader que la Machine, avec DRACOLoader (décodeur r170 sur jsDelivr) ; WebP natif (EXT_texture_webp). 148 nœuds dans le fichier, mètres, +Y en haut, boîte 1,79 × 1,24 × 4,54 m (vérifiée au chargement).
- **Correspondance** : racine `corvette_root` ; `door_L`, `door_R`, `hood`, `trunk`, `soft_top` (+ `soft_top_bow1..3`), `steering_wheel`, `wheel_FL/FR/RL/RR`, `c204_unit`. Fiches par préfixe aussi pour `engine_block`, `seat_*`, `dashboard`, `center_console`, `steering_column`, `bumper_*`, `cable_c204_*`, `c204_dash_controller`.
- **Actions** (30 i/s) : `idle` (LoopRepeat, C204) ; `doors_open`, `top_down`, `hood_open` en LoopOnce + clampWhenFinished, refermés en jouant le clip à l'envers depuis la fin ; `wheels_spin` (LoopRepeat, en touchant une roue) ; `jump` (4 s). `idle` est arrêtée pendant `jump` (même objet `c204_unit`) puis relancée. La séquence du saut suit l'horloge du clip (flash à 2,15 s, disparition 2,4-3,13 s = img 72-94, fin à 4 s), même si l'appareil rame. ARRÊT D'URGENCE : `jump` arrêtée (valeurs d'origine remises), échelle 1, visible, au repos, `idle` relancée.
- **Perf** : les ~90 pièces fixes de la C204 dans la voiture sont fusionnées par matériau au chargement (les cœurs animés restent à part) : 151 → 60 draw calls. Scène Corvette : 60-62 draw calls, 14 918 triangles, 14 textures, tas JS 17,2 Mo avec les deux scènes (12,0 Mo Machine seule). SwiftShader sur la box : ~11 i/s (non représentatif) ; 60 i/s sur S20 **non mesuré**.
- **Bugs QA v0.5 corrigés** :
  - A (cadrage portrait) : la distance de caméra est calculée depuis la vraie boîte de la voiture (sphère englobante dans le plus petit angle de vue, marge 10 %) au chargement, à chaque redimensionnement / rotation de l'écran et à l'arrivée du GLB. La voiture reste entière sous tous les angles de l'orbite. Le zoom sur une pièce utilise le même calcul.
  - B (Installation) : deux repères touchables à taille fixe (46 px de haut) au-dessus de la voiture, « C204 ▸ » (ouvre la Machine) et « Installation » (ouvre la fiche) ; plus une zone invisible élargie autour des câbles et du boîtier sous le tableau de bord. Toucher la C204 reste prioritaire. Si deux repères se chevauchent, celui dont le centre est le plus près du doigt gagne. Les repères sont cachés pendant le saut.
  - C (titre du panneau) : le titre « SAUT DEPUIS LA CORVETTE » reste jusqu'à la fermeture du panneau ; « SÉQUENCE DE DÉMARRAGE » est remis seulement au lancement de la séquence Machine.
- **Tests** : `/workspace/games3d/titor-c204-tests/t06.js` (Playwright + Chrome, tactile, 412x915 et 915x412), en local et en ligne.
- **Limites connues** : capote repliée = forme simplifiée (3 coques rigides) ; Modélisation pourrait livrer une version corrigée, à brancher de la même façon (remplacer `assets/corvette.glb`). Le toucher au centre de l'habitacle donne la fiche Installation (zone élargie), la carrosserie se touche ailleurs. Son et fps à vérifier sur le S20 ; Safari non testé.
- **Prochaines étapes** : test QA de la v0.6, mesure sur S20, éventuelle capote corrigée.
