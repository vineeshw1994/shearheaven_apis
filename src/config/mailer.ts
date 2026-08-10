import nodemailer from 'nodemailer';
import { env } from './env';

export const mailTransporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.password,
  },
});

export async function verifyMailConnection(): Promise<boolean> {
  if (!env.smtp.user || !env.smtp.password) {
    return false;
  }

  try {
    await mailTransporter.verify();
    return true;
  } catch {
    return false;
  }
}

export default mailTransporter;
