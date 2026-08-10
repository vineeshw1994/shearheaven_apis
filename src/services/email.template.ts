export function buildOtpEmailHtml(otp: string, recipientName?: string): string {
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hello,';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Shear Heaven</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f7fb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#6d28d9 0%,#9333ea 100%);padding:32px 24px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:0.5px;">Shear Heaven</h1>
              <p style="margin:8px 0 0;color:#ede9fe;font-size:14px;">Premium Pet Grooming</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 28px;">
              <h2 style="margin:0 0 12px;color:#0f172a;font-size:24px;font-weight:700;">Verify Your Email</h2>
              <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.6;">${greeting}<br>Use the verification code below to complete your email verification.</p>
              <div style="background:#f8fafc;border:2px dashed #c4b5fd;border-radius:12px;padding:28px;text-align:center;margin:0 0 24px;">
                <p style="margin:0 0 8px;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Your verification code is</p>
                <p style="margin:0;color:#6d28d9;font-size:42px;font-weight:800;letter-spacing:8px;font-family:'Courier New',monospace;">${otp}</p>
              </div>
              <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">This code will expire in <strong>5 minutes</strong>.</p>
              <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:16px 18px;">
                <p style="margin:0;color:#991b1b;font-size:14px;line-height:1.5;"><strong>Security notice:</strong> If you did not request this code, please ignore this email. Never share your verification code with anyone.</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:20px 28px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">&copy; ${new Date().getFullYear()} Shear Heaven. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildOtpEmailText(otp: string): string {
  return `Verify Your Email

Your verification code is:

${otp}

This code will expire in 5 minutes.

If you did not request this code, please ignore this email.

- Shear Heaven`;
}
