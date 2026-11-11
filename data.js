// Fiches des pièces. Légendes tirées du manuel posté par John Titor (2000-2001),
// copie Internet Archive « JohnTitorTimeMachineManual ». Les textes « Selon le manuel »
// rapportent ce que disent les documents, pas un fait physique démontré.
export const PARTS = {
  case:{ref:'Manuel p.7 et p.8',fr:'Boîtier principal',en:'Army Model GE / C204 housing',
    body:"Coffre long et rigide qui contient toute l'unité. La vue de dessus du manuel montre un couvercle à charnière marqué de bandes diagonales noires et blanches.",
    note:"Poids annoncé par Titor : environ 100 kg (225 lb). Référence imprimée : « RESTRICTED – FILE: TMH-2006/4605 ». Dimensions exactes non données : celles-ci sont estimées."},
  lid:{ref:'Manuel p.7, n°7',fr:'Couvercle et instructions de l\'unité',en:'Unit control instructions',
    body:"Le couvercle porte une plaque « Unit control instructions » (n°7 sur la vue de dessus) et les bandes d'avertissement.",
    note:"Le texte de la plaque n'est pas lisible sur les scans connus."},
  mainSing:{ref:'Manuel p.7 n°1 · p.6 n°1',fr:'Singularité principale',en:'Main singularity / Singularity drive housing',
    body:"Selon le manuel, l'unité est alimentée par deux micro-singularités « top-spin, dual-positive » enfermées dans des boîtiers d'entraînement. La principale produit le champ de distorsion.",
    note:"Le concept s'inspire de la métrique de Kerr (trou noir en rotation, Roy Kerr, 1963). Aucune singularité manipulable n'a jamais été produite en laboratoire."},
  steerSing:{ref:'Manuel p.7 n°2',fr:'Singularité de pilotage',en:'Steering singularity',
    body:"Seconde singularité, placée à côté de la principale. Selon les messages de Titor, elle sert à orienter et décaler le champ (« off-set Tipler sinusoid »).",
    note:"Dans la simulation, elle tourne en sens inverse de la principale."},
  coils:{ref:'Manuel p.6 n°2',fr:'Bobines de champ magnétique',en:'Singularity magnetic field coil',
    body:"Anneaux autour de chaque boîtier de singularité. Selon le manuel, ils contiennent et contrôlent les singularités par champ magnétique.",
    note:"Une singularité chargée électriquement pourrait en théorie être tenue par un champ magnétique ; c'est l'idée reprise ici."},
  magGen:{ref:'Manuel p.6 n°3',fr:'Générateur / régulateur de champ magnétique',en:'Magnetic field generator / regulator',
    body:"Deux blocs sous les singularités qui alimentent les bobines.",note:"Schéma : un bloc par singularité."},
  injector:{ref:'Manuel p.6 n°4',fr:'Collecteur d\'injection de masse électronique',en:'Electron mass injector manifold',
    body:"Conduits reliés aux deux singularités. Selon Titor, on injecte des électrons pour modifier la masse et la charge des singularités, donc la forme du champ.",
    note:"Ces injecteurs sont ceux que Titor citait comme pièces clés de l'unité."},
  eReg:{ref:'Manuel p.6 n°5',fr:'Régulateur d\'électrons',en:'Electron regulator',
    body:"Petit bloc central entre les deux singularités qui dose les électrons envoyés au collecteur.",note:""},
  eGen:{ref:'Manuel p.6 n°6',fr:'Générateur d\'électrons',en:'Electron generator',
    body:"Grand bloc rectangulaire à droite du schéma, source des électrons injectés.",note:""},
  motion:{ref:'Manuel p.6 n°7',fr:'Capteurs de mouvement des singularités',en:'Singularity motion sensor',
    body:"Petits capteurs posés sur chaque boîtier, qui surveillent la position et la rotation des singularités.",note:""},
  coolHousing:{ref:'Manuel p.6 n°8',fr:'Boîtiers de refroidissement',en:'Singularity cooling housing',
    body:"Enveloppes de refroidissement autour des boîtiers de singularité.",note:""},
  pump:{ref:'Manuel p.6 n°9',fr:'Pompe de refroidissement',en:'Singularity cooling pump',
    body:"Fait circuler le liquide de refroidissement entre les réservoirs et les boîtiers.",note:""},
  tanks:{ref:'Manuel p.6 n°10',fr:'Réserve de refroidissement',en:'Singularity cooling supply',
    body:"Deux grands réservoirs en forme de capsule, reliés à la pompe.",note:"Le liquide utilisé n'est pas précisé dans les pages connues."},
  gravSensor:{ref:'Manuel p.6 n°11',fr:'Capteur de gravité / Variable Gravity Lock',en:'Gravity sensor unit',
    body:"Mesure la gravité locale. Titor parlait d'un verrouillage gravitationnel variable (« Variable Gravity Lock ») qui garde la machine attachée à la Terre pendant le déplacement.",
    note:"Le nom « Variable Gravity Lock » vient de ses messages, pas des légendes du schéma."},
  battery:{ref:'Manuel p.6 n°12',fr:'Alimentation par batteries',en:'Battery supply',
    body:"Bloc de batteries qui alimente l'ensemble (polarités + et − visibles sur le schéma).",note:""},
  clocks:{ref:'Messages de Titor',fr:'Horloges au césium',en:'Cesium clocks',
    body:"Titor mentionnait trois horloges au césium pour mesurer le temps écoulé pendant le déplacement.",
    note:"Absentes des légendes du manuel : leur place ici est une hypothèse. Les horloges atomiques au césium, elles, existent depuis 1955."},
  computers:{ref:'Messages de Titor',fr:'Ordinateurs de contrôle',en:'Control computers',
    body:"Titor évoquait quatre ordinateurs de contrôle principaux et un système de programmation de destination.",note:"Position supposée, non dessinée dans le manuel."},
  screen:{ref:'Manuel p.7 n°4',fr:'Écran de visualisation d\'urgence',en:'Emergency view screen',body:"Petit écran sur le panneau de commande.",note:""},
  disconnect:{ref:'Manuel p.7 n°5',fr:'Déconnexion d\'urgence',en:'Emergency disconnect',body:"Commande qui coupe l'unité en urgence (bouton rond sous l'écran).",note:"Dans la simulation : le bouton ARRÊT D'URGENCE."},
  onoff:{ref:'Manuel p.7 n°6',fr:'Interrupteur marche / arrêt',en:'Main unit on/off switch',body:"Interrupteur principal de l'unité.",note:"Touche « Démarrer » pour lancer la séquence."},
  emergency:{ref:'Manuel p.7 n°8',fr:'Commandes d\'urgence',en:'Emergency controls',body:"Colonne de voyants et de boutons à droite de l'écran.",note:""},
  storage:{ref:'Manuel p.7 n°9',fr:'Unité de stockage déportée',en:'Remote storage unit',body:"Compartiment à l'extrémité droite du coffre.",note:""},
  remote:{ref:'Manuel p.7 n°3',fr:'Télécommande',en:'Remote control unit',body:"Boîtier séparé relié au coffre par un câble, pour commander l'unité depuis le poste de conduite.",note:""},
  cable:{ref:'Manuel p.7',fr:'Câblage',en:'Wiring',body:"Câble entre la télécommande et le coffre.",note:""}
};
// Ordre de la visite guidée
export const TOUR = ['case','mainSing','steerSing','coils','injector','eReg','eGen','magGen','tanks','pump','coolHousing','motion','gravSensor','clocks','computers','battery','screen','onoff','disconnect','emergency','storage','remote'];

