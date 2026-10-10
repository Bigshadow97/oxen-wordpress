(function () {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
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
  $('#business-structure')?.addEventListener('change', () => { $('.calculator__partners').hidden = $('#business-structure').value !== 'partnership'; calculateTax(); });
  if (taxForm) calculateTax();
})();
