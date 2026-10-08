async function test() {
  const url = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";
  
  const data = new URLSearchParams();
  data.append('store_id', 'sspha6ac73fcc979da');
  data.append('store_passwd', 'sspha6ac73fcc979da@ssl');
  data.append('total_amount', '100');
  data.append('currency', 'BDT');
  data.append('tran_id', 'TXN-' + Date.now());
  data.append('success_url', 'http://localhost:3000/api/payment/success');
  data.append('fail_url', 'http://localhost:3000/api/payment/fail');
  data.append('cancel_url', 'http://localhost:3000/api/payment/cancel');
  data.append('cus_name', 'Test');
  data.append('cus_email', 'test@test.com');
  data.append('cus_add1', 'Dhaka');
  data.append('cus_city', 'Dhaka');
  data.append('cus_state', 'Dhaka');
  data.append('cus_postcode', '1000');
  data.append('cus_country', 'Bangladesh');
  data.append('cus_phone', '01711111111');
  data.append('shipping_method', 'NO');
  data.append('product_name', 'Test');
  data.append('product_category', 'Test');
  data.append('product_profile', 'general');

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: data
    });
    
    const text = await res.text();
    console.log(text);
  } catch (error) {
    console.error(error);
  }
}
test();
