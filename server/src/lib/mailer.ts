import nodemailer from "nodemailer";

type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) return null;

  const secureEnv = process.env.SMTP_SECURE;
  const secure = secureEnv ? secureEnv.toLowerCase() === "true" : port === 465;

  return { host, port, user, pass, secure };
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || "no-reply@exporium";

  const smtp = getSmtpConfig();
  if (!smtp) {
    // eslint-disable-next-line no-console
    console.log("[email:disabled]", { to, subject, text });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass
    }
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });
}
