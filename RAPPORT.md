# Rapport TP R3.14 : optimisation de SlowSite

Alix Nasri, BUT MMI Béziers

- Dépôt (fork) : https://github.com/Koumayy/R314-optimisation-site
- Site publié : https://koumayy.github.io/R314-optimisation-site/

## 1. Conditions de mesure

Tous les relevés ont été faits en navigation privée (pas d'extensions), cache désactivé dans l'onglet Réseau, rechargement avec Ctrl+Maj+R. Pour Lighthouse et PageSpeed Insights j'ai lancé chaque analyse trois fois et gardé la médiane, en mobile et en ordinateur. Le panneau Performances a été utilisé avec un ralentissement CPU x4, sur des enregistrements d'au moins 20 secondes en scrollant.

Les mesures de référence sont prises sur le site en ligne (GitHub Pages compresse le CSS/JS/HTML en gzip, pas le serveur local). Le serveur local m'a seulement servi à tester les corrections avant de pousser.

Une limite à signaler : PageSpeed Insights n'affiche pas de données de terrain (CrUX) pour ce site, faute de trafic réel. Tout l'audit repose donc sur des données de laboratoire, c'est-à-dire une simulation, et pas sur l'expérience de vrais visiteurs.

Autre chose que j'ai remarqué tout de suite : les temps (TBT surtout) varient énormément d'un lancement à l'autre sur la version d'origine, alors que le poids et le nombre de requêtes sont stables au Ko près. Ça s'explique en partie par le problème 16 plus bas.

## 2. Résultats avant / après

Poids et requêtes : page d'accueil en ligne, premier affichage sans scroller. Le reste vient de PageSpeed Insights (Lighthouse 13.5), médiane de 3 analyses le 25/10/2026.

| Indicateur | Avant | Après | Écart |
|---|---|---|---|
| Poids transféré | 16,3 Mo | 129 Ko (fenêtre ~800 px, ça monte un peu sur grand écran et si on scrolle) | -99 % |
| Requêtes | 19 (dont 1 en 404) | 10 | -9 |
| Score mobile | 60 | 98 | +38 |
| FCP mobile | 2,4 s | 0,8 s | -1,6 s |
| LCP mobile | 67,1 s | 1,8 s | -65,3 s |
| TBT mobile | 160 ms | 0 ms | -160 ms |
| CLS mobile | 0 | 0 | = |
| Speed Index mobile | 17,6 s | 3,9 s | -13,7 s |
| Score ordinateur | 60 | 100 | +40 |
| FCP ordinateur | 0,9 s | 0,2 s | -0,7 s |
| LCP ordinateur | 12,2 s | 0,4 s | -11,8 s |
| TBT ordinateur | 190 ms | 0 ms | -190 ms |
| CLS ordinateur | 0 | 0 | = |
| Speed Index ordinateur | 4,6 s | 0,4 s | -4,2 s |

Les 3 essais, pour montrer la variance :

| | Essai 1 | Essai 2 | Essai 3 |
|---|---|---|---|
| Avant, mobile (score / TBT) | 56 / 280 ms | 60 / 160 ms | 62 / 100 ms |
| Avant, ordinateur (score / TBT) | 60 / 190 ms | 62 / 150 ms | 46 / 440 ms |
| Après, mobile (score / TBT) | 98 / 0 ms | 97 / 0 ms | 99 / 0 ms |
| Après, ordinateur (score / TBT) | 100 / 0 ms | 100 / 0 ms | 100 / 0 ms |

Avant, le score ordinateur passe de 62 à 46 entre deux essais sur la même page, avec un TBT qui triple. Après correction les essais sont quasi identiques. Le LCP mobile à 67 s vient sûrement des 3 Mo de img6 préchargée deux fois et de hero-bg, sur la connexion 4G lente simulée.

Le CLS était déjà à 0 (ou 0,021 sur un essai ordinateur) avant correction, donc les `width`/`height` n'ont pas fait bouger ce chiffre ici. Je les ai gardés quand même, ils évitent un saut de mise en page si une image arrive après le texte.

Captures dans `audit/` : `psi-mobile-avant.jpg`, `psi-ordi-avant.jpg`, `psi-mobile-apres.jpg`, `psi-ordi-apres.jpg` (les essais médians), et tous les essais dans `audit/psi-3-essais/`.

## 3. Problèmes identifiés

Les numéros de ligne renvoient aux fichiers d'origine (commit de départ du fork).

### Images et réseau (niveau 1)

| # | Fichier et ligne | Problème | Preuve | Coût | Correction |
|---|---|---|---|---|---|
| 1 | `index.html:75` à `95`, `img/img1..6.jpg` | Images de 2040 à 3968 px de large affichées dans des cartes de ~390 px | Survol dans l'onglet Réseau : intrinsèque 3968x2240, rendu ~388x219 | 9,9 Mo pour la galerie | Versions 480/800/1200 px en WebP, `<picture>` + `srcset`/`sizes` d'après les media queries, repli JPEG |
| 2 | `index.html:12` | `preload` de `img6.jpg?v=2` : à cause du `?v=2` l'image est téléchargée deux fois, et elle est en bas de page | Deux lignes img6 dans Réseau (3,3 Mo chacune) | 3,3 Mo + bande passante volée au rendu | Preload supprimé |
| 3 | `css/theme-legacy.css:11` | `hero-bg.jpg` (copie de img6, 3968 px) utilisée comme texture à 4 % d'opacité | Fichier dans Réseau qu'on ne « voit » pas à l'écran | 3,3 Mo | Version 1000 px WebP de 54 Ko, rendu identique |
| 4 | `index.html:8` | Favicon PNG 512x512 de 787 Ko pour un dégradé | Réseau | 787 Ko | SVG de 271 octets |
| 5 | `index.html:75` à `95`, `img1.html:16` | Aucun `width`/`height` sur les images | Lighthouse : éléments sans dimensions, décalages dans la pellicule | CLS | Attributs `width`/`height` ajoutés |
| 6 | `index.html` (galerie) | Toutes les images chargées d'emblée, même sous la ligne de flottaison | Cascade Réseau | requêtes inutiles au premier affichage | `loading="lazy"` sur la 2e rangée seulement, la 1re reste immédiate pour le LCP |
| 7 | `img1.html:16` (et img2 à img6) | Image affichée à sa largeur native, la page défile à l'horizontale sur mobile | Mode appareil mobile (Ctrl+Maj+M) | défaut d'affichage + 1 à 3,3 Mo | `max-width:100%` + versions 800/1200/1600 px |
| 8 | `index.html:16` | `js/legacy/polyfills.js` en 404, en script bloquant dans le `<head>` | Réseau, statut 404 + erreur console | un aller-retour pour rien avant le rendu | Référence supprimée |
| 9 | `styles.css:1`, `extra.css:1`, `theme-legacy.css:3` | Chaîne d'`@import` : styles.css → extra.css → theme-legacy.css → Google Fonts | Cascade en escalier dans Réseau, audit « chaîne de requêtes critiques » | 4 allers-retours en série avant le premier pixel | Règles utiles fusionnées dans styles.css, plus aucun `@import` |
| 10 | `styles.css:28` à `1226`, `extra.css` | 1199 classes `.redundant-N` et 800 `.extra-N` jamais utilisées | Coverage : environ 95 % de styles.css inutilisé, recherche dans tous les HTML/JS | 120 Ko bruts (≈10 Ko gzip) | Supprimées, styles.css passe à 5 Ko |
| 11 | `styles.css:2`, `index.html:9-11` | Polices : `display=block` (texte invisible au chargement), graisse 300 inutilisée, Playfair Display chargée pour rien, preload de la police 300 sans `crossorigin` (téléchargée deux fois), `dns-prefetch` vers cdn.jsdelivr.net jamais contacté | Console : « credentials mode does not match », Réseau | FCP/LCP retardés, 2 domaines externes | Poppins 400/600 hébergée avec le site, `font-display:swap`, preload corrigé avec `crossorigin` |
| 12 | `index.html:17-18` | Scripts bloquants dans le `<head>` | Lighthouse : ressources bloquant le rendu | rendu retardé | `defer` |

### JavaScript (niveau 2)

| # | Fichier et ligne | Problème | Preuve | Coût | Correction |
|---|---|---|---|---|---|
| 13 | `js/vendor/ui-kit.min.js:2` | Le « micro helper » fait au chargement une boucle `while` de 620 ms (`calibrate()` appelée dans la déclaration de l'objet), remplit un tableau de 240 000 objets jamais lu, et pose un `MutationObserver` sur tout le document qui relance `getComputedStyle` sur chaque élément à chaque mutation | Long task d'au moins 620 ms (la boucle est calée sur l'horloge, le tableau en plus prend plus longtemps avec CPU x4) juste après le téléchargement du script dans Performances, Bottom-Up | ~620 ms de blocage par page + scroll saccadé | Fichier supprimé, les 3 helpers utilisés remplacés par du natif dans app.js |
| 14 | `js/app.js:166-172` | `revealCards()` sur chaque scroll/resize : pour chaque carte, `qsa('.card')` et lecture de `offsetHeight` de toutes les cartes après avoir écrit `minHeight` → n² et reflow forcé | Triangles rouges « Forced reflow » dans Performances pendant le scroll | une long task par cran de molette | Hauteur calculée seulement au chargement/resize, lectures puis écritures. Apparition des cartes via `IntersectionObserver` |
| 14b | `js/app.js:183-188` | Dans la même fonction, `getBoundingClientRect()` + écriture d'opacité sur les 371 cases du calendrier, en alternance | idem | idem | Les cases d'une rangée ont la même position : 7 valeurs seulement, appliquées en un `mask-image` à paliers sur le calendrier. Écouteur `passive` limité à une fois par frame |
| 14c | `ui-kit.min.js` + `app.js` | Les deux problèmes s'amplifient : chaque `style.opacity` écrit par revealCards déclenche le `MutationObserver` de ui-kit, qui reparcourt tout le DOM | Bottom-Up : `_sync` et `getComputedStyle` en tête pendant le scroll | c'est ce qui rendait le scroll aussi lent | Réglé par 13 et 14 |
| 15 | `js/app.js:81` | `innerHTML +=` dans une boucle pour remplir la datalist (320 mots-clés) : tout le contenu est re-parsé à chaque tour | Bloc « Parse HTML » répété dans Performances | coût quadratique au chargement | `DocumentFragment` inséré une fois |

### Problème conditionnel (niveau 3)

| # | Fichier et ligne | Problème | Preuve | Coût | Correction |
|---|---|---|---|---|---|
| 16 | `js/analytics.js` | Code obscurci (chaînes base64). Décodées avec `atob` : `innerWidth`, `performance`, `now`, `hidden`. 6,5 s après le chargement puis toutes les 2,6 s, si l'onglet est visible et la fenêtre > 1024 px, le script sérialise tout le DOM et tourne dans une boucle d'attente active de 46 ms, puis 59, 75, 96… jusqu'à 430 ms | Enregistrement long (30 s) sur grand écran : long tasks à intervalle régulier qui grossissent. Rien en mobile ni dans un Lighthouse classique (trop court) | jusqu'à 430 ms de gel toutes les 2,6 s pour quelqu'un qui reste sur la page | Même empreinte calculée une seule fois en `requestIdleCallback`, plus de `setInterval` ni de boucle |

C'est ce script qui explique les écarts entre mobile et desktop, et entre deux lancements d'affilée : selon la largeur de fenêtre simulée et le moment où l'audit tombe, il se déclenche ou pas.

## 4. Détail des optimisations principales

### Les images (problèmes 1 à 7)

C'est là qu'était presque tout le poids. Les six photos de la galerie faisaient entre 770 Ko et 3,3 Mo, pour des vignettes de 390 px au maximum, et la même photo était téléchargée jusqu'à trois fois (img6, img6?v=2 et hero-bg qui est une copie exacte). J'ai généré des versions 480, 800 et 1200 px en WebP (qualité 72) et je laisse le navigateur choisir avec `srcset` et `sizes`. La valeur de `sizes` vient des media queries de la grille : 1 colonne sous 560 px, 2 colonnes jusqu'à 900 px, 3 au-delà, dans un conteneur de 1200 px max.

Gain mesuré : la galerie passe de 9,9 Mo à 120 à 270 Ko pour la 1re rangée (le navigateur prend le 480, 800 ou 1200 px selon l'écran et la densité de pixels), et les 3 images du bas ne sont chargées qu'en scrollant. La texture du hero passe de 3,3 Mo à 54 Ko et je n'ai vu aucune différence en comparant les captures, ce qui est logique à 4 % d'opacité.

### La chaîne CSS et les polices (problèmes 9 à 11)

Avant le premier pixel, le navigateur devait télécharger styles.css pour découvrir extra.css, puis theme-legacy.css, puis deux feuilles Google Fonts, puis les polices. Avec `display=block` en plus, le texte restait invisible tout ce temps. Tout est maintenant dans un seul fichier de 5 Ko et les polices sont servies depuis le site.

Point d'attention sur l'iso-rendu : dans extra.css, la règle d'ombre à trois couches s'appliquait à `.hero, .card, .feature, .cta`, mais comme le fichier était importé en premier, styles.css l'écrasait pour tout sauf `.hero`. J'ai gardé la règle au même endroit dans la cascade pour ne rien changer visuellement.

### Le JavaScript (problèmes 13 à 16)

ui-kit.min.js ressemblait à une petite librairie tierce, mais une fois le fichier déplié (bouton `{}` dans Sources), on voit qu'il bloque le thread 620 ms à chaque page sans que ça serve à rien. app.js n'utilisait que `qs`, `qsa`, `cls` et `ready`, soit deux lignes de JavaScript natif.

Le scroll était le cas le plus intéressant, parce qu'aucun des deux fichiers pris seul n'explique à quel point ça ramait. revealCards écrit des styles sur près de 380 éléments à chaque événement scroll, et chaque écriture réveille le MutationObserver de ui-kit qui recalcule le style de toute la page.

Pour avoir un chiffre, j'ai chronométré un événement scroll dans la console, sans ralentissement CPU : 18 à 31 ms sur la version d'origine, donc autour de 70 à 120 ms avec le CPU x4, bien au-dessus des 50 ms d'une long task. Sur la version corrigée, le gestionnaire ne fait plus que programmer un `requestAnimationFrame` (0 ms mesuré).

Ma première correction du calendrier n'était pas la bonne. J'avais mis les 7 opacités dans des variables CSS (`--o0` à `--o6`) posées sur le calendrier. C'était mieux qu'avant, mais en mesurant, chaque mise à jour coûtait encore ~17 ms : une variable CSS est héritée, donc la modifier oblige le navigateur à recalculer le style des 371 cases. Je suis passé à un `mask-image` en dégradé à paliers (une rangée = un palier) sur le calendrier : une seule propriété sur un seul élément, ~0,6 ms par mise à jour, pour le même rendu. Les deux étapes sont dans l'historique des commits.

## 5. Ce que je ferais avec un vrai serveur

Sur GitHub Pages je n'ai pas la main sur les en-têtes HTTP. Avec un serveur à moi :

- `Cache-Control: max-age=31536000, immutable` sur les images, les polices, le CSS et le JS, avec un nom de fichier versionné (`styles.a3f9c1.css`), et une revalidation courte sur le HTML. Ça demande un outil de build pour générer les noms, ce qui est interdit ici.
- Brotli au lieu de gzip pour le texte (GitHub Pages fait déjà du gzip).
- HTTP/2 ou HTTP/3, ce qui rend la fusion de fichiers moins utile.
- Servir de l'AVIF en plus du WebP. Je ne l'ai pas fait pour ne pas multiplier les fichiers, le gain restant aurait été faible après le redimensionnement.

## 6. Ce qui n'a pas marché ou que j'ai laissé

- Le `backdrop-filter: blur(6px)` sur la barre du haut a un coût de composition, mais il fait partie du rendu et la surface est petite. Je l'ai gardé.
- Pour img4, le WebP en 800 px est un peu plus lourd que le JPEG (91 Ko contre 88 Ko) parce que la photo a beaucoup de grain. Le gain vient surtout du redimensionnement, pas du format.
- Le widget `?perf=1` et la fenêtre des consignes ne font pas partie de l'exercice, je n'y ai pas touché.

## 7. Conclusion

La plus grosse partie du gain vient des images, et c'était aussi le plus simple. Les problèmes de JavaScript ne se voyaient pas du tout en lisant le code d'app.js tout seul : il a fallu le panneau Performances et le Bottom-Up pour comprendre que ui-kit était en cause, et un enregistrement long sur grand écran pour trouver analytics.js. Le site est visuellement identique (captures avant/après dans `audit/`), toutes les fonctionnalités sont conservées (filtre, calendrier, apparition des cartes, pages image).

En passant, côté accessibilité, les `alt` « Image 1 », « Image 2 »… ne décrivent pas les photos. C'est hors sujet pour ce TP, mais facile à corriger.
