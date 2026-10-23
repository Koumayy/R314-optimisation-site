/* ============================================================
   app.js — interactions de la galerie SlowSite
   Révélation des vignettes au scroll + nuage de mots-clés.
   Plus de dépendance à ui-kit.min.js : les 3 helpers utilisés
   (qs, qsa, cls) sont remplacés par leur équivalent natif.
   ============================================================ */
(function () {
  'use strict';

  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  /* Vocabulaire d'indexation de la photothèque. */
  var TAGS = [
    'portrait', 'paysage', 'nature morte', 'macro', 'architecture', 'photo de rue',
    'reportage', 'documentaire', 'animalier', 'sport', 'mode', 'culinaire', 'spectacle',
    'concert', 'mariage', 'corporate', 'packshot', 'astrophotographie', 'sous-marine',
    'aérienne', 'urbex', 'industrielle', 'scolaire', 'studio', 'autoportrait', 'street art',
    'botanique', 'ornithologie', 'minéralogie', 'scène de genre', 'pose longue', 'filé',
    'bokeh', 'contre-jour', 'panoramique', 'focus stacking', 'light painting',
    'surimpression', 'sténopé', 'lomographie', 'time-lapse', 'hyperlapse', 'photogramme',
    'solarisation', 'bracketing', 'rafale', 'mise au point manuelle', 'hyperfocale',
    'profondeur de champ', 'flou de bougé', 'zoom burst', 'réflexion', 'silhouette',
    'ombre portée', 'symétrie miroir', 'levée de voile', 'prise de vue au flash',
    'seconde synchro', 'multi-exposition', 'vue éclatée', 'heure dorée', 'heure bleue',
    'lumière rasante', 'lumière diffuse', 'clair-obscur', 'éclairage Rembrandt',
    'éclairage papillon', 'lumière naturelle', 'flash déporté', 'boîte à lumière',
    'réflecteur', 'nid d\'abeille', 'gélatine colorée', 'stroboscope', 'low key',
    'high key', 'halo', 'contre-jour partiel', 'lumière d\'appoint', 'fond lumineux',
    'ombre douce', 'ombre dure', 'lumière zénithale', 'lumière latérale',
    'lumière frontale', 'pénombre', 'rétroéclairage', 'faisceau', 'diffuseur', 'snoot',
    'grand angle', 'téléobjectif', 'focale fixe', 'zoom transstandard', 'fisheye',
    'tilt-shift', 'trépied', 'monopode', 'rotule ball', 'filtre polarisant', 'filtre ND',
    'filtre dégradé', 'pare-soleil', 'télémètre', 'reflex', 'hybride', 'moyen format',
    'grand format', 'chambre photographique', 'flash cobra', 'bague allonge', 'soufflet',
    'doubleur de focale', 'déclencheur souple', 'viseur optique', 'viseur électronique',
    'carte mémoire', 'batterie de secours', 'sac photo', 'courroie', 'pellicule',
    'format 35 mm', 'format 120', 'négatif', 'diapositive', 'tirage argentique',
    'laboratoire', 'révélateur', 'fixateur', 'agrandisseur', 'planche contact',
    'papier baryté', 'papier RC', 'virage sépia', 'cyanotype', 'platinotypie',
    'gomme bichromatée', 'collodion humide', 'daguerréotype', 'sels d\'argent',
    'grain argentique', 'poussée de développement', 'bain d\'arrêt', 'séchage', 'spire',
    'cuve de développement', 'chambre noire', 'inactinique', 'chimie', 'archivage',
    'monochrome', 'sépia', 'désaturé', 'couleurs saturées', 'teintes froides',
    'teintes chaudes', 'balance des blancs', 'colorimétrie', 'étalonnage', 'courbe tonale',
    'niveaux', 'dominante bleue', 'dominante verte', 'duotone', 'trichromie', 'pastel',
    'contraste élevé', 'contraste doux', 'noir profond', 'blanc pur', 'gris neutre',
    'palette restreinte', 'complémentaires', 'camaïeu', 'teinte unique', 'virage croisé',
    'rendu cinéma', 'rendu neutre', 'rendu chaud', 'aplat', 'règle des tiers',
    'nombre d\'or', 'lignes de fuite', 'symétrie', 'cadre dans le cadre', 'point de fuite',
    'diagonale dominante', 'premier plan', 'arrière-plan', 'perspective forcée',
    'contre-plongée', 'plongée', 'hauteur d\'homme', 'cadrage serré', 'plan large',
    'plan d\'ensemble', 'gros plan', 'plan américain', 'format carré', 'format panoramique',
    'orientation portrait', 'orientation paysage', 'espace négatif', 'répétition',
    'rythme visuel', 'point focal', 'ligne d\'horizon', 'décentrage',
    'remplissage du cadre', 'hors-champ', 'montagne', 'littoral', 'forêt', 'désert',
    'ville', 'village', 'ruelle', 'marché', 'port', 'gare', 'friche', 'chantier', 'champ',
    'vignoble', 'rivière', 'cascade', 'lac', 'falaise', 'dune', 'marais', 'sentier', 'pont',
    'phare', 'moulin', 'ruines', 'cloître', 'verrière', 'escalier', 'façade', 'toiture',
    'aube', 'crépuscule', 'nuit étoilée', 'brume', 'brouillard', 'pluie', 'orage', 'neige',
    'givre', 'vent', 'ciel dégagé', 'arc-en-ciel', 'nuages bas', 'cumulus', 'éclaircie',
    'averse', 'gel matinal', 'canicule', 'embruns', 'rosée', 'halo lunaire', 'voie lactée',
    'aurore', 'éclipse', 'mirage', 'poussière', 'sable soulevé', 'reflet mouillé', 'flaque',
    'vapeur', 'recadrage', 'retouche', 'densité', 'masque de fusion', 'calque de réglage',
    'accentuation', 'réduction de bruit', 'correction optique', 'redressement', 'détourage',
    'tampon', 'correcteur localisé', 'dématriçage', 'fichier brut', 'export web',
    'profil colorimétrique', 'netteté de sortie', 'vignetage', 'aberration chromatique',
    'distorsion', 'moiré', 'clarté', 'texture', 'suppression de poussières', 'fusion HDR',
    'assemblage panoramique', 'upscaling', 'compression', 'métadonnées', 'mots-clés',
    'tirage d\'exposition', 'accrochage', 'encadrement', 'passe-partout', 'portfolio',
    'série', 'diptyque', 'triptyque', 'édition limitée', 'numérotation', 'vernissage',
    'résidence', 'commande', 'cession de droits', 'droit à l\'image', 'légende',
    'fonds photographique', 'inventaire', 'numérisation', 'conservation'
  ];

  /* Alimente les suggestions du champ de filtrage avec le vocabulaire
     d'indexation de la photothèque. */
  function buildKeywordIndex() {
    var list = qs('#motscles');
    if (!list) return;

    // Tout est construit hors du DOM puis inséré en une fois (avant :
    // innerHTML += dans la boucle, la liste était re-parsée à chaque tour).
    var frag = document.createDocumentFragment();
    for (var i = 0; i < TAGS.length; i++) {
      var opt = document.createElement('option');
      opt.value = TAGS[i];
      frag.appendChild(opt);
    }
    list.textContent = '';
    list.appendChild(frag);
  }

  /* Construit le calendrier d'activité : 53 semaines de 7 jours, la teinte de
     chaque case reflétant le nombre de prises de vue archivées ce jour-là. */
  function buildActivityCalendar() {
    var host = qs('#calendrier');
    if (!host) return;

    var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
                'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    var fin = new Date(Date.UTC(2026, 8, 30));
    var frag = document.createDocumentFragment();

    for (var i = 370; i >= 0; i--) {
      var jour = new Date(fin.getTime() - i * 86400000);
      var n = activite(jour);
      var cell = document.createElement('div');
      cell.className = 'cal-day';
      cell.setAttribute('data-n', String(n));
      cell.title = n === 0
        ? 'Aucune prise de vue le ' + jour.getUTCDate() + ' ' + MOIS[jour.getUTCMonth()]
        : n + ' prise' + (n > 1 ? 's' : '') + ' de vue le ' + jour.getUTCDate() +
          ' ' + MOIS[jour.getUTCMonth()];
      frag.appendChild(cell);
    }
    host.appendChild(frag);
  }

  /* Niveau d'activité d'une journée, de 0 à 4. Les sorties sont plus
     nombreuses le week-end et à la belle saison. */
  function activite(jour) {
    var j = jour.getUTCDay();
    var mois = jour.getUTCMonth();
    var graine = (jour.getUTCFullYear() * 372 + mois * 31 + jour.getUTCDate()) * 2654435761;
    var bruit = ((graine >>> 13) % 100) / 100;
    var poids = (j === 0 || j === 6 ? 0.45 : 0.12) +
                (mois >= 4 && mois <= 8 ? 0.28 : 0.05) + bruit * 0.45;
    if (poids < 0.35) return 0;
    if (poids < 0.6) return 1;
    if (poids < 0.8) return 2;
    if (poids < 0.95) return 3;
    return 4;
  }

  /* Filtre la galerie sur les mots-clés associés à chaque visuel. */
  function filterGallery() {
    var champ = qs('#q');
    var info = qs('#filter-info');
    if (!champ) return;

    var q = champ.value.trim().toLowerCase();
    var cards = qsa('.card');
    var visibles = 0;

    for (var i = 0; i < cards.length; i++) {
      var mots = (cards[i].getAttribute('data-mots') || '').toLowerCase();
      var match = !q || mots.indexOf(q) !== -1;
      cards[i].style.display = match ? '' : 'none';
      if (match) visibles++;
    }

    if (info) {
      if (!q) {
        info.textContent = '';
      } else if (!visibles) {
        // Le vocabulaire couvre tout le fonds, pas seulement cette sélection.
        info.textContent = 'Aucun visuel de la sélection pour « ' + champ.value.trim() + ' »';
      } else {
        info.textContent = visibles + ' visuel' + (visibles > 1 ? 's' : '') +
                           ' sur ' + cards.length;
      }
    }
  }

  /* Hauteur de la plus grande carte appliquée à toutes, pour garder une
     grille régulière. Toutes les lectures d'abord, puis toutes les
     écritures : un seul recalcul de mise en page au lieu d'un par carte.
     N'a besoin d'être refait qu'au chargement et au redimensionnement. */
  function equalizeCards() {
    var cards = qsa('.card');
    var i;
    for (i = 0; i < cards.length; i++) cards[i].style.minHeight = '';
    var tallest = 0;
    for (i = 0; i < cards.length; i++) {
      tallest = Math.max(tallest, cards[i].offsetHeight);
    }
    for (i = 0; i < cards.length; i++) cards[i].style.minHeight = tallest + 'px';
  }

  /* Anime l'arrivée des cartes dans le viewport. IntersectionObserver fait
     le calcul de position lui-même, sans rien lire dans le gestionnaire
     de scroll. Une carte révélée n'est plus observée. */
  function revealCards() {
    var cards = qsa('.card');
    if (!('IntersectionObserver' in window)) {
      cards.forEach(function (c) { c.classList.add('visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        // top < 0 : carte déjà dépassée (page ouverte plus bas, ancre…)
        if (e.isIntersecting || e.boundingClientRect.top < 0) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px' });
    cards.forEach(function (c) { io.observe(c); });
  }

  /* Les cases du calendrier s'éclairent à l'approche du milieu de l'écran.
     Toutes les cases d'une même rangée (7 rangées, une par jour de la
     semaine) ont la même position verticale : on ne calcule donc que
     7 valeurs, posées en variables CSS sur le calendrier (voir
     .cal-day:nth-child dans styles.css), au lieu de mesurer et styler
     371 cases à chaque événement scroll. */
  var cal = null;
  var calStep = 0;

  function initCalendarFade() {
    cal = qs('#calendrier');
    if (!cal || cal.children.length < 2) { cal = null; return; }
    calStep = cal.children[1].getBoundingClientRect().top -
              cal.children[0].getBoundingClientRect().top;
    updateCalendarFade();
  }

  function updateCalendarFade() {
    if (!cal) return;
    var top = cal.getBoundingClientRect().top;
    var vh = window.innerHeight;
    for (var r = 0; r < 7; r++) {
      var d = Math.abs(top + r * calStep - vh / 2);
      cal.style.setProperty('--o' + r, Math.max(0.15, 1 - d / vh));
    }
  }

  /* Un seul passage par image affichée, quel que soit le nombre
     d'événements scroll/resize reçus entre deux. */
  var scrollPending = false;
  function onScroll() {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(function () {
      scrollPending = false;
      updateCalendarFade();
    });
  }

  var resizePending = false;
  function onResize() {
    if (resizePending) return;
    resizePending = true;
    requestAnimationFrame(function () {
      resizePending = false;
      equalizeCards();
      updateCalendarFade();
    });
  }

  /* Affiche les images une fois chargées. */
  function watchImages() {
    qsa('.card img').forEach(function (img) {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', function () {
          img.classList.add('loaded');
        });
      }
    });
  }

  function init() {
    buildKeywordIndex();
    buildActivityCalendar();
    watchImages();
    equalizeCards();
    revealCards();
    initCalendarFade();
    var champ = qs('#q');
    if (champ) champ.addEventListener('input', filterGallery);
  }

  // Le script est en defer donc le DOM est prêt, mais on garde la sécurité.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // passive : on n'appelle jamais preventDefault(), le navigateur peut
  // donc faire défiler sans attendre la fin du gestionnaire.
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('load', onResize);
})();
