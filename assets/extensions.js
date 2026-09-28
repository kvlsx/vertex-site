/* Extensions page: versions and new entries from the live registry. */
(function () {
  'use strict';
  var list = document.getElementById('extList');
  var esc = function (s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  var t = function (k) { return window.vxT ? window.vxT(k) : k; };
  var TYPE = { adblocker: 'ext.type.adblocker', proxy: 'ext.type.proxy' };
  var GENERIC = '<svg viewBox="0 0 120 120" fill="none" stroke="#0b0b0b" stroke-width="7" stroke-linejoin="round"><path d="M22 40h22a10 10 0 1 1 20 0h22v22a10 10 0 1 1 0 20v22H22z" fill="#fff"/></svg>';

  fetch('https://raw.githubusercontent.com/kvlsx/vertex-extensions/main/registry.json')
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (reg) {
      var items = reg && Array.isArray(reg.extensions) ? reg.extensions : [];
      // Service packs are websites, not extensions; the app hides them too.
      items.filter(function (x) { return x && x.type !== 'service-pack'; }).forEach(function (x) {
        var card = list.querySelector('[data-ext="' + String(x.id).replace(/"/g, '') + '"]');
        if (!card) {
          card = document.createElement('article');
          card.className = 'xc c-w';
          card.dataset.ext = x.id;
          var typeKey = TYPE[x.type];
          card.innerHTML =
            '<div class="xc-top"><span class="xc-type"' + (typeKey ? ' data-t="' + typeKey + '"' : '') + '>' + esc(typeKey ? t(typeKey) : x.type) + '</span><span class="xc-ver" data-ver></span></div>' +
            '<div class="xc-glyph">' + GENERIC + '</div>' +
            '<h2 class="xc-name">' + esc(x.name) + '</h2>' +
            '<p class="xc-desc">' + esc(x.description) + '</p>' +
            '<p class="xc-by"><span data-t="ext.by">' + esc(t('ext.by')) + '</span>: ' + esc(x.author) + '</p>';
          list.appendChild(card);
        }
        var ver = card.querySelector('[data-ver]');
        if (ver && x.version) { ver.textContent = 'v' + x.version; }
      });
    })
    .catch(function () {});
})();
