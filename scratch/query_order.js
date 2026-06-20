const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lyspgexajaanwcqszckq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5c3BnZXhhamFhbndjcXN6Y2txIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgxNjczOCwiZXhwIjoyMDk3MzkyNzM4fQ.qezIWz997ulG9fimTGstfcG52i3bKY_jWYkpP3Y3MJs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('email', 'kauan.santos1404207@gmail.com');
    
    if (error) {
      console.error('Error fetching orders:', error);
      return;
    }
    console.log('Orders found:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

check();
