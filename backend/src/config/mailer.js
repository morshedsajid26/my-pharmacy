import nodemailer from "nodemailer";

const getTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE === "false" ? false : true;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

export async function sendOtpEmail(toEmail, otpCode) {
  const transporter = getTransporter();

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 20px; text-align: center; color: #1e293b;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <div style="background-color: #0284c7; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0;">S&S Pharmacy</h1>
          <p style="color: #e0f2fe; font-size: 12px; margin: 5px 0 0 0; text-transform: uppercase;">Smart Pharmacy Management</p>
        </div>
        <div style="padding: 40px 30px; text-align: center;">
          <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 0;">Verification Code</h2>
          <p style="font-size: 14px; color: #64748b;">You requested to reset your password. Use the OTP code below to verify your identity.</p>
          <div style="background-color: #f0f9ff; border: 2px dashed #0284c7; border-radius: 12px; padding: 20px; margin: 25px auto; max-width: 250px;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 800; color: #0284c7; letter-spacing: 4px;">${otpCode}</span>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">This code is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
        </div>
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 15px;">
          <p style="font-size: 11px; color: #94a3b8; margin: 0;">&copy; ${new Date().getFullYear()} S&S Pharmacy. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`\n======================================================`);
    console.log(`⚠️ EMAIL SIMULATION (SMTP_USER/PASS not configured)`);
    console.log(`📧 Target Email: ${toEmail}`);
    console.log(`🔑 OTP Code: ${otpCode}`);
    console.log(`======================================================\n`);
    return true; // allow simulation for development
  }

  try {
    const fromName = process.env.SMTP_FROM || "S&S Pharmacy <noreply@pharmapro.com>";
    await transporter.sendMail({
      from: fromName,
      to: toEmail,
      subject: `🔑 [S&S Pharmacy] Password Reset Verification Code: ${otpCode}`,
      html: htmlContent,
    });
    console.log(`📬 OTP email successfully sent to: ${toEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send SMTP email:", error);
    return false;
  }
}