export const STEPS = [
  ['Alimentation batteries',  'battery'],
  ['Pompe de refroidissement','pump'],
  ['Bobines magnétiques',     'coils'],
  ['Synchronisation horloges césium','clocks'],
  ['Injection d\'électrons',  'injector'],
  ['Mise en rotation des singularités','mainSing'],
  ['Verrouillage gravitationnel','gravSensor'],
  ['Champ sinusoïdal de Tipler','steerSing'],
];

export const DOSSIER = `
<h1>Dossier John Titor · C204</h1>
<p>Résumé factuel des documents et de ce qui a été vérifié. La machine en 3D est une reconstitution d'après les pages publiées ; sa « mise en marche » est une simulation.</p>
<div class="tabs">
 <button data-go="d-hist">Histoire</button><button data-go="d-manuel">Le manuel</button><button data-go="d-ibm">IBM 5100</button>
 <button data-go="d-pred">Prédictions</button><button data-go="d-id">Identité</button><button data-go="d-phys">Physique</button><button data-go="d-tab">Vérifié / Non vérifié</button>
</div>

<h3 id="d-hist">Histoire</h3>
<ul>
<li><b>Novembre 2000</b> : un utilisateur anonyme écrit sur le forum Time Travel Institute sous le pseudo <i>TimeTravel_0</i>, puis sur les forums Art Bell (Post-to-Post) sous le nom <b>John Titor</b>.</li>
<li>Il dit être un soldat américain de <b>2036</b>, envoyé chercher un ordinateur <b>IBM 5100</b> de 1975, avec un arrêt en 2000 « pour raisons personnelles ».</li>
<li>Il publie des pages d'un manuel et des photos de l'unité installée dans un véhicule (il cite une Corvette 1967, puis un pick-up 4x4).</li>
<li><b>Mars 2001</b> : les messages s'arrêtent.</li>
<li><b>2003</b> : création de la société <i>John Titor Foundation</i> en Floride, et publication du livre <i>John Titor: A Time Traveler's Tale</i> qui reprend les messages.</li>
</ul>

<h3 id="d-manuel">Le manuel « C204 »</h3>
<p>Titre : <i>Operating Instructions for C204 Gravity Distortion Time Displacement Unit</i>, marqué « RESTRICTED – FILE: TMH-2006/4605 ». Copie : <a href="https://archive.org/details/JohnTitorTimeMachineManual" target="_blank" rel="noopener">Internet Archive</a>.</p>
<p>Texte d'introduction de Titor : « My "time" machine is a stationary mass, temporal displacement unit manufactured by General Electric. The unit is powered by two, top-spin, dual-positive singularities that produce a standard, off-set Tipler sinusoid. »</p>
<p><b>Page 5 · champ sinusoïdal de Tipler</b> : singularités dans un champ de Kerr, sorties de champ temporel négatif, nul et positif, zone d'évacuation des rayons X, distance de sécurité verticale, décalage de masse, horizons des événements négatif, nul et positif.</p>
<img src="docs/manuel-p5.jpg" alt="Manuel page 5 : champ de Tipler" loading="lazy">
<p><b>Page 6 · composants de base</b> (12 pièces) : boîtier d'entraînement, bobine magnétique, générateur/régulateur de champ, collecteur d'injection d'électrons, régulateur et générateur d'électrons, capteur de mouvement, boîtier, pompe et réserve de refroidissement, capteur de gravité, batteries.</p>
<img src="docs/manuel-p6.jpg" alt="Manuel page 6 : composants de base" loading="lazy">
<p><b>Page 7 · vue de dessus</b> (9 repères) : singularité principale, singularité de pilotage, télécommande, écran d'urgence, déconnexion d'urgence, interrupteur, instructions, commandes d'urgence, unité de stockage.</p>
<img src="docs/manuel-p7.jpg" alt="Manuel page 7 : vue de dessus" loading="lazy">
<p>Analyses publiées : la numérotation ne correspond pas toujours d'une page à l'autre, les polices sont irrégulières, et le matériel visible sur les photos ressemble à de l'électronique courante. Les documents n'ont jamais été authentifiés par une source indépendante.</p>

<h3 id="d-ibm">L'IBM 5100</h3>
<p>Ordinateur portable d'IBM sorti en <b>1975</b>. Titor affirmait qu'il pouvait émuler le code des grands systèmes IBM (System/360 et 370) grâce à son microcode, une capacité peu connue du public.</p>
<p><b>Bob Dubke</b>, ingénieur de l'équipe d'origine à Rochester (Minnesota), a confirmé au journal <i>Post Bulletin</i> que cette fonction existait et qu'IBM l'avait gardée discrète. Elle figurait dans la documentation de maintenance, connue des techniciens.</p>

<h3 id="d-pred">Prédictions</h3>
<ul>
<li>Percée au <b>CERN</b> sur les micro-singularités vers 2001 : le LHC a démarré en 2008 ; ni trou noir stable ni voyage temporel produit.</li>
<li>Guerre civile américaine à partir de 2004, conflit nucléaire vers 2015, fin des Jeux olympiques après 2004 : rien de cela n'a eu lieu dans notre ligne de temps.</li>
<li>Titor s'appuyait sur l'interprétation des <b>mondes multiples</b> : chaque voyage mène à une « worldline » qui diverge de 1 à 2 %. Par construction, cela rend ses prédictions impossibles à tester.</li>
<li>Ses « divergences de worldlines » ressemblent à ce qu'on appelle depuis 2009-2010 l'<b>effet Mandela</b> (terme de Fiona Broome), qui est venu après lui.</li>
</ul>

<h3 id="d-id">Identité</h3>
<p>Aucun John Titor correspondant n'a été trouvé dans les registres. En 2008, une enquête de l'émission italienne <i>Voyager</i> avec un détective privé, puis le site Hoax Hunter, ont pointé vers la famille <b>Haber</b> en Floride (Larry Haber, avocat, lié à la John Titor Foundation, et son frère informaticien). Les Haber ont nié. Joseph Matheny a dit avoir été consultant sur le projet en tant qu'expérience littéraire. Personne n'a revendiqué les messages avec preuves.</p>

<h3 id="d-phys">La vraie physique derrière</h3>
<ul>
<li><b>Métrique de Kerr</b> (Roy Kerr, 1963) : solution des équations d'Einstein pour un trou noir en rotation ; elle contient des régions où des boucles temporelles sont mathématiquement possibles.</li>
<li><b>Cylindre de Tipler</b> (Frank Tipler, 1974, <i>Physical Review D</i>) : un cylindre très massif, infiniment long et tournant très vite permettrait en théorie des courbes temporelles fermées. Un cylindre fini demanderait probablement de l'énergie négative (Hawking, 1992).</li>
<li><b>Micro-trous noirs</b> : certaines théories prévoient qu'un accélérateur pourrait en créer de minuscules qui s'évaporeraient aussitôt ; le LHC n'en a jamais observé.</li>
</ul>

<h3 id="d-tab">Vérifié / Non vérifié</h3>
<table>
<tr><th>Affirmation</th><th>Statut</th><th>Base</th></tr>
<tr><td>Les messages de 2000-2001 existent</td><td class="ok">Vérifié</td><td>Archives du Time Travel Institute et d'Internet Archive</td></tr>
<tr><td>Le manuel C204 et les photos ont été publiés par Titor</td><td class="ok">Vérifié</td><td>Copies d'époque archivées</td></tr>
<tr><td>L'IBM 5100 existe (1975)</td><td class="ok">Vérifié</td><td>Historique IBM</td></tr>
<tr><td>L'IBM 5100 pouvait émuler System/360-370</td><td class="ok">Vérifié</td><td>Confirmé par Bob Dubke ; documentation de maintenance</td></tr>
<tr><td>Cette capacité était secrète</td><td class="mx">Débattu</td><td>Peu connue du public, mais connue des techniciens</td></tr>
<tr><td>Métrique de Kerr, cylindre de Tipler</td><td class="ok">Vérifié</td><td>Publications de 1963 et 1974</td></tr>
<tr><td>Le C204 fonctionne / a été fabriqué par General Electric</td><td class="no">Non vérifié</td><td>Aucune preuve matérielle hors des images</td></tr>
<tr><td>Titor venait de 2036</td><td class="no">Non vérifié</td><td>Aucune preuve indépendante</td></tr>
<tr><td>Percée du CERN vers 2001</td><td class="no">Non réalisé</td><td>LHC démarré en 2008, aucune singularité</td></tr>
<tr><td>Guerre civile 2004, guerre nucléaire 2015</td><td class="no">Non réalisé</td><td>Dans notre ligne de temps</td></tr>
<tr><td>Identité réelle (piste Haber)</td><td class="mx">Non prouvé</td><td>Enquêtes 2008-2009 ; démenti des intéressés</td></tr>
</table>
<p class="small">Sources de départ : Internet Archive « John Titor Time Machine Manual » ; résumé de la conversation de Pascal. Ce dossier peut être complété.</p>
`;
