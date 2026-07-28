export function otpEmail(otp) {
  return `
    <h2>Verify Your Email</h2>
    <p>Your OTP code is:</p>
    <h1 style="letter-spacing:8px;font-size:32px;background:#f0f0f0;padding:16px;text-align:center">${otp}</h1>
    <p>This code expires in 10 minutes.</p>
  `;
}

export function resetPasswordEmail(link) {
  return `
    <h2>Reset Your Password</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${link}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px">Reset Password</a>
    <p>Link expires in 10 minutes.</p>
  `;
}
