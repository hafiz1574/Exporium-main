import nodemailer from "nodemailer";
import https from "node:https";

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

function getEmailFrom() {
  return process.env.EMAIL_FROM || process.env.SMTP_FROM || "no-reply@exporium";
}

function getReplyTo() {
  return process.env.EMAIL_REPLY_TO || process.env.REPLY_TO;
}

function getBrevoApiKey() {
  return process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY;
}

function parseFrom(from: string) {
  // Supports:
  // - "Name <email@domain.com>"
  // - "email@domain.com"
  const match = from.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/);
  if (match) {
    const name = match[1]?.trim();
    const email = match[2]?.trim();
    return { name: name || undefined, email };
  }

  return { name: undefined, email: from.trim() };
}

async function sendViaBrevoApi({ to, subject, text, html }: SendEmailParams) {
  const apiKey = getBrevoApiKey();
  if (!apiKey) return { ok: false as const, error: "Missing BREVO_API_KEY" };

  const fromRaw = getEmailFrom();
  const fromParsed = parseFrom(fromRaw);
  const replyToRaw = getReplyTo();
  const replyToParsed = replyToRaw ? parseFrom(replyToRaw) : undefined;

  const payload: any = {
    sender: {
      email: fromParsed.email,
      ...(fromParsed.name ? { name: fromParsed.name } : {})
    },
    to: [{ email: to }],
    subject,
    textContent: text,
    ...(html ? { htmlContent: html } : {})
  };

  if (replyToParsed?.email) {
    payload.replyTo = {
      email: replyToParsed.email,
      ...(replyToParsed.name ? { name: replyToParsed.name } : {})
    };
  }

  const body = JSON.stringify(payload);

  return await new Promise<{ ok: true } | { ok: false; error: string; statusCode?: number; response?: string }>(
    (resolve) => {
      const req = https.request(
        {
          method: "POST",
          hostname: "api.brevo.com",
          path: "/v3/smtp/email",
          headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body)
          },
          timeout: 15_000
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (d) => chunks.push(Buffer.from(d)));
          res.on("end", () => {
            const responseText = Buffer.concat(chunks).toString("utf8");
            const statusCode = res.statusCode ?? 0;
            if (statusCode >= 200 && statusCode < 300) return resolve({ ok: true });
            return resolve({
              ok: false,
              error: "Brevo API send failed",
              statusCode,
              response: responseText
            });
          });
        }
      );

      req.on("timeout", () => {
        req.destroy(new Error("Brevo API request timeout"));
      });

      req.on("error", (err) => {
        resolve({ ok: false, error: err?.message || "Brevo API request error" });
      });

      req.write(body);
      req.end();
    }
  );
}

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const smtp = getSmtpConfig();
  if (!smtp) return null;

  const isProd = process.env.NODE_ENV === "production";
  cachedTransporter = nodemailer.createTransport({
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
    },
    logger: !isProd,
    debug: !isProd
  });

  return cachedTransporter;
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  const from = getEmailFrom();
  const replyTo = getReplyTo();

  const smtp = getSmtpConfig();
  const brevoApiKey = getBrevoApiKey();

  if (!smtp && !brevoApiKey) {
    // eslint-disable-next-line no-console
    console.log("[email:disabled]", { to, subject });
    return;
  }

  // If SMTP is not configured, use Brevo API.
  if (!smtp && brevoApiKey) {
    const result = await sendViaBrevoApi({ to, subject, text, html });
    if (!result.ok) {
      // eslint-disable-next-line no-console
      console.error("[email:error]", { to, subject, via: "brevo_api", ...result });
    } else {
      // eslint-disable-next-line no-console
      console.log("[email:sent]", { to, subject, via: "brevo_api" });
    }
    return;
  }

  const transporter = getTransporter();
  if (!transporter) {
    // Transport not available; try Brevo API if configured.
    if (brevoApiKey) {
      const result = await sendViaBrevoApi({ to, subject, text, html });
      if (!result.ok) {
        // eslint-disable-next-line no-console
        console.error("[email:error]", { to, subject, via: "brevo_api", ...result });
      } else {
        // eslint-disable-next-line no-console
        console.log("[email:sent]", { to, subject, via: "brevo_api" });
      }
      return;
    }

    // eslint-disable-next-line no-console
    console.log("[email:disabled]", { to, subject });
    return;
  }

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
      rejected: (info as any)?.rejected,
      via: "smtp"
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
      responseCode: anyErr?.responseCode,
      via: "smtp"
    });

    // Fallback to Brevo API if available.
    if (brevoApiKey) {
      const result = await sendViaBrevoApi({ to, subject, text, html });
      if (!result.ok) {
        // eslint-disable-next-line no-console
        console.error("[email:error]", { to, subject, via: "brevo_api", ...result });
      } else {
        // eslint-disable-next-line no-console
        console.log("[email:sent]", { to, subject, via: "brevo_api" });
      }
    }
  }
}
