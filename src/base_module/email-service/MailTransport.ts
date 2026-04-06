import { createTransport } from "nodemailer";

export const mailTransport = createTransport({
  host: process.env.APP_MAILER_HOST,
  port: process.env.APP_MAILER_PORT || 465,
  secure: process.env.APP_MAILER_SECURE,
  auth: { user: process.env.APP_MAILER_USER, pass: process.env.APP_MAILER_PASSWORD },
});
