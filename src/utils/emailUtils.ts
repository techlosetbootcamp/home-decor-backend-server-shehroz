const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(
  email: string,
  otp: string
): Promise<void> {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email",
    text: `Your OTP for email verification is: ${otp}`,
    html: `<p>Your OTP for email verification is: <strong>${otp}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
}

async function sendResetPasswordEmail(
  email: string,
  otp: string
): Promise<void> {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your Password",
    text: `Your OTP for resetting the password is: ${otp}`,
    html: `<p>Your OTP for resetting the password is: <strong>${otp}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
}

export { sendVerificationEmail, sendResetPasswordEmail };
