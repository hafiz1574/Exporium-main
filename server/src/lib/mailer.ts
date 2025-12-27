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
  const replyTo = process.env.EMAIL_REPLY_TO || process.env.REPLY_TO;

  const smtp = getSmtpConfig();
  if (!smtp) {
    // eslint-disable-next-line no-console
    console.log("[email:disabled]", { to, subject });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    requireTLS: !smtp.secure,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    auth: {
      user: smtp.user,
      pass: smtp.pass
    }
  });

  try {
    const info = await transporter.sendMail({
      from,
      replyTo,
      to,
      subject,
      text,
      html
    });

    // eslint-disable-next-line no-console
    console.log("[email:sent]", {
      to,
      subject,
      messageId: (info as any)?.messageId,
      accepted: (info as any)?.accepted,
      rejected: (info as any)?.rejected
    });
  } catch (err) {
    const anyErr = err as any;
    // eslint-disable-next-line no-console
    console.error("[email:error]", {
      to,
      subject,
      message: anyErr?.message,
      code: anyErr?.code,
      response: anyErr?.response,
      responseCode: anyErr?.responseCode
    });
  }
}
