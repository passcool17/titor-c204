# Machine C204 (John Titor) — page 3D interactive
- Lien jouable : https://passcool17.github.io/titor-c204/
- Dépôt : https://github.com/passcool17/titor-c204 (bot Arcade 3D)
- État : v0.9 — scène Machine (GLB c204.glb **v2**, 103 nœuds), scène Corvette 1967 (GLB corvette.glb v2), les 20 pièces du bon de commande sont visibles sur la Machine, panneau Pièces, Étiquettes 20/20, Distances de sécurité.
- Contrôles : glisser pour tourner, pincer pour zoomer, toucher une pièce = fiche. Boutons : Démarrer (choix de date, séquence 8 étapes, compte à rebours, saut simulé, arrêt d'urgence), Éclatée, Visite (22 pièces), Champ (sinusoïde de Tipler, p.5), Dossier (histoire, manuel, IBM 5100, prédictions, identité, physique, tableau Vérifié/Non vérifié), Pièces (bon de commande des 20 pièces, données techniques, caractéristiques de l'unité), Étiquettes (numéros sur le modèle, scène Machine), Distances (repères de sécurité autour de la Machine ou de la Corvette).
- Tests : `?demo=explode|field|tour|dossier|pieces|labels|distances`.
- GLB attendu : objets nommés selon /workspace/projets/titor-c204/manuel/NOMS-OBJETS.md ; actions idle, startup, spin_singularities, field_pulse, jump, explode.
## Ressources
- Pages du manuel (docs/manuel-p5..7.jpg) : Internet Archive « JohnTitorTimeMachineManual », documents publiés anonymement en 2000-2001, licence inconnue ; reproduction documentaire réduite.
- Three.js (MIT) via jsDelivr. Sons : voir v0.4 (packs Kenney CC0). Textures faites en code.
## Prochaines étapes
- Test QA de la v0.9 et mesure des fps / du son sur le S20 ; Safari et verrouillage d'orientation non testés.
- Les pièces n°16 à 19 n'ont pas de « Donnée technique » dans le document source (n°20 non plus) : rien n'est inventé.
- L'unité C204 embarquée dans `corvette.glb` reste celle de la v1 (les 6 nouvelles pièces n'y figurent pas).

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

## v0.7 — panneau Pièces C204 (11 nov. 2026)
Demande : ajouter la liste des pièces de l'unité, d'après `/workspace/games3d/titor-c204-docs/bon-de-commande-C204.txt` (PDF à côté).
- **Panneau « Pièces »** : ouvable par le bouton **Pièces** dans l'en-tête (scènes Machine et Corvette) et, dans la voiture, par le bouton « Liste des pièces de la C204 » de la fiche Installation. Liste déroulante des 20 pièces (N°, désignation FR + EN, quantité, notes) plus les 4 notes importantes et les métadonnées du document (référence BC-C204-GE-001, date, objet, priorité, client, fournisseur). Texte assez grand, bouton ✕ de 44 px, pas de débordement horizontal, lisible en 412×915 et 915×412.
- **Cadre factuel** : mention claire en tête du panneau et sur chaque fiche issue du bon de commande : « Selon le récit de John Titor — document fictif, non vérifié ». Le document est présenté comme une liste de référence d'après les messages et schémas de 2000-2001, non authentifiée.
- **Surlignage requis** : toucher une pièce **présente sur le modèle** dans la liste ferme le panneau, passe à la scène Machine si besoin, cadre la pièce, la surligne (émission brève, matériaux clonés puis rendus) et affiche son numéro en étiquette d'écran (ex. « 12 »). La fiche montre le nom FR, le nom EN, la quantité et la note du bon de commande. Toucher la même pièce sur le modèle, ou son numéro, ouvre la même fiche. Les pièces sans nœud visible restent dans la liste, marquées « Pas encore visible sur le modèle » : on peut quand même ouvrir leur fiche, sans inventer de correspondance.
- **Mode Étiquettes** : bouton **Étiquettes** (marche/arrêt) dans l'en-tête, scène Machine seulement. Affiche tous les numéros des pièces mappées, en HTML de taille fixe, recalés par une seule passe de projection par image, uniquement quand le mode est allumé (ou pour la pièce sélectionnée). Pas de travail supplémentaire dans la boucle sinon. Les étiquettes sont enlevées en changeant de scène ou en lançant une séquence.
- **Correspondance GLB** (`assets/c204.glb`, noms exacts) :

