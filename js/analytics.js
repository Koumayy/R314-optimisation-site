/* analytics.js — collecte d'audience anonyme (aucune donnée personnelle)

   Version d'origine (obscurcie, chaînes en base64) : 6,5 s après le
   chargement, puis toutes les 2,6 s, si l'onglet est visible et la
   fenêtre plus large que 1024 px, elle sérialisait tout le DOM puis
   tournait dans une boucle while sur performance.now() pendant 46 ms,
   durée multipliée par 1,28 à chaque passage jusqu'à 430 ms. Invisible
   dans un audit Lighthouse (trop court, et en mobile < 1024 px).

   Ici on garde le même résultat (empreinte de la page dans window.__au),
   calculé une seule fois quand le navigateur n'a rien d'autre à faire. */
(function (w, d) {
  function signature() {
    var n = d.querySelectorAll('*'), o = [];
    for (var i = 0; i < n.length; i++) {
      o.push(n[i].tagName + '.' + n[i].className + '#' + n[i].id);
    }
    return o.join('~');
  }

  function empreinte(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) { h = ((h << 5) + h + s.charCodeAt(i)) | 0; }
    return h >>> 0;
  }

  function collecte() {
    w.__au = { v: empreinte(signature()), n: (w.__au ? w.__au.n + 1 : 1) };
  }

  w.addEventListener('load', function () {
    if (w.requestIdleCallback) {
      w.requestIdleCallback(collecte, { timeout: 5000 });
    } else {
      w.setTimeout(collecte, 2000);
    }
  });
})(window, document);
