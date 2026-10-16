import SSLCommerzPayment from "sslcommerz-lts";

async function test() {
  const store_id = "sspha6ac73fcc979da";
  const store_passwd = "sspha6ac73fcc979da@ssl";
  const is_live = false; 

  const sslcommerz = new SSLCommerzPayment(store_id, store_passwd, is_live);

  const data = {
    total_amount: 100,
    currency: 'BDT',
    tran_id: 'TXN-' + Date.now(),
    success_url: 'http://localhost:3000/api/payment/success',
    fail_url: 'http://localhost:3000/api/payment/fail',
    cancel_url: 'http://localhost:3000/api/payment/cancel',
    ipn_url: 'http://localhost:3000/api/payment/ipn',
    shipping_method: 'Courier',
    product_name: 'Medicines',
    product_category: 'Health',
    product_profile: 'general',
    cus_name: 'Test Customer',
    cus_email: 'test@test.com',
    cus_add1: 'Dhaka',
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: '01711111111',
    ship_name: 'Test Customer',
    ship_add1: 'Dhaka',
    ship_city: 'Dhaka',
    ship_state: 'Dhaka',
    ship_postcode: 1000,
    ship_country: 'Bangladesh',
  };
  
  try {
    const apiResponse = await sslcommerz.init(data);
    console.log("Success:", apiResponse);
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
  
  try {
    const apiResponse = await sslcommerz.init(data);
    console.log("Success:", apiResponse);
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
