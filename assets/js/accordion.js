(function () {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  function initWhyAccordion(accordion) {
    const controls = $$('[data-about-detail]', accordion);
    function selectWhyPanel(selected) {
      controls.forEach(button => {
        const expanded = button === selected;
        button.setAttribute('aria-expanded', String(expanded));
        button.closest('.why-accordion__item').classList.toggle('is-open', expanded);
        $('.why-accordion__icon', button).textContent = expanded ? '−' : '+';
        // The photo precedes the persistent heading and the description follows
        // it. CSS Grid interpolates both heights from their current values, so
        // rapid clicks can reverse an in-flight transition without timers.
        button.getAttribute('aria-controls').split(/\s+/).forEach(id => {
          const reveal = document.getElementById(id);
          reveal.setAttribute('aria-hidden', String(!expanded));
          reveal.inert = !expanded;
        });
      });
    }
    controls.forEach((button, index) => {
      button.addEventListener('click', () => selectWhyPanel(button));
      button.addEventListener('keydown', event => {
        const next = { ArrowDown: (index + 1) % controls.length, ArrowUp: (index + controls.length - 1) % controls.length, Home: 0, End: controls.length - 1 }[event.key];
        if (next === undefined) return;
        event.preventDefault(); controls[next].focus({ preventScroll: true });
      });
    });
    // Native buttons provide Enter/Space activation; selecting the open item
    // keeps it open so this accordion always has exactly one visible panel.
    selectWhyPanel(controls.find(button => button.getAttribute('aria-expanded') === 'true') || controls[0]);
    // Render the server-selected first panel before enabling user transitions.
    requestAnimationFrame(() => requestAnimationFrame(() => { accordion.dataset.motionReady = ''; }));
  }
  $$('[data-why-accordion]').forEach(initWhyAccordion);

})();
