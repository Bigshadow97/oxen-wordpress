(function () {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const text = selector => $(selector)?.textContent.trim() || '';
  const plans = [
    { title: text('.layer-162'), stage: text('.layer-158'), description: text('.layer-164'), features: [166,168,170,172].map(id => text('.layer-' + id)) },
    { title: text('.layer-163'), stage: text('.layer-161'), description: text('.layer-165'), features: [167,169,171,173].map(id => text('.layer-' + id)) },
    { title: text('.layer-593'), stage: text('.layer-588'), description: text('.layer-595'), features: [597,599,601,603].map(id => text('.layer-' + id)) },
    { title: text('.layer-594'), stage: text('.layer-592'), description: text('.layer-596'), features: [598,600,602,604].map(id => text('.layer-' + id)) }
  ];
  let opener = null;
  function openDialog(dialog, trigger) {
    opener = trigger;
    dialog.showModal();
    $('[data-close-dialog]', dialog)?.focus();
  }
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => { opener?.focus(); opener = null; });
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
  $$('[data-open-case-study]').forEach(button => button.addEventListener('click', () => {
    $('#case-dialog-title').textContent = text('.layer-454');
    $('#case-dialog-description').textContent = text('.layer-456');
    openDialog($('#case-dialog'), button);
  }));

  $$('[data-preview-plan]').forEach(button => button.addEventListener('click', () => {
    const plan = plans[Number(button.dataset.previewPlan)];
    $('#plan-dialog-title').textContent = plan.title;
    $('#plan-dialog-description').textContent = plan.description;
    $('#plan-dialog-features').replaceChildren(...plan.features.map(feature => { const li = document.createElement('li'); li.textContent = feature; return li; }));
    openDialog($('#plan-dialog'), button);
  }));
  $('[data-open-comparison]')?.addEventListener('click', event => {
    $('#comparison-rows').replaceChildren(...plans.map(plan => {
      const row = document.createElement('tr');
      [plan.title, plan.stage, plan.features.join(' · ')].forEach((value, index) => {
        const cell = document.createElement(index === 0 ? 'th' : 'td');
        if (index === 0) cell.scope = 'row';
        cell.textContent = value; row.append(cell);
      });
      return row;
    }));
    openDialog($('#comparison-dialog'), event.currentTarget);
  });
  function initWhyAccordion(accordion) {
    const controls = $$('[data-about-detail]', accordion);
    function selectWhyPanel(selected) {
      controls.forEach(button => {
        const expanded = button === selected;
        button.setAttribute('aria-expanded', String(expanded));
        button.closest('.why-item').classList.toggle('is-open', expanded);
        $('.why-icon', button).textContent = expanded ? '−' : '+';
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

  const menuToggle = $('.menu-toggle'), menu = $('#mobile-navigation');
  function closeMenu() { if (!menuToggle) return; menu.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); }
  menuToggle?.addEventListener('click', () => { menu.hidden = !menu.hidden; menuToggle.setAttribute('aria-expanded', String(!menu.hidden)); });
  $$('a', menu || document.createElement('nav')).forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu && !menu.hidden) { closeMenu(); menuToggle.focus(); } });
  window.matchMedia('(min-width: 1440px)').addEventListener('change', closeMenu);

  // The first question/options are exact Figma copy. Later steps add the
  // required behavior in the same component; no personal data is collected.
  const quiz = $('#quiz'), answers = $$('[data-quiz-answer]');
  const originalQuestion = text('#quiz-question');
  const questions = [
    { title: originalQuestion, choices: ['Pre Revenue', 'Under $250K', '$250K - $1M', '$1M - $5M', '$5M +'] },
    { title: 'Where is your business today?', choices: ['Just starting', 'Up and running', 'Growing fast', 'Scaling up'] },
    { title: 'What support do you need most?', choices: ['Set things up', 'Tax & compliance', 'Planning & insights', 'A finance leader'] }
  ];
  let step = 0; let responses = [];
  const quizSteps = $('.quiz-steps', quiz);
  function renderQuizProgress(complete = false) {
    $$('[data-quiz-step]', quiz).forEach((circle, index) => {
      const state = complete || index < step ? 'completed' : index === step ? 'active' : 'upcoming';
      circle.dataset.state = state;
      circle.setAttribute('aria-label', 'Question ' + (index + 1) + ' of 3, ' + (state === 'active' ? 'current' : state));
      if (state === 'active') circle.setAttribute('aria-current', 'step');
      else circle.removeAttribute('aria-current');
      $('img', circle).src = state === 'active' ? quizSteps.dataset.activeImage : quizSteps.dataset.inactiveImage;
    });
  }
  function renderQuiz() {
    quiz.classList.remove('is-complete');
    $('#quiz-progress').textContent = 'Question 0' + (step + 1) + ' of 03';
    $('#quiz-question').textContent = questions[step].title;
    $('.quiz-widget', quiz).dataset.choiceCount = String(questions[step].choices.length);
    $('.quiz-controls', quiz).hidden = step === 0;
    $('#quiz-support').hidden = false;
    answers.forEach(button => {
      const index = Number(button.dataset.quizAnswer);
      button.hidden = index >= questions[step].choices.length;
      button.querySelector('.design-layer').textContent = questions[step].choices[index] || '';
      const selected = responses[step] === index || (step === 0 && responses[0] === undefined && index === 0);
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    $('[data-quiz-back]').hidden = step === 0;
    $('[data-quiz-restart]').hidden = true;
    $('[data-quiz-result-link]').hidden = true;
    $('#quiz-result').textContent = '';
    renderQuizProgress();
  }
  answers.forEach(button => button.addEventListener('click', () => {
    responses[step] = Number(button.dataset.quizAnswer);
    if (step < 2) { step++; renderQuiz(); $('#quiz-question').focus({preventScroll:true}); }
    else {
      const revenueTier = [0,0,1,2,3][responses[0]];
      const recommended = Math.max(revenueTier, responses[1], responses[2]);
      quiz.classList.add('is-complete');
      renderQuizProgress(true);
      $('#quiz-support').hidden = true;
      $('#quiz-progress').textContent = 'Your recommendation';
      $('#quiz-question').textContent = plans[recommended].title;
      $('#quiz-result').textContent = plans[recommended].description;
      $('[data-quiz-restart]').hidden = false;
      $('[data-quiz-result-link]').hidden = false;
      $('[data-quiz-result-link]').href = '#service-' + recommended;
      $('[data-quiz-back]').hidden = false;
      $('[data-quiz-result-link]').focus({preventScroll:true});
    }
  }));
  $('[data-quiz-back]')?.addEventListener('click', () => { step = Math.max(0, step - (quiz.classList.contains('is-complete') ? 0 : 1)); renderQuiz(); $('#quiz-question').focus({preventScroll:true}); });
  $('[data-quiz-restart]')?.addEventListener('click', () => { step = 0; responses = []; renderQuiz(); answers[0].focus({preventScroll:true}); });
  ['foundations','essentials','advisory','cfo'].forEach((name,index) => { const card = $('.service-' + name); if (card) card.id = 'service-' + index; });
  if (quiz) renderQuiz();

  // Only supplied Figma copy is used. Additional slides are the two original
  // case studies and are explicitly identified as client stories, not invented testimonials.
  const stories = [
    { body: text('#client-story'), name: text('#client-name'), role: text('#client-role'), testimonial: true },
    { body: text('.layer-456'), name: 'Manufacturing · Auckland', role: text('.layer-454'), testimonial: false },
    { body: text('.layer-457'), name: 'Professional services · Wellington', role: text('.layer-455'), testimonial: false }
  ];
  let story = 0;
  const storyPrevious = $('[data-slider-previous]');
  const storyNext = $('[data-slider-next]');
  function updateStoryNavigation() {
    if (!storyPrevious || !storyNext) return;
    const focusedControl = document.activeElement;
    storyPrevious.hidden = story === 0;
    storyNext.hidden = story === stories.length - 1;
    // A boundary control may disappear after activation. Keep focus in the
    // navigation, on the remaining control, without moving the viewport.
    if (focusedControl === storyPrevious && storyPrevious.hidden) storyNext.focus({preventScroll:true});
    if (focusedControl === storyNext && storyNext.hidden) storyPrevious.focus({preventScroll:true});
  }
  function showStory(direction) {
    const nextStory = Math.max(0, Math.min(stories.length - 1, story + direction));
    if (nextStory === story) return;
    story = nextStory;
    $('#client-story').textContent = stories[story].body;
    $('#client-name').textContent = stories[story].name;
    $('#client-role').textContent = stories[story].role;
    $('.layer-430').textContent = stories[story].testimonial ? 'Testimonials' : 'Client stories';
    $('#slider-position').textContent = 'Client story ' + (story + 1) + ' of ' + stories.length;
    updateStoryNavigation();
  }
  storyNext?.addEventListener('click', () => showStory(1));
  storyPrevious?.addEventListener('click', () => showStory(-1));
  $('.testimonial-navigation')?.addEventListener('keydown', event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); showStory(event.key === 'ArrowRight' ? 1 : -1); } });
  updateStoryNavigation();

  const taxForm = $('#tax-form');
  const money = new Intl.NumberFormat('en-NZ', {style: 'currency', currency: 'NZD', maximumFractionDigits: 0});
  function calculateTax(event) {
    event?.preventDefault();
    const revenue = OxenTax.parseMoney($('#annual-revenue').value);
    const profit = OxenTax.parseMoney($('#annual-profit').value);
    const structure = $('#business-structure').value;
    const partners = Number($('#partner-count').value);
    let error = '';
    if (!Number.isFinite(revenue) || revenue < 0) error = 'Enter a valid annual revenue of $0 or more.';
    else if (!Number.isFinite(profit)) error = 'Enter a valid annual profit, using up to two decimal places.';
    else if (profit > revenue) error = 'Annual profit cannot be greater than annual revenue.';
    else if (structure === 'partnership' && (!Number.isInteger(partners) || partners < 2 || partners > 100)) error = 'Enter between 2 and 100 equal-share partners.';
    $('#tax-error').textContent = error;
    if (error) { $('#tax-status').textContent = 'Estimate unchanged. ' + error; return; }
    const estimate = OxenTax.estimateTax(profit, structure, partners);
    $('#tax-owed').textContent = money.format(estimate.tax);
    $('#effective-rate').textContent = estimate.rate.toFixed(1) + '%';
    $('#after-tax-profit').textContent = money.format(estimate.afterTax);
    $('#tax-status').textContent = 'Estimated tax ' + money.format(estimate.tax) + '. Effective rate ' + estimate.rate.toFixed(1) + ' percent. After-tax profit ' + money.format(estimate.afterTax) + (structure === 'partnership' ? '. Assumes equal shares and no other partner income.' : '.');
  }
  taxForm?.addEventListener('submit', calculateTax);
  $('#business-structure')?.addEventListener('change', () => { $('.partnership-control').hidden = $('#business-structure').value !== 'partnership'; calculateTax(); });
  if (taxForm) calculateTax();
})();
