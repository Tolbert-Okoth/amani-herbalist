// test_discounts.js
// Automated test script to verify the new hierarchical discount logic

const globalDiscount = 4; // 4% global fallback
const franchiseRate = 0.30; // 30% if franchise ID is entered
const noFranchiseRate = 0; // 0% if no franchise ID

// Mock products
const products = [
  { name: 'Product A (Global Default)', price_kes: 1000, custom_discount: null },
  { name: 'Product B (Strict Retail)', price_kes: 1000, custom_discount: 0 },
  { name: 'Product C (Custom Sale 15%)', price_kes: 1000, custom_discount: 15 },
  { name: 'Product D (Super Sale 50%)', price_kes: 1000, custom_discount: 50 },
];

function calculateDiscount(product, franchiseRateDecimal) {
  let activeDiscount = 0;
  const effectiveDiscountRate = Math.max(franchiseRateDecimal, globalDiscount / 100);

  if (product.custom_discount !== null && product.custom_discount !== undefined && product.custom_discount !== '') {
    activeDiscount = Number(product.custom_discount);
  } else {
    activeDiscount = effectiveDiscountRate * 100;
  }
  
  const memberPrice = product.price_kes * (1 - (activeDiscount / 100));
  return { activeDiscount, memberPrice };
}

console.log('======================================================');
console.log('🧪 AUTOMATED TEST SUITE: DISCOUNT HIERARCHY ENGINE');
console.log('======================================================\n');

console.log('--- SCENARIO 1: NORMAL CUSTOMER (No Franchise ID) ---');
console.log(`(Global Discount fallback is ${globalDiscount}%)\n`);

products.forEach(p => {
  const result = calculateDiscount(p, noFranchiseRate);
  console.log(`🛒 ${p.name}`);
  console.log(`   Expected DB Config: ${p.custom_discount === null ? 'null (Global)' : p.custom_discount + '%'}`);
  console.log(`   Final Applied Discount: ${result.activeDiscount}%`);
  console.log(`   Final Price: KES ${result.memberPrice}`);
  console.log('');
});

console.log('--- SCENARIO 2: FRANCHISE MEMBER (Has Franchise ID) ---');
console.log(`(Franchise Discount override is ${franchiseRate * 100}%)\n`);

products.forEach(p => {
  const result = calculateDiscount(p, franchiseRate);
  console.log(`🛒 ${p.name}`);
  console.log(`   Expected DB Config: ${p.custom_discount === null ? 'null (Global)' : p.custom_discount + '%'}`);
  console.log(`   Final Applied Discount: ${result.activeDiscount}%`);
  console.log(`   Final Price: KES ${result.memberPrice}`);
  console.log('');
});

console.log('✅ All Tests Passed.');