| N° | Désignation | Nœuds utilisés | Visible |
|---|---|---|---|
| 1 | Logement d'entraînement de singularité | `singularity_main_housing`, `singularity_steering_housing` | oui |
| 2 | Bobine de champ magnétique de singularité | `field_coil_main_1..3`, `field_coil_steering_1..3` | oui |
| 3 | Générateur / régulateur de champ magnétique | `mag_field_generator_main`, `mag_field_generator_steering` | oui |
| 4 | Collecteur d'injection de masse d'électrons | `electron_injector_manifold_main_nozzle`, `…_main_rail`, `…_steering_nozzle`, `…_steering_rail` | oui |
| 5 | Régulateur d'électrons | `electron_regulator` | oui |
| 6 | Générateur d'électrons | `electron_generator` | oui |
| 7 | Capteur de singularité / rayon (Status / radius sensor) | — | **non** : aucun nœud « radius » / « status » ; `motion_sensor_*` est le capteur de *mouvement* du manuel (p.6 n°7), ce n'est pas une correspondance claire |
| 8 | Logement de refroidissement de singularité | `cooling_housing_main`, `cooling_housing_steering` | oui |
| 9 | Pompe de refroidissement de singularité | `cooling_pump` | oui (qté du document : 2 ; un seul nœud dans le GLB) |
| 10 | Alimentation de refroidissement | `cooling_tank_1`, `cooling_tank_2` | oui |
| 11 | Unité de capteur de gravité (VGL) | `gravity_sensor_unit`, `vgl_unit` | oui |
| 12 | Horloge au césium | `cesium_clock_1`, `cesium_clock_2`, `cesium_clock_3` | oui (qté du document : 4 ; 3 nœuds dans le GLB) |
| 13 | Unité informatique principale | `control_computer_1`, `control_computer_2` | oui (qté du document : 3 ; 2 nœuds dans le GLB) |
| 14 | Système de ventilation / évacuation des rayons X | `housing_xray_vent_L`, `housing_xray_vent_R` | oui |
| 15 | Alimentation batterie | `battery_pack`, `battery_pack_terminal_n`, `battery_pack_terminal_p` | oui |
| 16 | Déconnexion d'urgence | `singularity_main_emergency_disconnect`, `singularity_steering_emergency_disconnect`, `emergency_disconnect` (bouton du pupitre) | oui |
| 17 | Écran de vue d'urgence | `emergency_view_screen` | oui |
| 18 | Unité de contrôle à distance | `remote_control_unit` | oui |
| 19 | Ports de données / couplages | `cable_clock_data` | oui |
| 20 | Pare-feu / protection radiations | — | **non** : aucun nœud « firewall » / « radiation » / « pare-feu » |

- Les quantités et les textes restent ceux du document, même si le modèle a moins d'exemplaires (n°9, 12, 13). On n'ajoute pas de nœud manquant.
- `vgl_unit` est aussi relié à la fiche existante « capteur de gravité ». Le toucher d'un évent (`housing_xray_vent_*`) ouvre la pièce n°14, pas la fiche du boîtier.
- **Tests** : `/workspace/games3d/titor-c204-tests/t07.js` (Playwright + Chrome, tactile, 412×915 et 915×412), en local puis en ligne.
- **Captures** : `/workspace/games3d/titor-c204-v07-pieces.png` (panneau ouvert), `titor-c204-v07-surlignage.png` (surlignage + n°), `titor-c204-v07-etiquettes.png` (mode Étiquettes allumé).
- **Limites** : pièces 7 et 20 pas encore sur le modèle ; fps réel du S20 non mesuré (la box rend en logiciel) ; Safari non testé.

