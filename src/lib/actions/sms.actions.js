'use server';

export async function sendOtpSmsAction(phone, otpCode) {
  try {
    // ------------------------------------------------------------------
    // TODO: INTEGRATE YOUR SMS GATEWAY HERE
    // Example for a typical Bangladesh SMS Provider (e.g., BulkSMSBD, GreenWebSMS)
    // ------------------------------------------------------------------
    
    // const SMS_API_URL = "http://api.bulksmsbd.com/api/smsapi";
    // const API_KEY = process.env.SMS_API_KEY;
    // const SENDER_ID = process.env.SMS_SENDER_ID;
    
    // const message = `Your S&S Pharmacy verification code is: ${otpCode}. Valid for 10 minutes.`;

    // const response = await fetch(SMS_API_URL, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     api_key: API_KEY,
    //     senderid: SENDER_ID,
    //     number: phone,
    //     message: message
    //   })
    // });
    
    // const data = await response.json();
    // if (!response.ok) {
    //   throw new Error("Failed to send SMS via Gateway");
    // }

    console.log(`[SMS SIMULATION] Sent OTP: ${otpCode} to Phone: ${phone}`);
    
    // Return true assuming success for now until gateway is configured
    return { success: true, message: "OTP Sent successfully" };
  } catch (error) {
    console.error("SMS Send Error:", error);
    throw new Error("Failed to send OTP to your phone. Please try again.");
  }
}
