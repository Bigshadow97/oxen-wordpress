const {test} = require('node:test');
const assert = require('node:assert/strict');
const {individualTax,estimateTax,parseMoney} = require('../assets/js/tax.js');
test('company: original Figma example and loss',()=>{
  const estimate=estimateTax(250000);
  assert.equal(estimate.tax,70000);
  assert.equal(estimate.afterTax,180000);
  assert.ok(Math.abs(estimate.rate-28)<1e-10);
  assert.deepEqual(estimateTax(-10000),{tax:0,rate:0,afterTax:-10000});
});
test('progressive individual thresholds and effective rate',()=>{
  assert.equal(individualTax(15600),1638);
  assert.equal(individualTax(53500),8270.5);
  assert.equal(individualTax(78100),15650.5);
  assert.equal(individualTax(180000),49277.5);
  assert.equal(estimateTax(100000,'sole-trader').tax,22877.5);
  assert.equal(estimateTax(250000,'sole-trader').tax,76577.5);
});
test('partnership uses equal-share partner tax, not company tax',()=>{
  assert.equal(estimateTax(200000,'partnership',2).tax,45755);
  assert.throws(()=>estimateTax(200000,'partnership',1),RangeError);
});
test('currency parser rejects partial, ambiguous and non-finite inputs',()=>{
  assert.equal(parseMoney('$ 1,200,000'),1200000);
  assert.equal(parseMoney('$ 250,000.00'),250000);
  assert.equal(parseMoney('-10,000.50'),-10000.5);
  for(const input of ['abc','12abc','1e6','1,00','$','Infinity','1.234','-']) assert.ok(Number.isNaN(parseMoney(input)),input);
});
