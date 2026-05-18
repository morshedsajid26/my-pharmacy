import nodemailer from "nodemailer";

// Create reusable transporter object using SMTP transport configuration
const getTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465");
  const secure = process.env.SMTP_SECURE === "false" ? false : true;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
};

export async function sendOtpEmail(toEmail, otpCode) {
  const transporter = getTransporter();

  // Premium, highly professional medical styled HTML email
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 20px; text-align: center; color: #1e293b;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); border: 1px solid #e2e8f0;">
        <!-- Header -->
        <div style="background-color: #0284c7; padding: 30px; text-align: center;">
          <div style="display: inline-block; width: 40px; height: 40px; background-color: rgba(255,255,255,0.2); border-radius: 10px; line-height: 40px; color: #ffffff; font-weight: 900; font-size: 20px; margin-bottom: 10px;">S</div>
          <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: 0.5px;">S&S Pharmacy</h1>
          <p style="color: #e0f2fe; font-size: 12px; margin: 5px 0 0 0; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Smart Pharmacy Management</p>
        </div>
        
        <!-- Body Content -->
        <div style="padding: 40px 30px; text-align: center;">
          <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 10px;">Verification Code</h2>
          <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 30px;">You are resetting your account password. Please enter the following 6-digit OTP code to verify your identity.</p>
          
          <!-- OTP Box -->
          <div style="background-color: #f0f9ff; border: 2px dashed #0284c7; border-radius: 12px; padding: 20px; margin: 0 auto 30px auto; max-width: 250px; text-align: center;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 800; color: #0284c7; letter-spacing: 4px;">${otpCode}</span>
          </div>
          
          <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 0;">This OTP verification code is valid for <strong>10 minutes</strong>. If you did not request this verification, you can safely ignore this email.</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center;">
          <p style="font-size: 11px; color: #94a3b8; margin: 0; font-weight: 500;">&copy; ${new Date().getFullYear()} PharmaPro. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`\n======================================================`);
    console.log(`⚠️  EMAIL NOT SENT: SMTP_USER or SMTP_PASS not set in .env`);
    console.log(`🔑 FOR TESTING, USE OTP: ${otpCode}`);
    console.log(`======================================================\n`);
    return false;
  }

  try {
    const fromName = process.env.SMTP_FROM || "PharmaPro <noreply@pharmapro.com>";
    await transporter.sendMail({
      from: fromName,
      to: toEmail,
      subject: `🔑 [PharmaPro] Password Reset Verification Code: ${otpCode}`,
      html: htmlContent,
    });
    console.log(`📬 Real OTP email successfully sent to: ${toEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send SMTP email:", error);
    return false;
  }
}