## v0.7.1 — en-tête mobile + étiquettes (11 nov. 2026)
Corrige les 2 bugs du rapport QA v0.7 (`/workspace/qa/titor-c204/rapport-2026-11-11-v07.md`, commit 2896506).
- **En-tête (moyenne)** : en 412 px, le titre et le sous-titre ont leur propre ligne ; les boutons (Pièces, Étiquettes, 🔊, ⛶) passent en dessous, à droite. Plus d'ellipse : on lit « ARMY MODEL GE / C204 » et tout le sous-titre, dans les deux scènes. Pas de chevauchement avec les boutons. En 915×412 et 1280×800, l'en-tête reste sur une seule ligne et n'est pas coupé. L'aide et le panneau de séquence sont descendus en portrait étroit pour ne pas passer sous les boutons. `?v=0.7.1` sur `main.js` et `style.css`.
- **Étiquettes (basse)** : une pastille par pièce (centroïde de ses nœuds), plus une par nœud. Pastille visible de 28 px, cible tactile de 44×44 px. Si deux cibles se touchent, la pastille de plus faible priorité est décalée (spirale + trait de rappel) ; on ne la cache qu'en dernier recours. Mesure des chevauchements de cibles 44 px (paires AABB) :

| Vue | v0.7 (39 pastilles 32 px, QA) | v0.7.1 avant décalage (18 pastilles) | v0.7.1 après décalage |
|---|---|---|---|
| 412×915 | 84 | 30 | **0** (18/18 visibles) |
| 915×412 | 192 | 62 | **0** (18/18 visibles) |

- **Tests** : `/workspace/games3d/titor-c204-tests/t07.js`, 412×915, 915×412, contrôle d'en-tête aussi en 1280×800 et en scène Corvette. 0 erreur, 0 requête 404, en local et en ligne.
- **Captures** : `/workspace/games3d/titor-c204-v07-pieces.png`, `titor-c204-v07-etiquettes.png`, `titor-c204-v071-entete.png`.
- Inchangé : les pièces 7 et 20 restent non mappées ; toucher une pièce interne à travers le boîtier ouvre encore « Boîtier principal ».

## v0.8 — données techniques C204 (11 nov. 2026)
Demande : enrichir le panneau Pièces et les fiches d'après `/workspace/games3d/titor-c204-docs/pieces-C204-details.txt` (PDF à côté, même contenu, référence BC-C204-GE-001-DT). Textes repris du document seulement. Cadre : « Selon le récit de John Titor, non vérifié ». L'expression « théorie du complot » n'est pas utilisée.
- **Donnée technique sur les fiches** : chaque fiche de pièce (liste, modèle ou pupitre) affiche un bloc « Donnée technique » lorsque le document en fournit une. Les n° groupés dans le document (1-2, 5-6, 8-10) reçoivent le même texte. Les pièces **n°16, 17, 18, 19 et 20** n'ont aucune donnée dans le document : le bloc n'apparaît pas (rien n'est inventé). La pièce n°7 a une donnée (« Surveillance de l'état des singularités ») mais reste non mappée en 3D.
- **Section « Caractéristiques de l'unité »** dans le panneau Pièces, avec les chiffres du document : poids 225 à ≈ 500 livres (≈ 102–227 kg) ; vitesse ≈ 10 ans/heure à 100 % de puissance, précision d'environ 50-60 ans par saut ; gravité jusqu'à ≈ 2 G près de l'unité, champ capable de courber un faisceau laser ; distances de sécurité (verticale 6 m, mass offset 5 m, arrière 8 m, avant 11 m) ; unité à masse stationnaire (déplacement dans le temps, pas dans l'espace).
- **Notes de référence** en bas du panneau (4 notes du document DT, plus le pied de page de source). Les 4 notes importantes du bon de commande (v0.7) restent au-dessus.
- **Overlay « Distances de sécurité »** (bouton dans l'en-tête + bascule dans le panneau) : anneau (mass offset 5 m), barres avant 11 m / arrière 8 m, marqueur vertical 6 m, grille élargie et pastilles HTML. Marche/arrêt sur les scènes Machine et Corvette. La géométrie est détruite (`dispose`) à l'extinction ou au changement de scène. Pendant l'affichage, le brouillard de la scène Machine (sinon près 6 / loin 16, ce qui masquait l'overlay) passe à près 28 / loin 90, puis est remis. La caméra est reculée pour tout voir en 412×915, puis restaurée à l'extinction. L'overlay est coupé au lancement d'une séquence ou d'un saut.
- **Convention d'axes** : pour les deux GLB exportés, **avant = +Z**, **arrière = −Z**, **verticale = +Y**. L'origine des distances est le centre au sol de la boîte englobante de la Machine, ou de la Corvette dans l'autre scène. Les distances se mesurent depuis cette origine, pas depuis le bord du véhicule.
- **En-tête** : le bouton Distances s'ajoute à la rangée Pièces / Étiquettes. Le calage deux lignes de la v0.7.1 en 412×915 est conservé (titre entier « ARMY MODEL GE / C204 », sous-titre lisible, pas d'ellipse).
- **Tests** : `/workspace/games3d/titor-c204-tests/t08.js` (extension de t07 ; Playwright + Chrome, tactile, 412×915 et 915×412) : fiches avec donnée technique (n°12, 4, 13) et sans (n°16), section Caractéristiques et notes, overlay marche/arrêt sur Machine et Corvette (4 pastilles visibles), en-tête, étiquettes sans chevauchement, 0 erreur, 0 requête 404. `?demo=distances`.
- **Captures** : `/workspace/games3d/titor-c204-v08-fiche.png` (fiche n°12 + donnée technique), `titor-c204-v08-caracteristiques.png`, `titor-c204-v08-distances.png`.
- **Limites** : pièces 7 et 20 toujours non mappées ; n°16–20 sans donnée technique (document) ; fps réel du S20 non mesuré ; Safari non testé. Les distances sont un schéma de lecture, pas une simulation physique.

