import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_VARIANT_ID = '7f6516f7-3dc7-4cbd-9fd7-1e5b67c8ec52';
const TEST_PRODUCT_ID = '6c9feb50-920f-45c4-9236-a72542fff36c';
const ORDER_QTY = 4; // 4 * 5 = 20 (Available = 10) -> Should only allow 2 orders
const CONCURRENCY = 5;

async function runTest() {
  console.log(`Starting concurrency test with ${CONCURRENCY} simultaneous orders of qty ${ORDER_QTY}...`);
  
  const payload = {
    email: 'concurrency-test@example.com',
    shipping_address: {
      first_name: 'Test',
      last_name: 'Runner',
      address1: '123 Concurrency Way',
      city: 'Tech City',
      zip: '12345',
      country: 'PAKISTAN'
    },
    items: [
      {
        product_id: TEST_PRODUCT_ID,
        variant_id: TEST_VARIANT_ID,
        quantity: ORDER_QTY,
        unit_price: 100,
        total_price: 100 * ORDER_QTY,
        title: 'Concurrency Test Item'
      }
    ],
    subtotal: 100 * ORDER_QTY,
    shipping_total: 0,
    tax_total: 0,
    total: 100 * ORDER_QTY,
    payment_method: 'cod'
  };

  const startTime = Date.now();
  
  const requests = Array.from({ length: CONCURRENCY }).map((_, i) => {
    console.log(`Launching request #${i + 1}...`);
    return supabase.rpc('create_order_secure', { payload });
  });

  const results = await Promise.all(requests);
  const duration = Date.now() - startTime;

  console.log(`\nTest finished in ${duration}ms`);
  
  let successes = 0;
  let failures = 0;
  let errors = [];

  results.forEach((res, i) => {
    if (res.error) {
      failures++;
      errors.push(res.error.message);
    } else {
      successes++;
    }
  });

  console.log(`--------------------------------`);
  console.log(`Total Successes: ${successes}`);
  console.log(`Total Failures:  ${failures}`);
  console.log(`Unique Errors:   ${[...new Set(errors)].join(' | ')}`);
  console.log(`--------------------------------`);

  // Final Stock Check
  const { data: stock } = await supabase
    .from('inventory_levels')
    .select('available')
    .eq('variant_id', TEST_VARIANT_ID)
    .single();

  console.log(`Final Available Stock: ${stock?.available}`);
  
  if (successes * ORDER_QTY + stock?.available === 10) {
    console.log('✅ TEST PASSED: Stock deduction is accurate.');
  } else {
    console.error('❌ TEST FAILED: Inconsistent stock count!');
  }
}

runTest();
