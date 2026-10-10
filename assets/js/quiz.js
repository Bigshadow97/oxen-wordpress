(function () {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const text = selector => $(selector)?.textContent.trim() || '';
  const plans = $$('[data-service-card]').map(card => ({
    title: $('.service-card__title', card).textContent.trim(),
    stage: $('.service-card__stage', card).textContent.trim(),
    description: $('.service-card__description', card).textContent.trim(),
    features: $$('.service-card__feature', card).map(item => item.textContent.trim())
  }));
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
  const quizSteps = $('.quiz-card__steps', quiz);
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
    $('.quiz-card', quiz).dataset.choiceCount = String(questions[step].choices.length);
    $('.quiz-card__controls', quiz).hidden = step === 0;
    $('#quiz-support').hidden = false;
    answers.forEach(button => {
      const index = Number(button.dataset.quizAnswer);
      button.hidden = index >= questions[step].choices.length;
      button.querySelector('.quiz-card__answer-label').textContent = questions[step].choices[index] || '';
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
  $('.quiz-card__answers', quiz).addEventListener('click', event => {
    const button = event.target.closest('[data-quiz-answer]');
    if (!button || !quiz.contains(button)) return;
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
  });
  $('[data-quiz-back]')?.addEventListener('click', () => { step = Math.max(0, step - (quiz.classList.contains('is-complete') ? 0 : 1)); renderQuiz(); $('#quiz-question').focus({preventScroll:true}); });
  $('[data-quiz-restart]')?.addEventListener('click', () => { step = 0; responses = []; renderQuiz(); answers[0].focus({preventScroll:true}); });
  if (quiz) renderQuiz();

})();
