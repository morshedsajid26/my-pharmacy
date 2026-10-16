export function getSslCommerz() {
  return {
    init: async (dataObj) => {
      const store_id = process.env.STORE_ID || "testbox";
      const store_passwd = process.env.STORE_PASSWORD || "testbox@ssl";
      
      const url = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";
      
      const formData = new URLSearchParams();
      formData.append('store_id', store_id);
      formData.append('store_passwd', store_passwd);
      
      for (const [key, value] of Object.entries(dataObj)) {
        formData.append(key, value);
      }
      
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData.toString()
        });
        
        const result = await res.json();
        return result;
      } catch (error) {
        console.error("SSLCommerz Fetch Error:", error);
        throw new Error("Failed to reach SSLCommerz gateway");
      }
    }
  };
}
