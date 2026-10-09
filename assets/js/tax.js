/** NZ income-tax calculations. IRD rates effective from 1 April 2025.
 * Sources: https://www.ird.govt.nz/income-tax/income-tax-for-businesses-and-organisations/tax-rates-for-businesses
 * https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals
 * Partnerships are pass-through; this estimate assumes equal shares and no other partner income.
 */
(function (global) {
  'use strict';
  const brackets = [[15600, 0.105], [53500, 0.175], [78100, 0.30], [180000, 0.33], [Infinity, 0.39]];
  function individualTax(profit) {
    let tax = 0, lower = 0;
    for (const [upper, rate] of brackets) {
      tax += Math.max(0, Math.min(profit, upper) - lower) * rate;
      if (profit <= upper) break;
      lower = upper;
    }
    return tax;
  }
  function estimateTax(profit, structure = 'company', partners = 2) {
    if (!Number.isFinite(profit) || !['company', 'sole-trader', 'partnership'].includes(structure)) throw new TypeError('Invalid tax inputs.');
    if (structure === 'partnership' && (!Number.isInteger(partners) || partners < 2 || partners > 100)) throw new RangeError('Enter between 2 and 100 partners.');
    const taxable = Math.max(0, profit);
    const rawTax = structure === 'company' ? taxable * 0.28 : structure === 'partnership' ? individualTax(taxable / partners) * partners : individualTax(taxable);
    const tax = Math.round((rawTax + Number.EPSILON) * 100) / 100;
    return { tax, rate: taxable ? tax / taxable * 100 : 0, afterTax: Math.round((profit - tax) * 100) / 100 };
  }
  function parseMoney(value) {
    const input = String(value).trim().replace(/^\$\s*/, '');
    // Accept plain digits or correctly grouped thousands; reject partial/exponent input.
    if (!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(input)) return NaN;
    const number = Number(input.replaceAll(',', ''));
    return Number.isFinite(number) && Math.abs(number) <= 100000000000 ? number : NaN;
  }
  const api = Object.freeze({ individualTax, estimateTax, parseMoney });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.OxenTax = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
