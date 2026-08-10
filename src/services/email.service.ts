import { mailTransporter } from '../config/mailer';
import { env } from '../config/env';
import { buildOtpEmailHtml, buildOtpEmailText } from './email.template';
import { logger } from '../utils/logger';

export async function sendOtpEmail(
  to: string,
  otp: string,
  recipientName?: string
): Promise<void> {
  try {
    await mailTransporter.sendMail({
      from: `"${env.smtp.fromName}" <${env.smtp.user}>`,
      to,
      subject: 'Verify Your Email - Shear Heaven',
      text: buildOtpEmailText(otp),
      html: buildOtpEmailHtml(otp, recipientName),
    });
  } catch (error) {
    logger.error('Failed to send OTP email', {
      error: error instanceof Error ? error.message : 'Unknown error',
      to,
    });
    throw error;
  }
}
