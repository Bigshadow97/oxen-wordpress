(function () {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  let opener = null;
  function openDialog(dialog, trigger) {
    opener = trigger;
    dialog.showModal();
    $('[data-close-dialog]', dialog)?.focus();
  }
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => { (opener?.getClientRects().length ? opener : $('.menu-toggle'))?.focus(); opener = null; });
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const stops = $$('a[href],button,input,select,textarea,[tabindex]', dialog)
        .filter(node => !node.disabled && node.tabIndex >= 0 && node.getClientRects().length);
      if (!stops.length) { event.preventDefault(); dialog.focus(); return; }
      const first = stops[0], last = stops[stops.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    dialog.addEventListener('click', event => {
      if (event.target === dialog) {
        const r = dialog.getBoundingClientRect();
        if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
      }
    });
  });
  $$('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  $$('[data-open-contact]').forEach(button => button.addEventListener('click', event => {
    event.preventDefault();
    openDialog($('#contact-dialog'), button);
  }));
  $$('[data-open-policy]').forEach(button => button.addEventListener('click', event => { event.preventDefault(); openDialog($('#policy-dialog'), button); }));
  $$('[data-open-social]').forEach(button => button.addEventListener('click', event => { event.preventDefault(); openDialog($('#social-dialog'), button); }));
  const menuToggle = $('.menu-toggle'), menu = $('#mobile-navigation');
  function closeMenu() { if (!menuToggle) return; menu.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); }
  menuToggle?.addEventListener('click', () => { menu.hidden = !menu.hidden; menuToggle.setAttribute('aria-expanded', String(!menu.hidden)); });
  $$('a', menu || document.createElement('nav')).forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu && !menu.hidden) { closeMenu(); menuToggle.focus(); } });
  window.matchMedia('(min-width: 1440px)').addEventListener('change', closeMenu);

  const submenuControls = $$('[aria-controls].submenu-toggle');
  function setSubmenu(button, expanded) {
    button.setAttribute('aria-expanded', String(expanded));
    document.getElementById(button.getAttribute('aria-controls')).hidden = !expanded;
    button.querySelector('span').textContent = expanded ? '−' : '+';
  }
  submenuControls.forEach(button => button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    [...button.closest('ul').children].forEach(item => {
      const sibling = item.querySelector(':scope > .submenu-toggle');
      if (sibling && sibling !== button) setSubmenu(sibling, false);
    });
    setSubmenu(button, expanded);
  }));
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const control = submenuControls.find(button => button.getAttribute('aria-expanded') === 'true' && button.parentElement.contains(document.activeElement));
    if (control) { setSubmenu(control, false); control.focus(); }
  });
  document.addEventListener('click', event => {
    submenuControls.forEach(button => { if (!button.parentElement.contains(event.target)) setSubmenu(button, false); });
  });
  window.OxenDialogs = { open: openDialog };
})();
