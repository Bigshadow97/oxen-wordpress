(function () {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const text = selector => $(selector)?.textContent.trim() || '';
  // Only supplied Figma copy is used. Additional slides are the two original
  // case studies and are explicitly identified as client stories, not invented testimonials.
  const stories = [
    { body: text('#client-story'), name: text('#client-name'), role: text('#client-role'), testimonial: true },
    { body: text('.case-study__description--manufacturing'), name: 'Manufacturing · Auckland', role: text('.case-study__title--manufacturing'), testimonial: false },
    { body: text('.case-study__description--consulting'), name: 'Professional services · Wellington', role: text('.case-study__title--consulting'), testimonial: false }
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
    $('.testimonial__eyebrow').textContent = stories[story].testimonial ? 'Testimonials' : 'Client stories';
    $('#slider-position').textContent = 'Client story ' + (story + 1) + ' of ' + stories.length;
    updateStoryNavigation();
  }
  storyNext?.addEventListener('click', () => showStory(1));
  storyPrevious?.addEventListener('click', () => showStory(-1));
  $('.testimonial__navigation')?.addEventListener('keydown', event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); showStory(event.key === 'ArrowRight' ? 1 : -1); } });
  updateStoryNavigation();

})();
