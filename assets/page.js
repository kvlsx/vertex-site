/* Shared behaviour of the subpages: mobile menu and condensed nav. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var burger = document.getElementById('burger'), links = document.getElementById('links');
  var closeMenu = function (focusBtn) {
    if (!links.classList.contains('open')) { return; }
    links.classList.remove('open'); burger.setAttribute('aria-expanded', 'false');
    if (focusBtn) { burger.focus(); }
  };
  burger.setAttribute('aria-controls', 'links');
  burger.addEventListener('click', function () {
    var o = links.classList.toggle('open'); burger.setAttribute('aria-expanded', String(o));
  });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) { closeMenu(false); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenu(true); } });
  document.addEventListener('click', function (e) { if (!e.target.closest('.nav')) { closeMenu(false); } });
  var nav = document.querySelector('.nav');
  var onScroll = function () { nav.classList.toggle('small', window.scrollY > 24); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
