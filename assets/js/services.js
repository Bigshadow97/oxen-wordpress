/* Service information comes from the rendered cards, with no layout selectors. */
(function () {
  'use strict';
  const plans = [...document.querySelectorAll('[data-service-card]')].map(card => ({
    title: card.querySelector('.service-card__title').textContent.trim(),
    stage: card.querySelector('.service-card__stage').textContent.trim(),
    description: card.querySelector('.service-card__description').textContent.trim(),
    features: [...card.querySelectorAll('.service-card__feature')].map(item => item.textContent.trim())
  }));
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-preview-plan],[data-open-comparison],[data-open-case-study]');
    if (!trigger) return;
    let dialog;
    if (trigger.hasAttribute('data-preview-plan')) {
      const plan = plans[Number(trigger.dataset.previewPlan)];
      if (!plan) return;
      dialog = document.querySelector('#plan-dialog');
      dialog.querySelector('#plan-dialog-title').textContent = plan.title;
      dialog.querySelector('#plan-dialog-description').textContent = plan.description;
      dialog.querySelector('#plan-dialog-features').replaceChildren(...plan.features.map(feature => {
        const item = document.createElement('li');
        item.textContent = feature;
        return item;
      }));
    } else if (trigger.hasAttribute('data-open-comparison')) {
      dialog = document.querySelector('#comparison-dialog');
      dialog.querySelector('#comparison-rows').replaceChildren(...plans.map(plan => {
        const row = document.createElement('tr');
        [plan.title, plan.stage, plan.features.join(' · ')].forEach((value, index) => {
          const cell = document.createElement(index === 0 ? 'th' : 'td');
          if (index === 0) cell.scope = 'row';
          cell.textContent = value;
          row.append(cell);
        });
        return row;
      }));
    } else {
      dialog = document.querySelector('#case-dialog');
      dialog.querySelector('#case-dialog-title').textContent = document.querySelector('.case-study__title--manufacturing').textContent.trim();
      dialog.querySelector('#case-dialog-description').textContent = document.querySelector('.case-study__description--manufacturing').textContent.trim();
    }
    document.dispatchEvent(new CustomEvent('oxen:open-dialog', { detail: { dialog, trigger } }));
  });
})();
