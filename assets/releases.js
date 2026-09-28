/* Releases page: every public release from GitHub, notes rendered from Markdown. */
(function () {
  'use strict';
  var list = document.getElementById('relList');
  var releases = null;
  var t = function (k) { return window.vxT ? window.vxT(k) : k; };

  var esc = function (s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  // Inline Markdown on already escaped text: code, bold, links (http/https only).
  var inline = function (s) {
    return s
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
  };

  // Only the part that describes the changes: no title line, no install block.
  var notesOf = function (body) {
    var text = (body || '').replace(/\r\n/g, '\n');
    var cut = text.search(/^##\s+Install/m);
    if (cut >= 0) { text = text.slice(0, cut); }
    return text.replace(/^Vertex [^\n]*\n+/, '').trim();
  };

  var markdown = function (src) {
    var out = [], para = [], items = null, code = null;
    var flushPara = function () { if (para.length) { out.push('<p>' + inline(esc(para.join(' '))) + '</p>'); para = []; } };
    var flushList = function () { if (items) { out.push('<ul>' + items.map(function (i) { return '<li>' + inline(esc(i)) + '</li>'; }).join('') + '</ul>'); items = null; } };
    var flushCode = function () { if (code) { out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>'); code = null; } };
    src.split('\n').forEach(function (line) {
      if (/^( {4}|\t)/.test(line) && !items) { flushPara(); (code = code || []).push(line.replace(/^( {4}|\t)/, '')); return; }
      flushCode();
      var m;
      if ((m = line.match(/^#{1,6}\s+(.*)$/))) { flushPara(); flushList(); out.push('<h4>' + inline(esc(m[1])) + '</h4>'); return; }
      if ((m = line.match(/^\s*[*-]\s+(.*)$/))) { flushPara(); (items = items || []).push(m[1]); return; }
      if (!line.trim()) { flushPara(); flushList(); return; }
      if (items) { items[items.length - 1] += ' ' + line.trim(); return; }
      para.push(line.trim());
    });
    flushPara(); flushList(); flushCode();
    return out.join('');
  };

  var size = function (bytes) {
    var mb = bytes / 1048576;
    return new Intl.NumberFormat(window.vxLocale ? window.vxLocale() : 'en-GB', { maximumFractionDigits: 0 }).format(mb) + ' MB';
  };

  var DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square" aria-hidden="true"><path d="M12 3v13M5.5 10 12 16.5 18.5 10M4 21h16"/></svg>';

  var render = function () {
    if (!releases) { return; }
    var locale = window.vxLocale ? window.vxLocale() : 'en-GB';
    list.innerHTML = releases.map(function (r, k) {
      var dmg = (r.assets || []).find(function (a) { return /\.dmg$/i.test(a.name); });
      var date = new Date(r.published_at).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
      var notes = markdown(notesOf(r.body));
      return '<article class="rc' + (k === 0 ? ' now' : '') + '">' +
        '<header class="rc-head">' +
          '<div><h2 class="rc-v">' + esc(r.tag_name) + '</h2>' +
          '<p class="rc-d"><time datetime="' + esc(r.published_at) + '">' + esc(date) + '</time>' +
          (dmg ? ' · DMG · ' + size(dmg.size) : '') + '</p></div>' +
          (k === 0 ? '<span class="rc-now">' + esc(t('rel.latest')) + '</span>' : '') +
          (dmg ? '<a class="btn' + (k === 0 ? '' : ' w') + '" href="' + esc(dmg.browser_download_url) + '">' + DL + '<span>' + esc(t('rel.download')) + '</span></a>' : '') +
        '</header>' +
        (notes ? '<div class="rc-notes">' + notes + '</div>' : '') +
      '</article>';
    }).join('');
  };

  var fail = function () {
    list.innerHTML = '<div class="rel-state err"><p>' + esc(t('rel.error')) + '</p>' +
      '<a class="btn w" href="https://github.com/kvlsx/vertex-releases/releases">' + esc(t('rel.github')) + '</a></div>';
  };

  fetch('https://api.github.com/repos/kvlsx/vertex-releases/releases?per_page=100')
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!Array.isArray(data)) { fail(); return; }
      releases = data.filter(function (r) { return !r.draft && !r.prerelease; });
      if (!releases.length) { fail(); return; }
      render();
    })
    .catch(fail);

  document.addEventListener('vx:lang', function () { if (releases) { render(); } else if (list.querySelector('.err')) { fail(); } });
})();