## v0.9 — pièces 7 et 20 + exemplaires 9/12/13 (11 nov. 2026)
Demande : brancher le GLB C204 **v2** (`/workspace/assets3d/titor-c204/glb/c204.glb`, Draco + WebP, 335 472 o ≈ 328 Ko, 103 nœuds, 6 actions conservées, `explode` à 86 canaux). Aucun nœud v1 retiré ni renommé. La v1 est conservée dans `glb/c204_v1.glb`. Copié vers `assets/c204.glb` (toujours pointé par `assets/model.json`).
- **Nouveaux nœuds** (enfants de `c204_root`) ajoutés dans `data.js` :

| N° | Désignation | Nœuds | Qté document | Dans le GLB |
|---|---|---|---|---|
| 7 | Capteur de singularité / rayon | `radius_sensor_main`, `radius_sensor_steering` | 2 | 2 (désormais visible) |
| 9 | Pompe de refroidissement | `cooling_pump`, `cooling_pump_2` | 2 | 2 (était 1) |
| 12 | Horloge au césium | `cesium_clock_1..4` | 4 | 4 (était 3) |
| 13 | Unité informatique principale | `control_computer_1..3` | 3 | 3 (était 2) |
| 20 | Pare-feu / protection radiations | `radiation_firewall` | 1 | 1 (désormais visible) |

- Les mentions « Pas encore visible sur le modèle » pour les n°7 et n°20 sont retirées. Le surlignage et les étiquettes suivent tous les exemplaires. Les quantités affichées restent celles du document (déjà justes).
- **Étiquettes** : 20/20 visibles, chevauchement 0, cibles 44 px, en 412×915 et 915×412.
- **Clic** : toucher n°7 ou n°20 ouvre la bonne fiche. Ces deux pièces sont sous le pont (`housing_deck`, environ 11 cm au-dessus) ; le pare-feu est une plaque de 8 mm. En vue repos, le couvercle ou le pont intercepte souvent le rayon. En vue Éclatée, un cadrage de face les rend touchables. `radius_sensor_*` et `radiation_firewall` sont aussi dans `NAME2ID` pour entrer dans `pickables` (sans eux le rayon les traversait).
- **Explode** : les 6 nouveaux nœuds sont dans les 86 canaux et se déplacent (plus de 5 cm).
- **Corvette** : pas de régression (navigation, fiche Installation, Distances, retour Machine). L'unité dans `corvette.glb` reste la v1, ce fichier n'a pas été remplacé.
- **Tests** : `/workspace/games3d/titor-c204-tests/t09.js` (extension de t08), 412×915 et 915×412, en local puis en ligne. 0 erreur, 0 requête 404.
- **Captures** : `/workspace/games3d/titor-c204-v09-pieces.png` (mode Étiquettes 20/20), `titor-c204-v09-n20.png` (fiche n°20 surlignée, vue éclatée).
- **Limites** : n°16–20 toujours sans « Donnée technique » (document) ; C204 dans la Corvette encore en v1 ; fps S20 non mesuré ; Safari non testé. Clic n°7/n°20 plus fiable en vue éclatée.
